import { Router } from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = Router()
const dir = join(dirname(fileURLToPath(import.meta.url)), '../prompts')
const read = f => readFileSync(join(dir, f), 'utf8')

const FILE_MAP = {
  generator: 'generator.md',
  policy: 'scorer-policy.md',
  tone: 'scorer-tone.md',
  language: 'scorer-language.md',
}

router.get('/', (req, res) => {
  res.json({
    generator: read('generator.md'),
    policy: read('scorer-policy.md'),
    tone: read('scorer-tone.md'),
    language: read('scorer-language.md'),
  })
})

router.post('/:name', (req, res) => {
  const file = FILE_MAP[req.params.name]
  if (!file) return res.status(400).json({ error: `Unknown prompt: ${req.params.name}` })

  const { content } = req.body
  if (typeof content !== 'string') return res.status(400).json({ error: 'content must be a string' })

  try {
    writeFileSync(join(dir, file), content, 'utf8')
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
