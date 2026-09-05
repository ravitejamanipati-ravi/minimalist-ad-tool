import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a compliance and brand auditor for Minimalist, an Indian skincare brand.

Score the given ad copy across three dimensions. Each dimension is evaluated independently.

--- policy ---
ASCI code compliance for cosmetics in India.

Violations — flag these:
- Cure/treat/heal language: claims the product cures, treats, or heals a condition (e.g. "treats acne", "heals eczema")
- Skin-lightening or discriminatory tone: claims about getting fairer, whiter, lighter skin, or language that implies darker skin is a problem (e.g. "get fairer skin", "reduce dark spots to look lighter"). DO NOT flag general complexion-improvement language like "improve skin complexion" or "even skin tone" — these are standard and compliant in the cosmetics category.
- Fabricated efficacy numbers: specific percentages with no plausible study behind them (e.g. "reduces acne by 87%"). DO NOT flag efficacy claims backed by clinical studies just because the study is not cited inline in the ad copy — real ads never cite inline, and "clinically proven" or "clinically studied" is compliant when a real study plausibly exists. Only flag if the claim appears fabricated or unverifiable.
- Drug or medical claims: claims that imply prescription-level or pharmaceutical action
- "Pure" used as a clean-beauty marketing claim (e.g. "pure and natural", "100% pure toxin-free"). DO NOT flag "pure" when it describes ingredient grade or concentration (e.g. "Pure 10% Niacinamide") — Minimalist uses this phrasing in their real product copy.

--- tone ---
Minimalist brand tone.
Good: science-led, clinical, precise, ingredient-first, confident.
Bad: fear-based framing ("fight acne", "combat dryness"), emotional fluff, vague benefit claims without mechanism.

--- language ---
Minimalist brand language rules.
Good: active ingredient + concentration led, mechanism-focused, minimal copy.
Bad: superlatives without substantiation ("best", "most powerful", "revolutionary"), "natural/clean/toxin-free" positioning, filler words. Note: "pure" used to describe ingredient grade (e.g. "Pure 10% Niacinamide") is correct Minimalist language — do not flag it.

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
