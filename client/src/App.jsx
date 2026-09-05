import { Routes, Route, NavLink } from 'react-router-dom'
import Generator from './pages/Generator.jsx'
import Scorer from './pages/Scorer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center gap-6">
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
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/scorer" element={<Scorer />} />
        </Routes>
      </main>
    </div>
  )
}
