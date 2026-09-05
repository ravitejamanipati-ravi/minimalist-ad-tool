import { useState, useRef } from 'react'
import ScoreCards from '../components/ScoreCards.jsx'

export default function Generator() {
  const [url, setUrl] = useState('')
  const [product, setProduct] = useState(null)
  const [ad, setAd] = useState(null)
  const [scores, setScores] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadingAd, setLoadingAd] = useState(false)
  const [loadingScore, setLoadingScore] = useState(false)
  const [error, setError] = useState(null)
  const creativeRef = useRef(null)

  async function fetchProduct() {
    setError(null)
    setProduct(null)
    setAd(null)
    setScores(null)
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
    setScores(null)
    setLoadingAd(true)

    let generated = null
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate ad')
      generated = data
      setAd(data)
    } catch (e) {
      setError(e.message)
      return
    } finally {
      setLoadingAd(false)
    }

    // Auto-score the generated copy
    setLoadingScore(true)
    try {
      const adText = [generated.headline, generated.body, generated.cta].filter(Boolean).join(' ')
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adText }),
      })
      const data = await res.json()
      if (res.ok) setScores(data)
    } catch {
      // scoring failure is non-fatal — ad still shows
    } finally {
      setLoadingScore(false)
    }
  }

  async function exportPng() {
    if (!creativeRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(creativeRef.current, {
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 2,
    })
    const link = document.createElement('a')
    link.download = `${product.handle}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const policyPasses = scores?.policy?.score >= 7
  const exportBlocked = scores && !policyPasses

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
            disabled={loadingAd || loadingScore}
            className="w-full py-2 border border-black text-sm rounded hover:bg-black hover:text-white transition-colors disabled:opacity-40"
          >
            {loadingAd ? 'Generating…' : loadingScore ? 'Scoring…' : 'Generate Ad'}
          </button>
        </div>
      )}

      {ad && product && (
        <div className="space-y-4">
          {/* Composed creative — this element is captured for PNG export */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Generated Ad</p>
            </div>

            <div ref={creativeRef} className="bg-white">
              {product.imageUrl && (
                <div className="bg-gray-50 flex items-center justify-center p-6">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-h-72 w-auto object-contain"
                  />
                </div>
              )}
              <div className="px-5 py-4 space-y-3 border-t border-gray-100">
                <p className="text-lg font-semibold leading-tight">{ad.headline}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{ad.body}</p>
                <span className="inline-block text-xs font-medium uppercase tracking-wider border border-black px-3 py-1.5">
                  {ad.cta}
                </span>
              </div>
            </div>
          </div>

          {/* Export row */}
          <div className="flex items-center gap-3">
            <button
              onClick={exportPng}
              disabled={loadingScore || exportBlocked}
              className="px-4 py-2 border border-black text-sm rounded hover:bg-black hover:text-white transition-colors disabled:opacity-40"
            >
              Export as PNG
            </button>
            {loadingScore && (
              <span className="text-sm text-gray-400">Scoring…</span>
            )}
            {exportBlocked && (
              <span className="text-sm text-red-600">
                Export blocked — policy compliance must score ≥ 7
              </span>
            )}
            {scores && policyPasses && (
              <span className="text-sm text-green-600">Cleared for export</span>
            )}
          </div>

          {/* Auto-score cards */}
          {scores && <ScoreCards scores={scores} showBanner={false} />}
        </div>
      )}
    </div>
  )
}
