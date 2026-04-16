import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AudioRecorder({ onTranscript, disabled }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(blob);
      };

      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    setProcessing(true);
    mediaRecorderRef.current?.stop();
  };

  const transcribeAudio = async (blob) => {
    try {
      // Upload the audio blob as a file
      const file = new File([blob], 'session-audio.webm', { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Use LLM with the audio file to transcribe and get raw notes
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `This is an audio recording of a therapist's post-session verbal brain dump. 
Please transcribe what was said and clean it up into coherent written notes. 
Preserve all clinical details, client information, and observations mentioned.
If the audio quality is poor or unclear in places, make reasonable inferences based on context.
Return the transcribed and cleaned-up notes as plain text — not formatted, just what was said.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcript: { type: "string" }
          }
        }
      });

      const transcript = result?.transcript || '';
      onTranscript(transcript);
    } catch (err) {
      setError('Could not process audio. Please try again or type your notes instead.');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {!recording && !processing && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 text-sm"
          >
            <Mic className="w-4 h-4 text-primary" />
            Record audio
          </Button>
        )}

        {recording && (
          <Button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            Stop — {formatTime(seconds)}
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse ml-1" />
          </Button>
        )}

        {processing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-xl border border-border">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Transcribing your recording…
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/20">
          {error}
        </p>
      )}

      {!recording && !processing && (
        <p className="text-xs text-muted-foreground">
          Or type your notes below — whatever works for your brain right now.
        </p>
      )}
    </div>
  );
}
