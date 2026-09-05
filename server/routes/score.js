import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const promptDir = join(dirname(fileURLToPath(import.meta.url)), '../prompts')
const read = f => readFileSync(join(promptDir, f), 'utf8')

const PREAMBLE = `You are a compliance and brand auditor for Minimalist, an Indian skincare brand.

Score the given ad copy across three dimensions. Each dimension is evaluated independently.`

const OUTPUT_FORMAT = `Return only valid JSON:
{
  "policy":   { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "finding": "<violation>", "suggestion": "<one-line compliance-safe rewrite>" }] },
  "tone":     { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "finding": "<issue>",     "suggestion": "<one-line tone-appropriate alternative>" }] },
  "language": { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "finding": "<issue>",     "suggestion": "<one-line ingredient-first restructure>" }] }
}

Score 10 = perfect. Issues array is empty when score ≥ 7.`

router.post('/', async (req, res) => {
  const { adText } = req.body
  if (!adText?.trim()) return res.status(400).json({ error: 'Ad text required' })

  try {
    const system = [
      PREAMBLE,
      read('scorer-policy.md'),
      read('scorer-tone.md'),
      read('scorer-language.md'),
      OUTPUT_FORMAT,
    ].join('\n\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: `Score this ad:\n\n${adText}` }],
    })

    const text = message.content[0].text.trim()
    const json = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ''))
    res.json(json)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

export default router
