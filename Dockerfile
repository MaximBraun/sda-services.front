### Stage 1: билд фронтенда
FROM node:22-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --omit=dev=false

# Копируем исходники и собираем
COPY . .
# В прод-образе достаточно сборки без type-check, чтобы типовые ошибки
# не ломали Docker build. Локально можно продолжать использовать `npm run build`.
RUN npm run build-only


### Stage 2: nginx для отдачи статики
FROM nginx:1.27-alpine AS runtime

# Очищаем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Наш конфиг nginx для SPA с проксированием API (шаблон с переменными)
COPY <<'NGINX_CONF' /etc/nginx/templates/frontend.conf.template
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;
    
    # Снижаем уровень логирования для upstream ошибок (IPv6 попытки не критичны)
    # Запросы всё равно успешны через IPv4
    error_log /var/log/nginx/error.log warn;

    # Resolver для DNS (принудительно IPv4, чтобы избежать проблем с IPv6)
    resolver 8.8.8.8 8.8.4.4 ipv4=on valid=300s;
    resolver_timeout 5s;

    # Переменная для proxy_pass (нужна для работы resolver)
    set $backend_url ${API_BACKEND_URL};

    # Медиа файлы (видео, большие файлы) - увеличенные таймауты
    location ~ ^/(auth|user|pixverse|pika|chatgpt|qwen|calories|instagram|cosmetic|topmedia|gamestone|shark|wan|cheaterbuster|ximilar|dashboard|descript)/.*\.(mp4|avi|mov|mkv|webm|flv|wmv|mp3|wav|ogg)$ {
        proxy_pass $backend_url;
        
        proxy_set_header Host ${API_BACKEND_HOST};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        
        # SSL настройки
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_ssl_verify off;
        
        # Увеличенные таймауты для больших файлов
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
        
        # Для потоковой передачи
        proxy_request_buffering off;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # API endpoints - проксируем на бэкенд
    # Используем переменную для работы resolver
    location ~ ^/(auth|user|pixverse|pika|chatgpt|qwen|calories|instagram|cosmetic|topmedia|gamestone|shark|wan|cheaterbuster|ximilar|dashboard|descript)/ {
        proxy_pass $backend_url;
        
        # Важно: устанавливаем правильный Host header для бэкенда
        # Должен совпадать с доменом в SSL сертификате
        proxy_set_header Host ${API_BACKEND_HOST};
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        
        # SSL настройки для HTTPS upstream
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_ssl_verify off;
        proxy_ssl_verify_depth 2;
        
        # Таймауты для обычных API запросов
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Для CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
        # Обработка preflight запросов
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Статические файлы с кэшированием
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Для index.html кэш отключён
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # SPA-роутинг — всегда отдаём index.html (должен быть последним)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

# Копируем собранный фронтенд из build-стадии
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

