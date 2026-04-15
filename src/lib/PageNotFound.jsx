import { Link } from 'react-router-dom';
import { Home, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="w-9 h-9 text-primary" />
        </div>
        <h1 className="font-display text-3xl text-foreground mb-2">Hmm, that page wandered off.</h1>
        <p className="text-muted-foreground mb-6">
          Kind of like your thoughts after a long day of sessions. Let's get you back on track.
        </p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground rounded-xl px-6">
            <Home className="w-4 h-4 mr-2" />Back to Brain Dump
          </Button>
        </Link>
      </div>
    </div>
  );
}
