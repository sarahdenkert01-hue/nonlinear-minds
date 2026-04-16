import { Compass } from 'lucide-react';

export default function UnstuckPanel({ content }) {
  if (!content) return null;

  // Split on bullet points or newlines
  const lines = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-primary/5">
        <Compass className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Clinical Compass</p>
        <p className="text-xs text-muted-foreground ml-auto italic">a.k.a. Unstuck Me</p>
      </div>
      <div className="p-5 space-y-3">
        {lines.map((line, i) => {
          const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
          const clean = isBullet ? line.replace(/^[•\-\*\d\.]+\s*/, '') : line;
          return (
            <div key={i} className={`flex gap-3 ${isBullet ? '' : 'font-medium text-foreground/80 text-sm'}`}>
              {isBullet && (
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
              <p className="text-sm leading-relaxed text-foreground/80">{clean}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
