import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AudioPlayer from '../components/AudioPlayer'

const VOICES = []

export default function ScriptEditor() {
  const { episodeNumber } = useParams()
  const epNum = parseInt(episodeNumber, 10)

  const [episode, setEpisode] = useState(null)
  const [scriptData, setScriptData] = useState(null)
  const [scriptText, setScriptText] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Audio state
  const [audioStatus, setAudioStatus] = useState(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [voices, setVoices] = useState(VOICES)
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [audioError, setAudioError] = useState(null)

  useEffect(() => {
    loadAll()
  }, [epNum])

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [seriesRes, scriptRes, audioRes, voicesRes] = await Promise.all([
        fetch('/api/series'),
        fetch(`/api/scripts/${epNum}`),
        fetch(`/api/audio/${epNum}/status`),
        fetch('/api/audio/voices'),
      ])

      const seriesData = await seriesRes.json()
      if (seriesData && seriesData.episodes) {
        const ep = seriesData.episodes.find(e => e.number === epNum)
        setEpisode(ep || null)
      }

      const script = await scriptRes.json()
      if (script) {
        setScriptData(script)
        setScriptText(script.script)
      }

      const audio = await audioRes.json()
      setAudioStatus(audio)

      const voiceList = await voicesRes.json()
      if (Array.isArray(voiceList) && voiceList.length > 0) {
        setVoices(voiceList)
      }
    } catch (err) {
      setError('Failed to load episode data')
    } finally {
      setLoading(false)
    }
  }

  async function generateScript() {
    try {
      setGenerating(true)
      setError(null)
      setSuccessMsg(null)
      const res = await fetch(`/api/scripts/${epNum}/generate`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate script')
      }
      const data = await res.json()
      setScriptData(data)
      setScriptText(data.script)
      setSuccessMsg('Script generated and saved!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function saveScript() {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/scripts/${epNum}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptText, title: episode?.title }),
      })
      if (!res.ok) throw new Error('Failed to save script')
      const data = await res.json()
      setScriptData(data)
      setSuccessMsg('Script saved!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function generateAudio() {
    try {
      setGeneratingAudio(true)
      setAudioError(null)
      const res = await fetch(`/api/audio/${epNum}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: selectedVoice }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to generate audio')
      }
      const data = await res.json()
      setAudioStatus({ exists: true, url: data.url })
    } catch (err) {
      setAudioError(err.message)
    } finally {
      setGeneratingAudio(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              Episode {epNum}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-2">
              {episode?.title || `Episode ${epNum}`}
            </h1>
            {episode?.description && (
              <p className="text-slate-500 mt-1">{episode.description}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMsg}
        </div>
      )}

      {/* Script Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Script</h2>
          <div className="flex gap-2">
            {scriptData && (
              <span className="text-xs text-slate-400">
                {scriptData.word_count} words
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {!scriptData && !generating ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No script generated yet for this episode.</p>
              <button
                onClick={generateScript}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Generate Script
              </button>
            </div>
          ) : generating ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-500">Generating script with Claude...</p>
              <p className="text-xs text-slate-400 mt-1">This may take 30-60 seconds</p>
            </div>
          ) : (
            <>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                className="w-full h-96 p-4 border border-slate-200 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
                placeholder="Script content..."
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveScript}
                  disabled={saving}
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Script'}
                </button>
                <button
                  onClick={generateScript}
                  disabled={generating}
                  className="px-5 py-2 border-2 border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Audio Section */}
      {scriptData && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Audio</h2>
          </div>

          <div className="p-4">
            {audioError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {audioError}
              </div>
            )}

            {audioStatus?.exists ? (
              <AudioPlayer
                url={audioStatus.url}
                episodeNumber={epNum}
                onRegenerate={generateAudio}
                generatingAudio={generatingAudio}
                voices={voices}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
              />
            ) : generatingAudio ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-warm-500 mx-auto mb-4"></div>
                <p className="text-slate-500">Generating audio with ElevenLabs...</p>
                <p className="text-xs text-slate-400 mt-1">This may take a few minutes for longer scripts</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Voice:</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  >
                    {voices.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.description}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={generateAudio}
                  className="px-6 py-3 bg-warm-500 text-white rounded-lg font-medium hover:bg-warm-400 transition-colors shadow-lg shadow-warm-200"
                >
                  Generate Audio
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
