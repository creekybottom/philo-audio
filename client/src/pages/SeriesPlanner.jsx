import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EpisodeCard from '../components/EpisodeCard'

export default function SeriesPlanner() {
  const [series, setSeries] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadSeries()
  }, [])

  async function loadSeries() {
    try {
      setLoading(true)
      const res = await fetch('/api/series')
      const data = await res.json()
      if (data && data.episodes) {
        setSeries(data)
        setEpisodes(data.episodes)
      }
    } catch (err) {
      setError('Failed to load series data')
    } finally {
      setLoading(false)
    }
  }

  async function generateSeries() {
    try {
      setGenerating(true)
      setError(null)
      const res = await fetch('/api/series/generate', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate series')
      }
      const data = await res.json()
      setEpisodes(data.episodes)
      setSeries({ ...data, approved: false })
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function approveSeries() {
    try {
      setError(null)
      const res = await fetch('/api/series/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes, approved: true }),
      })
      if (!res.ok) throw new Error('Failed to save series')
      const data = await res.json()
      setSeries(data)
    } catch (err) {
      setError(err.message)
    }
  }

  function updateEpisode(index, updates) {
    setEpisodes(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  // If series is approved, show it as read-only with a link to dashboard
  if (series && series.approved) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Series Outline</h1>
            <p className="text-slate-500 mt-1">Your series is approved and ready for production!</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((ep, i) => (
            <EpisodeCard
              key={ep.number}
              episode={ep}
              readOnly
              onClick={() => navigate(`/episode/${ep.number}`)}
            />
          ))}
        </div>
      </div>
    )
  }

  // No series yet or unapproved
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          {episodes.length > 0 ? 'Review Your Series' : 'Welcome to Little Thinkers'}
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          {episodes.length > 0
            ? 'Edit any episode title or description below, then approve the series to start generating scripts.'
            : 'Generate a 12-episode philosophy podcast series designed for kids aged 7-9. Click below to get started!'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {episodes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="text-6xl mb-4">🎓</div>
          <button
            onClick={generateSeries}
            disabled={generating}
            className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-200"
          >
            {generating ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Generating Series Outline...
              </span>
            ) : (
              'Generate Series Outline'
            )}
          </button>
          <p className="text-sm text-slate-400">This will use Claude to create 12 episode outlines</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {episodes.map((ep, i) => (
              <EpisodeCard
                key={ep.number}
                episode={ep}
                onUpdate={(updates) => updateEpisode(i, updates)}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={generateSeries}
              disabled={generating}
              className="px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Regenerating...' : 'Regenerate All'}
            </button>
            <button
              onClick={approveSeries}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              Approve Series ✓
            </button>
          </div>
        </>
      )}
    </div>
  )
}
