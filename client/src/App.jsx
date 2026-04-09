import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import SeriesPlanner from './pages/SeriesPlanner'
import ScriptEditor from './pages/ScriptEditor'
import Dashboard from './pages/Dashboard'

function NavBar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-700 hover:text-primary-600">
          <span className="text-2xl">🧠</span>
          <span>Little Thinkers</span>
        </Link>
        <div className="flex gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Series Planner
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard') ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SeriesPlanner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/episode/:episodeNumber" element={<ScriptEditor />} />
          </Routes>
        </main>
        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
          Little Thinkers — AI-Powered Philosophy Podcast for Kids
        </footer>
      </div>
    </BrowserRouter>
  )
}
