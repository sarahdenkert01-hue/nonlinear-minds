import { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

const MODES = [
  { id: 'default', emoji: '🌙', name: 'Low Stimulation', desc: 'Calm, minimal, easy on the eyes' },
  { id: 'dopamine', emoji: '🌈', name: 'Dopamine Mode', desc: 'Colorful, engaging, a little fun' },
  { id: 'focus', emoji: '📋', name: 'Focus Mode', desc: 'Structured, clean, no distractions' },
];

export default function Settings() {
  const [current, setCurrent] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('brain-mode') || 'default';
    setCurrent(saved);
  }, []);

  const setMode = (id) => {
    setCurrent(id);
    localStorage.setItem('brain-mode', id);
    document.documentElement.removeAttribute('data-theme');
    if (id !== 'default') document.documentElement.setAttribute('data-theme', id);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="font-display text-3xl text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Make it feel like yours.</p>
      </div>

      <div className="space-y-6">
        {/* Brain modes */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Brain Mode</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Pick the vibe that matches how your brain works right now. You can switch anytime.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setMode(mode.id)}
                className={`rounded-xl p-4 border text-left transition-all ${
                  current === mode.id
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <div className="text-2xl mb-2">{mode.emoji}</div>
                <p className="text-sm font-medium text-foreground">{mode.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h2 className="font-semibold text-foreground">About Nonlinear Minds</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built for therapists whose brains don't work in straight lines. The idea is simple:
            start messy, end structured. Your notes don't have to be perfect — we'll help you get there.
          </p>
          <p className="text-xs text-muted-foreground mt-3 italic">
            "Your future self (and your EHR) will thank you." ✨
          </p>
        </div>
      </div>
    </div>
  );
}
