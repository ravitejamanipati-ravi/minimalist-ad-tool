import { useState } from 'react'

export default function Generator() {
  const [url, setUrl] = useState('')
  const [product, setProduct] = useState(null)
  const [ad, setAd] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadingAd, setLoadingAd] = useState(false)
  const [error, setError] = useState(null)

  async function fetchProduct() {
    setError(null)
    setProduct(null)
    setAd(null)
    setLoadingProduct(true)
    try {
      const res = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch product')
      setProduct(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingProduct(false)
    }
  }

  async function generateAd() {
    setError(null)
    setAd(null)
    setLoadingAd(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate ad')
      setAd(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoadingAd(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Ad Generator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste a beminimalist.co product URL. Product photo is real — no AI-generated imagery.
        </p>
      </div>

      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && url && !loadingProduct && fetchProduct()}
          placeholder="https://beminimalist.co/products/salicylic-acid-2"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          onClick={fetchProduct}
          disabled={!url || loadingProduct}
          className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {loadingProduct ? 'Fetching…' : 'Fetch'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {product && (
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <div className="flex gap-4 items-start">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-24 h-24 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="space-y-1 min-w-0">
              <p className="font-medium text-sm">{product.title}</p>
              <p className="text-xs text-gray-400">{product.handle}</p>
              {product.price && <p className="text-sm">₹{product.price}</p>}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {product.tags.slice(0, 5).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={generateAd}
            disabled={loadingAd}
            className="w-full py-2 border border-black text-sm rounded hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          >
            {loadingAd ? 'Generating…' : 'Generate Ad'}
          </button>
        </div>
      )}

      {ad && product && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Generated Ad</p>
          </div>

          {/* Composed creative: real product photo + copy overlay */}
          <div className="relative bg-gray-50">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full max-h-80 object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-5 py-4">
              <p className="font-semibold text-lg leading-tight">{ad.headline}</p>
              <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{ad.cta}</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-semibold">{ad.headline}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{ad.body}</p>
            <span className="inline-block text-xs font-medium uppercase tracking-wider border border-black px-3 py-1.5">
              {ad.cta}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
