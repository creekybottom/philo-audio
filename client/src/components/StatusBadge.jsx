export default function StatusBadge({ status }) {
  const config = {
    planned: {
      label: 'Planned',
      emoji: '📋',
      classes: 'bg-slate-100 text-slate-500',
    },
    script: {
      label: 'Script Ready',
      emoji: '✏️',
      classes: 'bg-blue-50 text-blue-600',
    },
    audio: {
      label: 'Audio Ready',
      emoji: '🎙️',
      classes: 'bg-green-50 text-green-600',
    },
  }

  const c = config[status] || config.planned

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${c.classes}`}>
      <span>{c.emoji}</span>
      {c.label}
    </span>
  )
}
