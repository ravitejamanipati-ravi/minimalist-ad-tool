import { useState } from 'react'

const DIM = {
  policy:   { mark: 'bg-red-100 border-red-400',    tooltip: 'bg-red-50 border-red-200'    },
  tone:     { mark: 'bg-yellow-100 border-yellow-400', tooltip: 'bg-yellow-50 border-yellow-200' },
  language: { mark: 'bg-blue-100 border-blue-400',  tooltip: 'bg-blue-50 border-blue-200'  },
}

export default function HighlightedAd({ text, scores }) {
  const [open, setOpen] = useState(null)

  // Collect spans from all three dimensions
  const raw = []
  for (const [dim, result] of Object.entries(scores)) {
    for (const issue of result.issues ?? []) {
      if (!issue.span) continue
      const lower = text.toLowerCase()
      const idx = lower.indexOf(issue.span.toLowerCase())
      if (idx === -1) continue
      raw.push({
        start: idx,
        end: idx + issue.span.length,
        exact: text.slice(idx, idx + issue.span.length),
        dim,
        source: issue.source,
        finding: issue.finding,
        suggestion: issue.suggestion,
      })
    }
  }

  // Sort by position; drop overlapping spans (keep first)
  raw.sort((a, b) => a.start - b.start)
  const highlights = []
  let cursor = 0
  for (const h of raw) {
    if (h.start >= cursor) {
      highlights.push(h)
      cursor = h.end
    }
  }

  if (highlights.length === 0) return null

  // Build text segments
  const segments = []
  let pos = 0
  for (const h of highlights) {
    if (h.start > pos) segments.push({ type: 'text', content: text.slice(pos, h.start) })
    segments.push({ type: 'highlight', id: `${h.start}-${h.end}`, ...h })
    pos = h.end
  }
  if (pos < text.length) segments.push({ type: 'text', content: text.slice(pos) })

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Findings in context</p>
      <div className="border border-gray-200 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.type === 'text') return <span key={i}>{seg.content}</span>
          const colors = DIM[seg.dim]
          const isOpen = open === seg.id
          return (
            <span key={i} className="relative inline">
              <mark
                className={`${colors.mark} border-b-2 rounded-sm px-0.5 cursor-pointer bg-opacity-60`}
                onClick={() => setOpen(isOpen ? null : seg.id)}
              >
                {seg.exact}
              </mark>
              {isOpen && (
                <span
                  className={`absolute left-0 bottom-full mb-1.5 z-20 w-72 text-xs rounded border ${colors.tooltip} p-2.5 shadow-lg whitespace-normal`}
                >
                  {seg.source && (
                    <span className="block font-medium text-gray-500 mb-1">[{seg.source}]</span>
                  )}
                  <span className="block text-gray-800 mb-1">{seg.finding}</span>
                  {seg.suggestion && (
                    <span className="block text-gray-500">Fix: {seg.suggestion}</span>
                  )}
                </span>
              )}
            </span>
          )
        })}
      </div>
      <p className="text-xs text-gray-400">
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-400 mr-1 align-middle" />Policy
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-100 border border-yellow-400 mx-1 ml-3 align-middle" />Tone
        <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-400 mx-1 ml-3 align-middle" />Language
        · Click a highlight to see the finding
      </p>
    </div>
  )
}
