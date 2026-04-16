import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Brain, FileText, Map, Layers, Settings, Menu, X, Sparkles } from 'lucide-react';
import BrainModeToggle from './BrainModeToggle';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Brain, label: 'Brain Dump', sub: 'Start here' },
  { path: '/notes', icon: FileText, label: 'My Notes', sub: 'What you made' },
  { path: '/treatment', icon: Map, label: 'Treatment Plans', sub: 'The big picture' },
  { path: '/settings', icon: Settings, label: 'Settings', sub: '' },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div>
              <p className="font-display text-sidebar-foreground text-base leading-tight">Nonlinear</p>
              <p className="text-xs text-sidebar-foreground/50 leading-tight">Minds Therapy</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label, sub }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', active && 'text-sidebar-primary')} />
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  {sub && <p className="text-xs opacity-50 leading-tight">{sub}</p>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <BrainModeToggle />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-display text-foreground">Nonlinear Minds</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-muted-foreground hover:text-foreground">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-sidebar pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label, sub }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent"
              >
                <Icon className="w-5 h-5" />
                <div>
                  <p className="font-medium">{label}</p>
                  {sub && <p className="text-xs opacity-50">{sub}</p>}
                </div>
              </Link>
            ))}
          </nav>
          <div className="p-4 mt-4 border-t border-sidebar-border">
            <BrainModeToggle />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:overflow-auto">
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}
