import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a compliance and brand auditor for Minimalist, an Indian skincare brand.

Score the given ad copy across three dimensions. Each dimension is evaluated independently.

--- policy ---
ASCI code compliance for cosmetics in India.
Violations: cure/treat/heal language, fairness or skin-tone claims, unsubstantiated efficacy percentages (e.g. "reduces acne by 87%"), drug or medical claims.

--- tone ---
Minimalist brand tone.
Good: science-led, clinical, precise, ingredient-first, confident.
Bad: fear-based framing ("fight acne", "combat dryness"), emotional fluff, vague benefit claims without mechanism.

--- language ---
Minimalist brand language rules.
Good: active ingredient + concentration led, mechanism-focused, minimal copy.
Bad: superlatives without substantiation ("best", "most powerful", "revolutionary"), "natural/clean/pure" positioning, filler words.

Return only valid JSON:
{
  "policy":   { "score": <1-10>, "rationale": "<1 sentence>", "issues": ["<specific violation>"] },
  "tone":     { "score": <1-10>, "rationale": "<1 sentence>", "issues": ["<specific issue>"] },
  "language": { "score": <1-10>, "rationale": "<1 sentence>", "issues": ["<specific issue>"] }
}

Score 10 = perfect. Issues array is empty when score ≥ 7.`

router.post('/', async (req, res) => {
  const { adText } = req.body
  if (!adText?.trim()) return res.status(400).json({ error: 'Ad text required' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
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
