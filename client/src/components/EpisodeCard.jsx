import { useState } from 'react'

export default function EpisodeCard({ episode, onUpdate, readOnly, onClick }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(episode.title)
  const [description, setDescription] = useState(episode.description)

  function save() {
    if (onUpdate) {
      onUpdate({ title, description })
    }
    setEditing(false)
  }

  function cancel() {
    setTitle(episode.title)
    setDescription(episode.description)
    setEditing(false)
  }

  return (
    <div
      onClick={readOnly && onClick ? onClick : undefined}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-all ${
        readOnly && onClick ? 'cursor-pointer hover:shadow-md hover:border-primary-200' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
          Episode {episode.number}
        </span>
        {!readOnly && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-slate-400 hover:text-primary-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={save}
              className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700"
            >
              Save
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1.5 text-slate-500 text-xs hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold text-slate-800 mb-1">{episode.title}</h3>
          <p className="text-sm text-slate-500 mb-3">{episode.description}</p>
          {episode.topics && (
            <div className="flex flex-wrap gap-1">
              {episode.topics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs bg-warm-50 text-warm-500 px-2 py-0.5 rounded-full border border-warm-100"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
