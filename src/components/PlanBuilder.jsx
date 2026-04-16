import { useState } from 'react';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Trash2, Check, GripVertical, Library } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const GOAL_COLORS = [
  { label: 'Violet', bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400', activeBg: 'bg-violet-200' },
  { label: 'Emerald', bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400', activeBg: 'bg-emerald-200' },
  { label: 'Amber', bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400', activeBg: 'bg-amber-200' },
  { label: 'Rose', bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400', activeBg: 'bg-rose-200' },
  { label: 'Sky', bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-400', activeBg: 'bg-sky-200' },
  { label: 'Purple', bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400', activeBg: 'bg-purple-200' },
];

// Evidence-based goal & objective bank organized by category
const GOAL_BANK = [
  {
    category: 'Mood & Depression',
    color: 'Sky',
    goals: [
      { title: 'Reduce depressive symptoms', objectives: ['Identify and challenge cognitive distortions using CBT techniques', 'Establish consistent sleep hygiene routine', 'Engage in behavioral activation — schedule 3 pleasant activities/week', 'Practice self-compassion exercises daily'] },
      { title: 'Improve emotional regulation', objectives: ['Identify emotional triggers and early warning signs', 'Use PLEASE skills to reduce mood vulnerability', 'Practice opposite action when experiencing low-motivation states'] },
    ]
  },
  {
    category: 'Anxiety & Worry',
    color: 'Violet',
    goals: [
      { title: 'Reduce anxiety symptoms and avoidance', objectives: ['Build hierarchy of avoided situations and begin exposure', 'Practice diaphragmatic breathing daily (10 min)', 'Challenge probability overestimation and catastrophizing', 'Reduce reassurance-seeking behaviors by 50%'] },
      { title: 'Develop distress tolerance skills', objectives: ['Learn and practice TIPP skills for crisis moments', 'Create and use a personal coping card', 'Practice radical acceptance of uncontrollable events'] },
    ]
  },
  {
    category: 'Trauma & PTSD',
    color: 'Rose',
    goals: [
      { title: 'Process traumatic experiences safely', objectives: ['Establish safety and stabilization before trauma processing', 'Develop grounding toolkit (5-4-3-2-1, safe place)', 'Reduce trauma-related avoidance behaviors', 'Process traumatic memories using trauma-focused modality'] },
      { title: 'Improve sense of safety and trust', objectives: ['Identify safe relationships and support network', 'Recognize and challenge shame-based trauma beliefs', 'Develop window of tolerance for trauma-related distress'] },
    ]
  },
  {
    category: 'Relationships & Communication',
    color: 'Emerald',
    goals: [
      { title: 'Improve interpersonal effectiveness', objectives: ['Use DEAR MAN skill for assertive requests', 'Practice GIVE skills to maintain relationships', 'Identify patterns from family of origin impacting current relationships', 'Reduce people-pleasing and increase boundary-setting'] },
      { title: 'Reduce interpersonal conflict', objectives: ['Identify personal conflict triggers and patterns', 'Practice active listening and perspective-taking', 'Use "I" statements to communicate needs without blame'] },
    ]
  },
  {
    category: 'Self & Identity',
    color: 'Amber',
    goals: [
      { title: 'Build self-worth and reduce self-criticism', objectives: ['Challenge inner critic using compassionate self-talk', 'Identify and build on personal strengths', 'Practice self-validation exercises', 'Reduce comparison to others'] },
      { title: 'Clarify values and life direction', objectives: ['Complete values clarification exercise', 'Identify ACT committed actions aligned with values', 'Reduce experiential avoidance blocking valued living'] },
    ]
  },
  {
    category: 'Substance Use & Coping',
    color: 'Purple',
    goals: [
      { title: 'Reduce reliance on substance use as coping', objectives: ['Identify high-risk situations and coping alternatives', 'Build refusal skills and social support network', 'Track urges using urge surfing technique', 'Address underlying emotional drivers of use'] },
    ]
  },
];

const getId = () => Math.random().toString(36).slice(2);

export default function PlanBuilder({ plan, onBack }) {
  const [bigPicture, setBigPicture] = useState(plan.big_picture || '');
  const [goals, setGoals] = useState(plan.goals || []);
  const [saving, setSaving] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [bankCategory, setBankCategory] = useState(null);

  const save = async (updatedGoals, updatedBP) => {
    setSaving(true);
    await base44.entities.TreatmentPlan.update(plan.id, {
      big_picture: updatedBP ?? bigPicture,
      goals: updatedGoals ?? goals,
    });
    setSaving(false);
  };

  const addGoalFromBank = (bankGoal, colorLabel) => {
    const colorIndex = goals.length % GOAL_COLORS.length;
    const color = colorLabel || GOAL_COLORS[colorIndex].label;
    const newGoal = {
      id: getId(),
      title: bankGoal.title,
      color,
      collapsed: false,
      objectives: bankGoal.objectives.map(text => ({ id: getId(), text, done: false })),
      next_steps: [],
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    save(updated);
  };

  const addBlankGoal = () => {
    const colorIndex = goals.length % GOAL_COLORS.length;
    const newGoal = {
      id: getId(),
      title: '',
      color: GOAL_COLORS[colorIndex].label,
      collapsed: false,
      objectives: [],
      next_steps: [],
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    save(updated);
  };

  const updateGoal = (id, field, value) => {
    const updated = goals.map(g => g.id === id ? { ...g, [field]: value } : g);
    setGoals(updated);
    save(updated);
  };

  const removeGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    save(updated);
  };

  const addObjective = (goalId) => {
    const updated = goals.map(g =>
      g.id === goalId
        ? { ...g, objectives: [...(g.objectives || []), { id: getId(), text: '', done: false }] }
        : g
    );
    setGoals(updated);
    save(updated);
  };

  const updateObjective = (goalId, objId, field, value) => {
    const updated = goals.map(g =>
      g.id === goalId
        ? { ...g, objectives: g.objectives.map(o => o.id === objId ? { ...o, [field]: value } : o) }
        : g
    );
    setGoals(updated);
    save(updated);
  };

  const removeObjective = (goalId, objId) => {
    const updated = goals.map(g =>
      g.id === goalId
        ? { ...g, objectives: g.objectives.filter(o => o.id !== objId) }
        : g
    );
    setGoals(updated);
    save(updated);
  };

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'GOAL') {
      const reordered = Array.from(goals);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setGoals(reordered);
      save(reordered);
      return;
    }

    if (type === 'OBJECTIVE') {
      const goalId = source.droppableId.replace('objectives-', '');
      const updated = goals.map(g => {
        if (g.id === goalId) {
          const objs = Array.from(g.objectives || []);
          const [moved] = objs.splice(source.index, 1);
          objs.splice(destination.index, 0, moved);
          return { ...g, objectives: objs };
        }
        return g;
      });
      setGoals(updated);
      save(updated);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground p-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-foreground">{plan.client_name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{saving ? 'Saving…' : 'Auto-saved'}</p>
          </div>
          <Button
            onClick={() => setShowBank(!showBank)}
            variant="outline"
            className={`rounded-xl text-sm gap-2 ${showBank ? 'border-primary/50 bg-primary/5 text-foreground' : 'text-muted-foreground'}`}
          >
            <Library className="w-4 h-4" />
            Goal Bank
          </Button>
        </div>

        <div className={`flex gap-6 ${showBank ? 'flex-col lg:flex-row' : ''}`}>
          {/* Main plan */}
          <div className="flex-1 min-w-0">
            {/* Big Picture */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">The Big Picture</p>
              <p className="text-xs text-muted-foreground mb-3">What are you and this client ultimately working toward?</p>
              <Textarea
                value={bigPicture}
                onChange={e => setBigPicture(e.target.value)}
                onBlur={() => save(goals, bigPicture)}
                placeholder="e.g. Build capacity to tolerate distress and reduce avoidance behaviors…"
                className="bg-background border-border resize-none text-sm min-h-[80px]"
              />
            </div>

            {/* Goals — drag and drop */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="goals" type="GOAL">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-4 mb-6 min-h-[60px] rounded-2xl transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}
                  >
                    {goals.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                        <p className="font-medium mb-1">No goals yet</p>
                        <p className="text-xs">Drag from the Goal Bank or add a blank goal below.</p>
                      </div>
                    )}

                    {goals.map((goal, index) => {
                      const colorSet = GOAL_COLORS.find(c => c.label === goal.color) || GOAL_COLORS[0];
                      const doneCount = goal.objectives?.filter(o => o.done).length || 0;
                      const totalCount = goal.objectives?.length || 0;

                      return (
                        <Draggable key={goal.id} draggableId={goal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border rounded-2xl overflow-hidden ${colorSet.border} ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30' : ''}`}
                            >
                              {/* Goal header */}
                              <div className={`${snapshot.isDragging ? colorSet.activeBg : colorSet.bg} px-4 py-3 flex items-center gap-2`}>
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-70">
                                  <GripVertical className={`w-4 h-4 ${colorSet.text}`} />
                                </div>
                                <button onClick={() => updateGoal(goal.id, 'collapsed', !goal.collapsed)}>
                                  {goal.collapsed
                                    ? <ChevronRight className={`w-4 h-4 ${colorSet.text}`} />
                                    : <ChevronDown className={`w-4 h-4 ${colorSet.text}`} />
                                  }
                                </button>
                                <div className={`w-2 h-2 rounded-full ${colorSet.dot} shrink-0`} />
                                <Input
                                  value={goal.title}
                                  onChange={e => updateGoal(goal.id, 'title', e.target.value)}
                                  placeholder={`Goal ${index + 1} — what we're working toward`}
                                  className={`border-0 bg-transparent p-0 h-auto text-sm font-medium ${colorSet.text} placeholder:opacity-40 focus-visible:ring-0 flex-1`}
                                />
                                {totalCount > 0 && (
                                  <span className={`text-xs ${colorSet.text} opacity-60 shrink-0`}>{doneCount}/{totalCount}</span>
                                )}
                                <button onClick={() => removeGoal(goal.id)} className={`opacity-40 hover:opacity-80 ${colorSet.text}`}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Objectives — nested drag and drop */}
                              {!goal.collapsed && (
                                <div className="bg-card p-4">
                                  <p className="text-xs text-muted-foreground font-medium mb-3">Objectives / next steps</p>
                                  <Droppable droppableId={`objectives-${goal.id}`} type="OBJECTIVE">
                                    {(provided2, snapshot2) => (
                                      <div
                                        ref={provided2.innerRef}
                                        {...provided2.droppableProps}
                                        className={`space-y-2 min-h-[20px] rounded-lg transition-colors ${snapshot2.isDraggingOver ? 'bg-primary/5' : ''}`}
                                      >
                                        {(goal.objectives || []).map((obj, objIdx) => (
                                          <Draggable key={obj.id} draggableId={obj.id} index={objIdx}>
                                            {(provided3, snapshot3) => (
                                              <div
                                                ref={provided3.innerRef}
                                                {...provided3.draggableProps}
                                                className={`flex items-start gap-2 ${snapshot3.isDragging ? 'opacity-80' : ''}`}
                                              >
                                                <div {...provided3.dragHandleProps} className="mt-0.5 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-60">
                                                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                                                </div>
                                                <button
                                                  onClick={() => updateObjective(goal.id, obj.id, 'done', !obj.done)}
                                                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    obj.done ? `${colorSet.dot} border-transparent` : 'border-border'
                                                  }`}
                                                >
                                                  {obj.done && <Check className="w-2.5 h-2.5 text-white" />}
                                                </button>
                                                <Input
                                                  value={obj.text}
                                                  onChange={e => updateObjective(goal.id, obj.id, 'text', e.target.value)}
                                                  placeholder="Add an objective or next step…"
                                                  className={`border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 ${obj.done ? 'line-through text-muted-foreground' : ''}`}
                                                />
                                                <button onClick={() => removeObjective(goal.id, obj.id)} className="opacity-30 hover:opacity-70 text-muted-foreground shrink-0">
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided2.placeholder}
                                      </div>
                                    )}
                                  </Droppable>

                                  <button
                                    onClick={() => addObjective(goal.id)}
                                    className={`text-xs ${colorSet.text} opacity-70 hover:opacity-100 flex items-center gap-1 mt-3`}
                                  >
                                    <Plus className="w-3 h-3" />Add step
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button
              onClick={addBlankGoal}
              variant="outline"
              className="w-full rounded-2xl border-dashed text-muted-foreground hover:text-foreground hover:border-primary/50"
            >
              <Plus className="w-4 h-4 mr-2" />Add a blank goal
            </Button>
          </div>

          {/* Goal Bank sidebar */}
          {showBank && (
            <div className="lg:w-80 shrink-0">
              <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-6">
                <div className="px-4 py-3 border-b border-border bg-muted/40">
                  <p className="text-sm font-semibold text-foreground">Goal Bank</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Click to add to your plan</p>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 p-2 flex-wrap border-b border-border bg-muted/20">
                  <button
                    onClick={() => setBankCategory(null)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${!bankCategory ? 'bg-primary/15 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    All
                  </button>
                  {GOAL_BANK.map(cat => (
                    <button
                      key={cat.category}
                      onClick={() => setBankCategory(bankCategory === cat.category ? null : cat.category)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${bankCategory === cat.category ? 'bg-primary/15 text-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      {cat.category.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-[60vh] p-3 space-y-4">
                  {GOAL_BANK.filter(cat => !bankCategory || cat.category === bankCategory).map(cat => {
                    const colorSet = GOAL_COLORS.find(c => c.label === cat.color) || GOAL_COLORS[0];
                    return (
                      <div key={cat.category}>
                        <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${colorSet.text}`}>{cat.category}</p>
                        <div className="space-y-2">
                          {cat.goals.map((g, i) => (
                            <button
                              key={i}
                              onClick={() => addGoalFromBank(g, cat.color)}
                              className={`w-full text-left rounded-xl border ${colorSet.border} ${colorSet.bg} px-3 py-2.5 hover:${colorSet.activeBg} transition-colors group`}
                            >
                              <div className="flex items-start gap-2">
                                <Plus className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colorSet.text} opacity-60 group-hover:opacity-100`} />
                                <div>
                                  <p className={`text-xs font-medium ${colorSet.text} leading-tight`}>{g.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                    {g.objectives.length} objectives included
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
