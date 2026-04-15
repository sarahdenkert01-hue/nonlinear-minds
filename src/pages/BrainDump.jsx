import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import NoteChunks from '@/components/NoteChunks';
import UnstuckPanel from '@/components/UnstuckPanel';
import AudioRecorder from '@/components/AudioRecorder';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['dump', 'note', 'unstuck'];

export default function BrainDump() {
  const navigate = useNavigate();
  const [step, setStep] = useState('dump');
  const [clientName, setClientName] = useState('');
  const [dump, setDump] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteChunks, setNoteChunks] = useState([]);
  const [nextSteps, setNextSteps] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [modality, setModality] = useState('');
  const [sessionType, setSessionType] = useState('individual');

  const handleTranscript = (text) => {
    setDump(prev => prev ? prev + '\n\n' + text : text);
  };

  const handleGenerate = async () => {
    if (!dump.trim()) return;
    setLoading(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert clinical documentation specialist helping a therapist create insurance-compliant session notes. 
      
Therapist's raw session notes: "${dump}"
Session type: ${sessionType}
Modality: ${modality || 'not specified'}

Generate a comprehensive, insurance-compliant clinical session note broken into exactly 7 labeled sections:

1. Presenting Concerns & Symptom Status
   - Current symptoms, severity (mild/moderate/severe), duration, and functional impairment
   - DSM-5 aligned language where possible

2. Session Content & Themes
   - Key topics discussed, narrative themes, significant disclosures

3. Mental Status Observations
   - Affect, mood, thought process, insight, judgment, behavior during session
   - Use formal MSE language (e.g., "affect was congruent," "thought process was linear")

4. Interventions Used
   - Specific techniques (e.g., "Socratic questioning consistent with CBT," "emotion regulation skills per DBT")
   - Therapeutic modality alignment
   - Client participation level

5. Client Response & Progress
   - Response to interventions, engagement level, behavioral indicators
   - Progress toward treatment goals (if applicable)

6. Risk Assessment
   - Suicide/homicide ideation (affirm or deny explicitly — required for insurance)
   - Current safety plan status if applicable
   - "No SI/HI reported" is acceptable if not raised in session

7. Plan & Next Session
   - Homework or between-session tasks
   - Focus areas for next session
   - Any referrals or coordination of care

Rules:
- Use professional but readable clinical language — not robotic
- Be specific and behaviorally descriptive
- Avoid vague language ("seemed off") — translate to clinical terms
- Each section: 2-5 sentences
- Insurance reviewers need: medical necessity, functional impairment, and treatment justification — weave these in naturally

Return as JSON: {"chunks": [{"label": "...", "content": "..."}]}`,
      response_json_schema: {
        type: "object",
        properties: {
          chunks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                content: { type: "string" }
              }
            }
          }
        }
      }
    });

    const chunks = result?.chunks || [];
    setNoteChunks(chunks);

    const session = await base44.entities.Session.create({
      client_name: clientName || 'Client',
      brain_dump: dump,
      note_chunks: chunks,
      generated_note: chunks.map(c => `${c.label}: ${c.content}`).join('\n\n'),
      status: 'note_ready',
      modality,
      session_type: sessionType,
      session_date: new Date().toISOString().split('T')[0],
    });
    setSessionId(session.id);
    setLoading(false);
    setStep('note');
  };

  const handleUnstuck = async () => {
    setLoading(true);
    const noteText = noteChunks.map(c => `${c.label}: ${c.content}`).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You're a smart, slightly witty therapist friend. A clinician just finished a session and needs help figuring out what to do next. Read their session note and give them 3-5 genuinely useful, human-sounding next steps.

Session note:
${noteText}

Rules for your response:
- Sound like a smart colleague who "gets it," not a textbook
- Use phrases like "You might be seeing...", "Could be worth exploring...", "If you want to stay practical..."
- You can name patterns (shame loops, avoidance, etc.) but be tentative, not declarative
- Keep it warm. One tiny bit of soft humor is okay.
- 3-5 bullet points max
- Start with the most clinically relevant observation

Return as JSON: {"next_steps": "full formatted text with bullet points"}`,
      response_json_schema: {
        type: "object",
        properties: {
          next_steps: { type: "string" }
        }
      }
    });

    const ns = result?.next_steps || '';
    setNextSteps(ns);

    if (sessionId) {
      await base44.entities.Session.update(sessionId, { next_steps: ns, status: 'complete' });
    }
    setLoading(false);
    setStep('unstuck');
  };

  const handleChunksUpdate = (updated) => {
    setNoteChunks(updated);
    if (sessionId) {
      base44.entities.Session.update(sessionId, { note_chunks: updated });
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          {STEPS.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className={`font-medium ${step === s ? 'text-foreground' : STEPS.indexOf(step) > i ? 'text-foreground/50' : 'text-muted-foreground/40'}`}>
                {s === 'dump' ? 'Brain Dump' : s === 'note' ? 'Make It Make Sense' : 'Unstuck Me'}
              </span>
              {i < STEPS.length - 1 && <ArrowRight className="w-3 h-3 opacity-30" />}
            </span>
          ))}
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {step === 'dump' && <>Say it out loud.<br /><span className="text-primary/80">We'll clean it up.</span></>}
          {step === 'note' && <>Here's what we<br /><span className="text-primary/80">made sense of.</span></>}
          {step === 'unstuck' && <>Okay, so<br /><span className="text-primary/80">what next?</span></>}
        </h1>
        {step === 'dump' && (
          <p className="text-muted-foreground mt-2 text-sm">Voice or text — whatever gets it out. We'll make it insurance-ready.</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Dump */}
        {step === 'dump' && (
          <motion.div key="dump" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-1.5">Client name or initials</label>
                <Input
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. J.D."
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 block mb-1.5">Session type</label>
                <select
                  value={sessionType}
                  onChange={e => setSessionType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="individual">Individual</option>
                  <option value="couples">Couples</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/70 block mb-1.5">Modality <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={modality}
                onChange={e => setModality(e.target.value)}
                placeholder="e.g. CBT, DBT, ACT, EMDR…"
                className="bg-card border-border"
              />
            </div>

            {/* Audio recorder */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-sm font-medium text-foreground">Voice input</p>
              </div>
              <AudioRecorder onTranscript={handleTranscript} disabled={loading} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/70 block mb-1.5">Or type your notes here</label>
              <Textarea
                value={dump}
                onChange={e => setDump(e.target.value)}
                placeholder="Start anywhere. Ramble. Use shorthand. Say 'she seemed avoidant again' or 'we talked about the mom thing for like 20 min' — it's all good. We'll sort it out and make it insurance-ready."
                className="min-h-[180px] bg-card border-border resize-none text-base leading-relaxed"
              />
              {dump.length > 10 && (
                <p className="text-xs text-muted-foreground mt-1.5">✓ We'll turn this into a compliant clinical note.</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={handleGenerate}
                disabled={!dump.trim() || loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-2.5 font-medium"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Building your note…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Make It Make Sense</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Note */}
        {step === 'note' && (
          <motion.div key="note" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            <div className="bg-muted/40 border border-border rounded-2xl p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Insurance-ready note generated.</span> Edit anything that doesn't feel accurate — these are starting points, not gospel.
            </div>

            <NoteChunks chunks={noteChunks} onChange={handleChunksUpdate} />

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleUnstuck}
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-2.5 font-medium"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Thinking…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Unstuck Me →</>
                )}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/notes')} className="text-muted-foreground">
                <FileText className="w-4 h-4 mr-1.5" />Save & exit
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Unstuck */}
        {step === 'unstuck' && (
          <motion.div key="unstuck" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            <UnstuckPanel content={nextSteps} />

            <div className="bg-muted/40 rounded-2xl border border-border p-4">
              <p className="text-sm font-medium text-foreground mb-1">Your note is saved.</p>
              <p className="text-xs text-muted-foreground">Find it in My Notes whenever you need it.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/notes')} className="bg-primary text-primary-foreground rounded-xl px-6">
                <FileText className="w-4 h-4 mr-2" />View all notes
              </Button>
              <Button variant="ghost" onClick={() => { setStep('dump'); setDump(''); setNoteChunks([]); setNextSteps(''); setClientName(''); setSessionId(null); setModality(''); }} className="text-muted-foreground">
                New session
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
