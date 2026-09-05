import { useState, useEffect } from 'react'

const TABS = [
  { key: 'generator', label: 'Generator', description: 'Rules applied when writing ad copy from a product' },
  { key: 'policy', label: 'Policy', description: 'ASCI compliance rules — failures block export' },
  { key: 'tone', label: 'Tone', description: 'Brand tone rules — failures warn, do not block' },
  { key: 'language', label: 'Language', description: 'Brand language rules — failures warn, do not block' },
]

export default function Prompts() {
  const [active, setActive] = useState('generator')
  const [drafts, setDrafts] = useState({})
  const [saveStatus, setSaveStatus] = useState({})
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then(data => setDrafts(data))
      .catch(e => setLoadError(e.message))
  }, [])

  async function save(key) {
    setSaveStatus(s => ({ ...s, [key]: 'saving' }))
    try {
      const res = await fetch(`/api/prompts/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: drafts[key] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaveStatus(s => ({ ...s, [key]: 'saved' }))
      setTimeout(() => setSaveStatus(s => ({ ...s, [key]: null })), 2000)
    } catch (e) {
      setSaveStatus(s => ({ ...s, [key]: `Error: ${e.message}` }))
    }
  }

  const loaded = Object.keys(drafts).length > 0
  const activeTab = TABS.find(t => t.key === active)
  const status = saveStatus[active]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Prompts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the rules applied by the generator and scorer. Changes take effect on the next request — no deploy needed.
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active === tab.key
                ? 'border-black text-black font-medium'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {loaded ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{activeTab.description}</p>
          <textarea
            key={active}
            value={drafts[active] ?? ''}
            onChange={e => setDrafts(d => ({ ...d, [active]: e.target.value }))}
            rows={24}
            spellCheck={false}
            className="w-full border border-gray-200 rounded px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-black resize-y"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => save(active)}
              disabled={status === 'saving'}
              className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-40 hover:bg-gray-800 transition-colors"
            >
              {status === 'saving' ? 'Saving…' : 'Save'}
            </button>
            {status === 'saved' && (
              <span className="text-sm text-green-600">Saved</span>
            )}
            {typeof status === 'string' && status.startsWith('Error') && (
              <span className="text-sm text-red-600">{status}</span>
            )}
          </div>
        </div>
      ) : (
        !loadError && <p className="text-sm text-gray-400">Loading…</p>
      )}
    </div>
  )
}
