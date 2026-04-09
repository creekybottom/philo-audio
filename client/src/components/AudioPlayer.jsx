export default function AudioPlayer({
  url,
  episodeNumber,
  onRegenerate,
  generatingAudio,
  voices,
  selectedVoice,
  onVoiceChange,
}) {
  const num = String(episodeNumber).padStart(2, '0')

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4">
        <audio controls className="w-full" key={url}>
          <source src={url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`/api/audio/${episodeNumber}/download`}
          download={`little-thinkers-episode-${num}.mp3`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Download MP3
        </a>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {voices.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <button
            onClick={onRegenerate}
            disabled={generatingAudio}
            className="px-4 py-2 border-2 border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            {generatingAudio ? 'Generating...' : 'Regenerate Audio'}
          </button>
        </div>
      </div>
    </div>
  )
}
