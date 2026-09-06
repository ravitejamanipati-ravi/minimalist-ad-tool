import { useState } from 'react'
import ScoreCards from '../components/ScoreCards.jsx'
import HighlightedAd from '../components/HighlightedAd.jsx'

export default function Scorer({ adText, setAdText, scores, setScores }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function score() {
    setError(null)
    setScores(null)
    setLoading(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to score ad')
      setScores(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-wide leading-snug">Ad Scorer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ads generated in this tool are scored automatically. Use this tab to score any other ad
          copy — a different draft, a competitor comparison, or anything a reviewer wants checked
          before it goes live.
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          value={adText}
          onChange={e => setAdText(e.target.value)}
          rows={6}
          placeholder="Paste your ad copy here…"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
        <button
          onClick={score}
          disabled={!adText.trim() || loading}
          className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-40 hover:bg-gray-800 transition-colors"
        >
          {loading ? 'Scoring…' : 'Score Ad'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {scores && (
        <div className="space-y-6">
          <HighlightedAd text={adText} scores={scores} />
          <div className={`rounded-lg px-5 py-4 text-sm font-medium border ${
            scores.policy.score >= 7
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {scores.policy.score >= 7
              ? 'Cleared for export — policy compliance passed.'
              : 'Export blocked — policy compliance must score ≥ 7.'}
          </div>
          <ScoreCards scores={scores} showBanner={false} />
        </div>
      )}
    </div>
  )
}
