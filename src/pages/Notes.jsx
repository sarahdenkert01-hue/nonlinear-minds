import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, ChevronRight, Calendar, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import NoteDetail from '@/components/NoteDetail';
import { format } from 'date-fns';

const statusLabels = {
  drafting: { label: 'Drafting', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  note_ready: { label: 'Note ready', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  complete: { label: 'Complete', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
};

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date', 50),
  });

  const filtered = sessions.filter(s =>
    s.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return <NoteDetail session={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">My Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {sessions.length > 0
              ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} saved`
              : 'Nothing here yet'}
          </p>
        </div>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground rounded-xl">
            <Plus className="w-4 h-4 mr-1.5" />New
          </Button>
        </Link>
      </div>

      {sessions.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by client name…"
            className="pl-9 bg-card border-border"
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium mb-1">No notes yet</p>
          <p className="text-muted-foreground text-sm mb-5">Start with a Brain Dump after your next session.</p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground rounded-xl">Start your first dump</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(session => {
            const status = statusLabels[session.status] || statusLabels.drafting;
            return (
              <button
                key={session.id}
                onClick={() => setSelected(session)}
                className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">{session.client_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    {session.brain_dump && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {session.brain_dump.slice(0, 120)}…
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    {session.session_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(session.session_date), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
