import { ChevronRight, Target } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  active: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  paused: 'text-amber-600 bg-amber-50 border-amber-200',
  complete: 'text-muted-foreground bg-muted border-border',
};

export default function PlanCard({ plan, onClick }) {
  const goalCount = plan.goals?.length || 0;
  const doneCount = plan.goals?.filter(g =>
    g.objectives?.every(o => o.done)
  ).length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="font-medium text-foreground">{plan.client_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[plan.status]}`}>
              {plan.status}
            </span>
          </div>
          {plan.big_picture && (
            <p className="text-sm text-muted-foreground line-clamp-1">{plan.big_picture}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              {goalCount} goal{goalCount !== 1 ? 's' : ''}
              {goalCount > 0 && ` · ${doneCount} complete`}
            </span>
            {plan.start_date && (
              <span className="text-xs text-muted-foreground">
                Started {format(new Date(plan.start_date), 'MMM d')}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1 shrink-0" />
      </div>
    </button>
  );
}
