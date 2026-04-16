import { Textarea } from '@/components/ui/textarea';

const chunkColors = [
  'border-l-violet-400',
  'border-l-emerald-400',
  'border-l-amber-400',
  'border-l-rose-400',
  'border-l-sky-400',
];

export default function NoteChunks({ chunks, onChange }) {
  const handleEdit = (index, value) => {
    const updated = chunks.map((c, i) => i === index ? { ...c, content: value } : c);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {chunks.map((chunk, i) => (
        <div
          key={i}
          className={`bg-card border border-border border-l-4 ${chunkColors[i % chunkColors.length]} rounded-2xl p-4`}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{chunk.label}</p>
          <Textarea
            value={chunk.content}
            onChange={e => handleEdit(i, e.target.value)}
            className="border-0 bg-transparent p-0 resize-none text-sm leading-relaxed focus-visible:ring-0 min-h-[60px]"
          />
        </div>
      ))}
    </div>
  );
}
