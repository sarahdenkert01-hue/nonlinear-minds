import { useState } from 'react';
import { ArrowLeft, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteChunks from './NoteChunks';
import UnstuckPanel from './UnstuckPanel';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function NoteDetail({ session, onBack }) {
  const [chunks, setChunks] = useState(session.note_chunks || []);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = chunks.map(c => `${c.label}\n${c.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChunksUpdate = (updated) => {
    setChunks(updated);
    base44.entities.Session.update(session.id, { note_chunks: updated });
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground p-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl text-foreground">{session.client_name}</h1>
          {session.session_date && (
            <p className="text-sm text-muted-foreground">
              {format(new Date(session.session_date), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
        <Button onClick={handleCopy} variant="outline" className="rounded-xl text-sm">
          {copied ? <><CheckCheck className="w-4 h-4 mr-1.5 text-emerald-500" />Copied!</> : <><Copy className="w-4 h-4 mr-1.5" />Copy note</>}
        </Button>
      </div>

      {chunks.length > 0 ? (
        <div className="space-y-6">
          <NoteChunks chunks={chunks} onChange={handleChunksUpdate} />

          {session.next_steps && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Clinical Compass</p>
              <UnstuckPanel content={session.next_steps} />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/40 rounded-2xl border border-border p-6">
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground block mb-1">Raw brain dump:</span>
            {session.brain_dump || 'No content saved.'}
          </p>
        </div>
      )}
    </div>
  );
}
