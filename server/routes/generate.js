import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const promptPath = join(dirname(fileURLToPath(import.meta.url)), '../prompts/generator.md')

router.post('/', async (req, res) => {
  const { product } = req.body
  if (!product) return res.status(400).json({ error: 'Product data required' })

  try {
    const system = readFileSync(promptPath, 'utf8')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system,
      messages: [
        {
          role: 'user',
          content: [
            'Generate an ad for this product:',
            '',
            `Title: ${product.title}`,
            `Description: ${product.description || 'not provided'}`,
            `Price: ${product.price ? `₹${product.price}` : 'not provided'}`,
            `Tags: ${product.tags?.length ? product.tags.join(', ') : 'none'}`,
            '',
            'Return only a valid JSON object. No other text.',
          ].join('\n'),
        },
      ],
    })

    const raw = message.content[0].text.trim()
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('Model did not return a JSON object')
    const json = JSON.parse(raw.slice(start, end + 1))
    res.json(json)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

export default router
