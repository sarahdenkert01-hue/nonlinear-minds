import { useState, useEffect } from 'react';

const modes = [
  { id: 'default', label: '🌙 Low Stim', desc: 'Calm & minimal' },
  { id: 'dopamine', label: '🌈 Dopamine', desc: 'Colorful & engaging' },
  { id: 'focus', label: '📋 Focus', desc: 'Clean & structured' },
];

export default function BrainModeToggle() {
  const [current, setCurrent] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('brain-mode') || 'default';
    setCurrent(saved);
    applyMode(saved);
  }, []);

  const applyMode = (mode) => {
    document.documentElement.removeAttribute('data-theme');
    if (mode !== 'default') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  };

  const handleChange = (mode) => {
    setCurrent(mode);
    localStorage.setItem('brain-mode', mode);
    applyMode(mode);
  };

  return (
    <div>
      <p className="text-xs text-sidebar-foreground/40 mb-2 px-1 font-medium uppercase tracking-wide">Brain Mode</p>
      <div className="space-y-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleChange(mode.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              current === mode.id
                ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <span className="block leading-tight">{mode.label}</span>
            <span className="block text-xs opacity-60 leading-tight">{mode.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
