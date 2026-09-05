import { useState } from 'react'

const DIMENSIONS = [
  {
    key: 'policy',
    label: 'Policy Compliance',
    owner: 'Legal',
    description: 'ASCI code: no cure/treat language, no fairness claims, no unsubstantiated efficacy %',
    blocking: true,
  },
  {
    key: 'tone',
    label: 'Brand Tone',
    owner: 'Brand team',
    description: 'Science-led, clinical, ingredient-first. No fear-based framing.',
    blocking: false,
  },
  {
    key: 'language',
    label: 'Brand Language',
    owner: 'Copywriter',
    description: 'No superlatives without substantiation. No "natural/clean/pure" positioning.',
    blocking: false,
  },
]

function ScoreBadge({ score, blocking }) {
  const pass = score >= 7
  const color = pass
    ? 'bg-green-100 text-green-800'
    : blocking
    ? 'bg-red-100 text-red-800'
    : 'bg-yellow-100 text-yellow-800'
  const label = pass ? 'Pass' : blocking ? 'Blocked' : 'Warning'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {score}/10 · {label}
    </span>
  )
}

export default function Scorer() {
  const [adText, setAdText] = useState('')
  const [scores, setScores] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const policyPasses = scores && scores.policy.score >= 7

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
        <h1 className="text-xl font-semibold">Ad Scorer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Three independent dimensions. Policy failures block export. Tone and language warn.
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
        <div className="space-y-3">
          {DIMENSIONS.map(({ key, label, owner, description, blocking }) => {
            const result = scores[key]
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{label}</p>
                      <span className="text-xs text-gray-400">→ {owner}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                  </div>
                  <ScoreBadge score={result.score} blocking={blocking} />
                </div>
                <p className="text-sm text-gray-700">{result.rationale}</p>
                {result.issues?.length > 0 && (
                  <ul className="space-y-1">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-2">
                        <span className="text-gray-300 flex-shrink-0">—</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}

          <div
            className={`rounded-lg px-5 py-4 text-sm font-medium border ${
              policyPasses
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {policyPasses
              ? 'Cleared for export — policy compliance passed.'
              : 'Export blocked — policy compliance must score ≥ 7.'}
          </div>
        </div>
      )}
    </div>
  )
}
