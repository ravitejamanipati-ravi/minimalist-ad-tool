import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Generator from './pages/Generator.jsx'
import Scorer from './pages/Scorer.jsx'
import Prompts from './pages/Prompts.jsx'

export default function App() {
  const [url, setUrl] = useState('')
  const [product, setProduct] = useState(null)
  const [ad, setAd] = useState(null)
  const [scores, setScores] = useState(null)
  const [scorerText, setScorerText] = useState('')
  const [scorerScores, setScorerScores] = useState(null)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-6">
        <span className="text-sm font-semibold tracking-tight uppercase">Minimalist Ad Tool</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm ${isActive ? 'text-black font-medium' : 'text-gray-400 hover:text-black'}`
          }
        >
          Generator
        </NavLink>
        <NavLink
          to="/scorer"
          className={({ isActive }) =>
            `text-sm ${isActive ? 'text-black font-medium' : 'text-gray-400 hover:text-black'}`
          }
        >
          Scorer
        </NavLink>
        <NavLink
          to="/prompts"
          className={({ isActive }) =>
            `text-sm ${isActive ? 'text-black font-medium' : 'text-gray-400 hover:text-black'}`
          }
        >
          Prompts
        </NavLink>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={
            <Generator
              url={url} setUrl={setUrl}
              product={product} setProduct={setProduct}
              ad={ad} setAd={setAd}
              scores={scores} setScores={setScores}
            />
          } />
          <Route path="/scorer" element={
            <Scorer
              adText={scorerText} setAdText={setScorerText}
              scores={scorerScores} setScores={setScorerScores}
            />
          } />
          <Route path="/prompts" element={<Prompts />} />
        </Routes>
      </main>
    </div>
  )
}
