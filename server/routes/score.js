import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const promptDir = join(dirname(fileURLToPath(import.meta.url)), '../prompts')
const read = f => readFileSync(join(promptDir, f), 'utf8')

const PREAMBLE = `You are a compliance and brand auditor for Minimalist, an Indian skincare brand.

Score the given ad copy across three dimensions. Each dimension is evaluated independently.`

const OUTPUT_FORMAT = `Return only valid JSON. No explanation, no preamble, no markdown, no code fences.

FORMATTING RULES — you must follow these exactly:
- Every property must be followed by a comma EXCEPT the last property in each object
- No trailing commas after the last property in an object or array
- All string values must be properly closed with a double quote
- Escape any double quotes inside string values with a backslash
- Do not add comments

Schema:
{
  "policy":   { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "source": "ASCI Code" or "Brand Values", "span": "<exact substring from ad, or null>", "finding": "<violation>", "suggestion": "<compliance-safe rewrite>" }] },
  "tone":     { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "source": "Brand Values", "span": "<exact substring from ad, or null>", "finding": "<issue>", "suggestion": "<tone-appropriate alternative>" }] },
  "language": { "score": <1-10>, "rationale": "<1 sentence>", "issues": [{ "source": "Brand Values" or "Brand Usage", "span": "<exact substring from ad, or null>", "finding": "<issue>", "suggestion": "<ingredient-first restructure>" }] }
}

span: copy character-for-character from the ad text. Set to null when the finding is about an absence rather than a specific phrase.
Score 10 = perfect. Issues array is empty when score ≥ 7.`

function parseWithRepair(raw) {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Model did not return a JSON object')
  const slice = raw.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    // Attempt structural repair before giving up
    return JSON.parse(jsonrepair(slice))
  }
}

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
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: `Score this ad:\n\n${adText}` }],
    })

    const raw = message.content[0].text.trim()
    const json = parseWithRepair(raw)
    res.json(json)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

export default router
