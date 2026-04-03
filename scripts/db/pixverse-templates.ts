/**
 * Прямое чтение/обновление таблицы pixverse_templates в MySQL.
 * Выполняется только в Node на вашей машине; учётные данные — из .env (не в клиенте).
 *
 * Требуется Node 20+ (флаг --env-file) или задайте переменные окружения вручную.
 *
 * Примеры:
 *   npm run db:pixverse -- list --limit 20
 *   npm run db:pixverse -- get --id 5
 *   npm run db:pixverse -- get --template-id 12345
 *   npm run db:pixverse -- update --id 5 --name "New" --prompt "text" --category "cat" --is-active 1
 *   npm run db:pixverse -- update --template-id 12345 --name "New"
 */

import mysql from 'mysql2/promise'

const TABLE = 'pixverse_templates'

function normalizeMysqlUrl(raw: string): string {
  const t = raw.trim()
  if (!t) {
    throw new Error('DATABASE_URL пустой. Задайте в .env (см. .env.example).')
  }
  return t.replace(/^mysql\+[^:]+:\/\//i, 'mysql://')
}

function requireEnvUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'Нет DATABASE_URL. Добавьте в .env строку подключения (см. .env.example).',
    )
  }
  return normalizeMysqlUrl(url)
}

function printHelp(): void {
  console.log(`
Команды (после "npm run db:pixverse --"):

  list [--limit N]              список строк
  get --id <pk>                 строка по первичному ключу id
  get --template-id <platform>  строка по полю template_id (PixVerse)
  update --id <pk> [поля]       обновить по id
  update --template-id <id> [поля]

Поля для update (необязательно, укажите хотя бы одно):
  --name <str>
  --prompt <str>
  --category <str>
  --is-active 0|1              TINYINT в MySQL (допускается ещё true/false/yes/no)
  --preview-small <path>
  --preview-large <path>
  --template-id-set <int>       записать в колонку template_id

Переменная окружения: DATABASE_URL (mysql:// или mysql+aiomysql://...)
`)
}

type Parsed = {
  cmd: string
  limit: number
  id: number | null
  templateId: number | null
  sets: Record<string, string | number>
}

/** Колонка is_active — TINYINT: в БД пишем строго 0 или 1. */
function parseTinyint01(s: string): 0 | 1 {
  const v = s.toLowerCase().trim()
  if (v === '1' || v === 'true' || v === 'yes') return 1
  if (v === '0' || v === 'false' || v === 'no') return 0
  throw new Error(
    `Для --is-active ожидалось 0 или 1 (или true/false), получено: ${s}`,
  )
}

function parseArgs(argv: string[]): Parsed {
  const args = argv.slice(2)
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printHelp()
    process.exit(0)
  }

  const cmd = args[0]
  let limit = 50
  let id: number | null = null
  let templateId: number | null = null
  const sets: Record<string, string | number> = {}

  for (let i = 1; i < args.length; i++) {
    const a = args[i]
    const next = () => {
      const v = args[++i]
      if (v === undefined) throw new Error(`После ${a} нужно значение`)
      return v
    }
    switch (a) {
      case '--limit':
        limit = Number(next())
        break
      case '--id':
        id = Number(next())
        break
      case '--template-id':
        templateId = Number(next())
        break
      case '--name':
        sets.name = next()
        break
      case '--prompt':
        sets.prompt = next()
        break
      case '--category':
        sets.category = next()
        break
      case '--is-active':
        sets.is_active = parseTinyint01(next())
        break
      case '--preview-small':
        sets.preview_small = next()
        break
      case '--preview-large':
        sets.preview_large = next()
        break
      case '--template-id-set':
        sets.template_id = Number(next())
        break
      default:
        throw new Error(`Неизвестный аргумент: ${a}`)
    }
  }

  return { cmd, limit, id, templateId, sets }
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv)
  const conn = await mysql.createConnection(requireEnvUrl())

  try {
    if (parsed.cmd === 'list') {
      const [rows] = await conn.query(
        `SELECT id, template_id, name, prompt, category, is_active,
                LEFT(preview_small, 80) AS preview_small_snip,
                LEFT(preview_large, 80) AS preview_large_snip,
                auth_user_id
         FROM ?? ORDER BY id DESC LIMIT ?`,
        [TABLE, Math.min(Math.max(1, parsed.limit), 500)],
      )
      console.table(rows)
      return
    }

    if (parsed.cmd === 'get') {
      if (parsed.id != null && !Number.isFinite(parsed.id)) {
        throw new Error('Некорректный --id')
      }
      if (parsed.templateId != null && !Number.isFinite(parsed.templateId)) {
        throw new Error('Некорректный --template-id')
      }
      if (parsed.id != null) {
        const [rows] = await conn.query(`SELECT * FROM ?? WHERE id = ?`, [
          TABLE,
          parsed.id,
        ])
        console.log(rows)
        return
      }
      if (parsed.templateId != null) {
        const [rows] = await conn.query(
          `SELECT * FROM ?? WHERE template_id = ?`,
          [TABLE, parsed.templateId],
        )
        console.log(rows)
        return
      }
      throw new Error('Для get укажите --id или --template-id')
    }

    if (parsed.cmd === 'update') {
      const keys = Object.keys(parsed.sets)
      if (keys.length === 0) {
        throw new Error('Для update укажите хотя бы одно поле (--name, --prompt, ...)')
      }
      const allowed = new Set([
        'name',
        'prompt',
        'category',
        'is_active',
        'preview_small',
        'preview_large',
        'template_id',
      ])
      for (const k of keys) {
        if (!allowed.has(k)) throw new Error(`Недопустимое поле: ${k}`)
      }

      const fragments: string[] = []
      const values: unknown[] = [TABLE]
      for (const k of keys) {
        fragments.push(`?? = ?`)
        values.push(k, parsed.sets[k])
      }

      let whereSql: string
      if (parsed.id != null) {
        whereSql = 'WHERE id = ?'
        values.push(parsed.id)
      } else if (parsed.templateId != null) {
        whereSql = 'WHERE template_id = ?'
        values.push(parsed.templateId)
      } else {
        throw new Error('Для update укажите --id или --template-id')
      }

      const sql = `UPDATE ?? SET ${fragments.join(', ')} ${whereSql}`
      const [res] = await conn.query(sql, values)
      console.log(res)
      return
    }

    throw new Error(`Неизвестная команда: ${parsed.cmd}. См. --help`)
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
