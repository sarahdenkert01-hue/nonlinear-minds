import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlanCard from '@/components/PlanCard';
import PlanBuilder from '@/components/PlanBuilder';

export default function TreatmentPlans() {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState('');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['treatment-plans'],
    queryFn: () => base44.entities.TreatmentPlan.list('-created_date', 50),
  });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const plan = await base44.entities.TreatmentPlan.create({
      client_name: newName,
      big_picture: '',
      goals: [],
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
    setCreating(false);
    setNewName('');
    setSelected(plan);
  };

  if (selected) {
    return (
      <PlanBuilder
        plan={selected}
        onBack={() => {
          setSelected(null);
          queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-foreground">Treatment Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Building something, not filling out a form.</p>
        </div>
        <Button onClick={() => setCreating(true)} className="bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4 mr-1.5" />New plan
        </Button>
      </div>

      {creating && (
        <div className="bg-card border border-primary/30 rounded-2xl p-5 mb-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Who's this plan for?</p>
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Client name or initials…"
            className="bg-background border-border"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!newName.trim()} className="bg-primary text-primary-foreground rounded-xl text-sm">
              Start messy →
            </Button>
            <Button variant="ghost" onClick={() => setCreating(false)} className="text-muted-foreground text-sm">Cancel</Button>
          </div>
        </div>
 
