import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a copywriter for Minimalist, an Indian skincare brand.

Brand voice: science-led, ingredient-first, clinical. The brand explicitly rejects "natural/clean" beauty positioning — "everything is a chemical" is a core belief.

Hard rules:
- Lead with the active ingredient and its concentration (e.g. "2% Salicylic Acid")
- No fear-based framing (no: "fight", "combat", "battle", "destroy")
- No superlatives without substantiation (no: "best", "most powerful", "revolutionary")
- No cure/treat language — ASCI code compliance for cosmetics in India
- No fairness, whitening, or skin-tone claims
- No unsubstantiated efficacy percentages
- Tone: precise, confident, minimal

Return only valid JSON with exactly these keys:
{
  "headline": "string — ≤8 words, ingredient-led",
  "body": "string — 1–2 sentences, mechanism-focused",
  "cta": "string — ≤4 words"
}`

router.post('/', async (req, res) => {
  const { product } = req.body
  if (!product) return res.status(400).json({ error: 'Product data required' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate an ad for this product:\n\nTitle: ${product.title}\nDescription: ${product.description}\nPrice: ₹${product.price}\nTags: ${product.tags.join(', ')}\n\nReturn only valid JSON.`,
        },
      ],
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
