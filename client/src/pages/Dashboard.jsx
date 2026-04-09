import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [series, setSeries] = useState(null)
  const [scriptStatuses, setScriptStatuses] = useState([])
  const [audioStatuses, setAudioStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [seriesRes, scriptsRes, audioRes] = await Promise.all([
        fetch('/api/series'),
        fetch('/api/scripts'),
        fetch('/api/audio/status/all'),
      ])
      const seriesData = await seriesRes.json()
      setSeries(seriesData)

      const scripts = await scriptsRes.json()
      setScriptStatuses(Array.isArray(scripts) ? scripts.map(s => s.episodeNumber) : [])

      const audio = await audioRes.json()
      setAudioStatuses(Array.isArray(audio) ? audio : [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  function getStatus(episodeNumber) {
    if (audioStatuses.includes(episodeNumber)) return 'audio'
    if (scriptStatuses.includes(episodeNumber)) return 'script'
    return 'planned'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!series || !series.approved) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="py-16">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">No Series Yet</h1>
          <p className="text-slate-500 mb-6">Create and approve a series outline first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Go to Series Planner
          </button>
        </div>
      </div>
    )
  }

  const episodes = series.episodes || []
  const totalScripts = scriptStatuses.length
  const totalAudio = audioStatuses.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Episode Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {totalScripts}/12 scripts · {totalAudio}/12 audio files
          </p>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:block w-48">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{Math.round((totalAudio / 12) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(totalAudio / 12) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {episodes.map(ep => {
          const status = getStatus(ep.number)
          return (
            <div
              key={ep.number}
              onClick={() => navigate(`/episode/${ep.number}`)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">
                  Episode {ep.number}
                </span>
                <StatusBadge status={status} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-primary-700 transition-colors">
                {ep.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">{ep.description}</p>
              {ep.topics && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {ep.topics.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
