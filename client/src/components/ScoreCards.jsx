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

export default function ScoreCards({ scores, showBanner = true }) {
  const policyPasses = scores.policy.score >= 7

  return (
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
              <ul className="space-y-2.5">
                {result.issues.map((issue, i) => {
                  const finding = typeof issue === 'string' ? issue : issue.finding
                  const suggestion = typeof issue === 'object' ? issue.suggestion : null
                  return (
                    <li key={i} className="text-sm">
                      <div className="flex gap-2 text-gray-600">
                        <span className="text-gray-300 flex-shrink-0 mt-0.5">—</span>
                        <span>
                          {issue.source && (
                            <span className="text-xs font-medium text-gray-400 mr-1.5">[{issue.source}]</span>
                          )}
                          {finding}
                        </span>
                      </div>
                      {suggestion && (
                        <p className="text-xs text-blue-600 mt-1 ml-4">
                          Suggested fix: {suggestion}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}

      {showBanner && (
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
      )}
    </div>
  )
}
