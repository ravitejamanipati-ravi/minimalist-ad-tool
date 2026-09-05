import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })

  // Matches both:
  //   beminimalist.co/products/{handle}
  //   beminimalist.co/collections/{slug}/products/{handle}
  const match = url.match(/beminimalist\.co(?:\/collections\/[^/?#]+)?\/products\/([^/?#]+)/)
  if (!match) return res.status(400).json({ error: 'Not a valid beminimalist.co product URL' })

  const handle = match[1]

  try {
    const response = await fetch(`https://beminimalist.co/products/${handle}.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MinimalistAdTool/1.0)' },
    })
    if (!response.ok) {
      return res.status(response.status).json({ error: `Shopify returned ${response.status}` })
    }

    const { product: p } = await response.json()
    const variant = p.variants?.[0]
    const image = p.images?.[0]

    res.json({
      id: p.id,
      handle: p.handle,
      title: p.title,
      description: p.body_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '',
      price: variant?.price ?? null,
      imageUrl: image?.src ?? null,
      tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      variants: p.variants?.map(v => ({ id: v.id, title: v.title, price: v.price })) ?? [],
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

export default router
