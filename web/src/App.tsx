import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    function load() {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length > 0) setVoices(list);
    }
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return voices;
}

export default function App() {
  const [text, setText] = useState('Hello! This is a smooth, modern text-to-speech app.');
  const [mode, setMode] = useState<'on-device' | 'cloud'>('on-device');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const voices = useVoices();
  const [voiceName, setVoiceName] = useState<string>('');
  const [provider, setProvider] = useState<'openai' | 'elevenlabs'>('openai');
  const [format, setFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoice = useMemo(() => voices.find(v => v.name === voiceName) || voices[0], [voices, voiceName]);

  useEffect(() => {
    if (!voiceName && voices[0]) {
      setVoiceName(voices[0].name);
    }
  }, [voices, voiceName]);

  function speakOnDevice() {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    window.speechSynthesis.speak(utterance);
  }

  async function synthesizeCloud() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, provider, format }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (e: any) {
      alert(e?.message || 'TTS failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">AI Text to Speech</h1>
          <p className="mt-2 text-slate-300">Smooth, modern, privacy-first. Works on iPhone, iPad, and Mac.</p>
        </header>

        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur p-4">
          <div className="flex gap-2 rounded-xl bg-slate-800 p-1 w-fit">
            <button onClick={() => setMode('on-device')} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode==='on-device'?'bg-slate-700':''}`}>On-device</button>
            <button onClick={() => setMode('cloud')} className={`px-3 py-1.5 rounded-lg text-sm transition ${mode==='cloud'?'bg-slate-700':''}`}>Cloud</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type text to speak..."
            rows={6}
            className="mt-4 w-full resize-y rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 outline-none ring-0 focus:border-slate-500"
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Voice</label>
              <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2">
                {voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} {v.lang ? `(${v.lang})` : ''}</option>
                ))}
              </select>
            </div>
            {mode === 'cloud' && (
              <div>
                <label className="block text-sm mb-2">Provider</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value as any)} className="w-full rounded-lg bg-slate-800 border border-slate-700 p-2">
                  <option value="openai">OpenAI</option>
                  <option value="elevenlabs">ElevenLabs</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm">Rate: {rate.toFixed(2)}</label>
              <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e)=> setRate(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div>
              <label className="block text-sm">Pitch: {pitch.toFixed(2)}</label>
              <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e)=> setPitch(parseFloat(e.target.value))} className="w-full"/>
            </div>
            <div>
              <label className="block text-sm">Volume: {volume.toFixed(2)}</label>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e)=> setVolume(parseFloat(e.target.value))} className="w-full"/>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {mode === 'on-device' ? (
              <>
                <button onClick={speakOnDevice} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2 font-medium">Speak</button>
                <button onClick={() => window.speechSynthesis.cancel()} className="rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2">Stop</button>
              </>
            ) : (
              <>
                <button disabled={loading} onClick={synthesizeCloud} className="rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-2 font-medium disabled:opacity-60">{loading? 'Synthesizing...' : 'Synthesize'}</button>
                <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg bg-slate-800 border border-slate-700 p-2">
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="ogg">OGG</option>
                </select>
                <a ref={(el) => { if (el && audioRef.current?.src) { el.href = audioRef.current.src; el.download = `speech.${format}`; } }} className="rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-2 cursor-pointer">Download</a>
              </>
            )}
            <audio ref={audioRef} className="hidden" controls />
          </div>
        </div>

        <footer className="mt-10 text-xs text-slate-400">
          <p>On-device mode uses your browser's built-in voices for maximum privacy. Cloud mode sends text to your configured provider.</p>
        </footer>
      </div>
    </div>
  );
}
