'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, MessageSquare, X, Bot, User, HelpCircle, 
  ArrowRight, Mic, MicOff, Volume2, Globe 
} from 'lucide-react';

export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en-US'); // 'en-US' or 'tr-TR'
  const [isListening, setIsListening] = useState(false);
  const [isFallbackRecording, setIsFallbackRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: 'Hello! I am Mira, your AdventureWorks AI Sales Assistant. Ask me anything about our sales performance, customer segments, or forecasting.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const handleSendRef = useRef(null);
  const voicesRef = useRef([]);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const recorderRef = useRef(null);
  const recorderChunksRef = useRef([]);
  const useAudioFallbackRef = useRef(false);

  // Multilingual Suggested Questions
  const suggestions = {
    'en-US': [
      "Which segment brings the most revenue?",
      "Show sales trend for last 12 months.",
      "Which country has the highest AOV?",
      "How can we re-engage At Risk customers?"
    ],
    'tr-TR': [
      "En çok ciro getiren segment hangisidir?",
      "Son 12 aylık satış trendini göster.",
      "En yüksek AOV hangi ülkede?",
      "Risk grubundaki müşterileri nasıl kazanırız?"
    ]
  };

  // Speech Recognition (Speech-to-Text) Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceStatus(lang === 'en-US' ? 'Listening…' : 'Dinleniyor…');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          useAudioFallbackRef.current = false;
          if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
          setInput(speechToText);
          handleSendRef.current?.(speechToText);
        };

        recognition.onerror = (e) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
          const messages = {
            'not-allowed': lang === 'en-US' ? 'Microphone permission is blocked. Allow microphone access and try again.' : 'Mikrofon izni engellenmiş. Mikrofon iznini verip tekrar deneyin.',
            'service-not-allowed': lang === 'en-US' ? 'Voice recognition service is unavailable in this preview.' : 'Ses tanıma servisi bu önizlemede kullanılamıyor.',
            network: lang === 'en-US' ? 'Voice recognition needs an internet connection.' : 'Ses tanıma için internet bağlantısı gerekiyor.',
          };
          if (e.error === 'network' && recorderRef.current?.state === 'recording') {
            useAudioFallbackRef.current = true;
            setIsFallbackRecording(true);
            setVoiceStatus(lang === 'en-US' ? 'Browser voice service is unavailable. Recording locally — tap the microphone again when you finish speaking.' : 'Tarayıcı ses servisi kullanılamıyor. Yerel kayıt devam ediyor — konuşman bitince mikrofon simgesine tekrar dokun.');
            return;
          }
          setVoiceStatus(messages[e.error] || (lang === 'en-US' ? 'Voice input could not be started. Try Chrome or Edge.' : 'Sesli giriş başlatılamadı. Chrome veya Edge ile deneyin.'));
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getBestVoice = useCallback((voices, locale) => {
    const normalizedLocale = locale.toLowerCase();
    const language = normalizedLocale.split('-')[0];
    const exactLocaleVoices = voices.filter((voice) => voice.lang.toLowerCase() === normalizedLocale);
    const localeVoices = exactLocaleVoices.length
      ? exactLocaleVoices
      : voices.filter((voice) => voice.lang.toLowerCase().startsWith(`${language}-`));

    // SpeechSynthesis does not expose gender metadata. These names cover the
    // common female voices shipped by Windows, Chrome, Edge, and macOS.
    const femaleVoiceNames = locale === 'tr-TR'
      ? ['emel', 'yelda', 'seda', 'zeynep', 'filiz', 'tuba', 'aylin', 'gül', 'gul', 'female', 'woman']
      : ['zira', 'aria', 'jenny', 'ava', 'samantha', 'victoria', 'karen', 'susan', 'hazel', 'natasha', 'sonia', 'libby', 'google us english', 'google us', 'female', 'woman'];
    const highQualityKeywords = ['natural', 'neural', 'online', 'premium', 'google', 'enhanced'];

    const scoreVoice = (voice) => {
      const name = voice.name.toLowerCase();
      let score = 0;
      // Accent comes first: en-US should never be displaced by a British or
      // other English voice simply because that voice has a familiar name.
      if (voice.lang.toLowerCase() === normalizedLocale) score += 1_000;
      else if (voice.lang.toLowerCase().startsWith(`${language}-`)) score += 50;
      // A known female voice (for example, Microsoft Zira in en-US) takes
      // precedence over a generic male voice with the same locale.
      if (femaleVoiceNames.some((namePart) => name.includes(namePart))) score += 2_000;
      if (highQualityKeywords.some((namePart) => name.includes(namePart))) score += 60;
      if (voice.default) score += 10;
      if (voice.localService === false) score += 5;
      return score;
    };

    // Do not force a different-language voice (for example Dutch) onto Turkish
    // or English text. When no matching local voice exists, leave selection to
    // the browser while the cloud TTS service remains the preferred path.
    const femaleLocaleVoices = localeVoices.filter((voice) => {
      const name = voice.name.toLowerCase();
      return femaleVoiceNames.some((namePart) => name.includes(namePart));
    });
    // Chrome frequently exposes its fast American female voice simply as
    // "Google US English". Prefer it, then any explicitly female locale voice.
    const googleUsVoice = femaleLocaleVoices.find((voice) => voice.name.toLowerCase().includes('google us english'));
    return googleUsVoice || [...femaleLocaleVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
  }, []);

  const prepareAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      // This is called in the click/submit handler to preserve browser user activation.
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  const stopSpeaking = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;

    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {
        // The source may have already ended.
      }
      audioSourceRef.current = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Text-to-speech uses Gemini's high-quality assistant voice. Browser speech is
  // retained only as a graceful fallback when the TTS service is unavailable.
  const speakText = useCallback((text) => {
    if (typeof window === 'undefined') return;

    stopSpeaking();
    const audioContext = prepareAudio();

    // Strip presentation-only markdown and make common dashboard abbreviations sound natural.
    const cleanText = text
      .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
      .replace(/[*#_`~]/g, '')
      .replace(/\bAOV\b/gi, lang === 'tr-TR' ? 'ortalama sipariş değeri' : 'average order value')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanText) return;

    const playBrowserFallback = () => {
      if (!window.speechSynthesis) return false;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = lang === 'tr-TR' ? 0.96 : 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      const availableVoices = voicesRef.current.length
        ? voicesRef.current
        : window.speechSynthesis.getVoices();
      const bestVoice = getBestVoice(availableVoices, lang);

      // Always retain the selected application language; never inherit the
      // operating system's unrelated default voice language.
      utterance.lang = lang;
      // Never let an unrelated system-default voice (for example Dutch or a
      // male voice) speak when the requested female locale voice is absent.
      if (!bestVoice) return false;
      utterance.voice = bestVoice;
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      return true;
    };

    // A locally installed matching female voice starts immediately. The cloud
    // voice remains a fallback for devices that do not have one.
    if (playBrowserFallback()) return;

    const controller = new AbortController();
    ttsAbortRef.current = controller;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, language: lang }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('TTS service is unavailable');
        const wav = await response.arrayBuffer();
        if (!wav.byteLength || !audioContext) throw new Error('TTS service returned no playable audio');

        const audioBuffer = await audioContext.decodeAudioData(wav.slice(0));
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          if (audioSourceRef.current === source) audioSourceRef.current = null;
        };
        audioSourceRef.current = source;
        source.start();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') playBrowserFallback();
      });
  }, [getBestVoice, lang, prepareAudio, stopSpeaking]);

  // Pre-load voices on component mount to prevent lag
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      handleVoices();
      window.speechSynthesis.onvoiceschanged = handleVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  useEffect(() => () => {
    stopSpeaking();
    audioContextRef.current?.close().catch(() => {});
  }, [stopSpeaking]);

  async function handleSend(textToSend) {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    prepareAudio();

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, language: lang })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to get response');

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);

    } catch (e) {
      const errMsg = `Error: ${e.message}`;
      setMessages(prev => [...prev, { role: 'ai', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const transcribeRecording = async (blob) => {
    if (!blob?.size) return;
    setLoading(true);
    setVoiceStatus(lang === 'en-US' ? 'Converting your voice to text…' : 'Sesin metne dönüştürülüyor…');
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'mira-recording.webm');
      formData.append('language', lang);
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.transcript) throw new Error(result.error || 'No speech was detected.');
      setInput(result.transcript);
      setVoiceStatus('');
      await handleSend(result.transcript);
    } catch (error) {
      console.error('Audio transcription error:', error);
      setVoiceStatus(lang === 'en-US' ? 'Voice transcription failed. Please check your connection and try again.' : 'Ses transkripsiyonu başarısız oldu. Bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const stopRecorder = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const startRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderChunksRef.current = [];
    recorder.ondataavailable = (event) => { if (event.data.size) recorderChunksRef.current.push(event.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const shouldTranscribe = useAudioFallbackRef.current;
      const blob = new Blob(recorderChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      recorderRef.current = null;
      setIsFallbackRecording(false);
      useAudioFallbackRef.current = false;
      if (shouldTranscribe) transcribeRecording(blob);
    };
    recorderRef.current = recorder;
    recorder.start();
  };

  const toggleListening = async () => {
    if (isFallbackRecording) {
      stopRecorder();
      return;
    }
    if (!recognitionRef.current) {
      try {
        useAudioFallbackRef.current = true;
        await startRecorder();
        setIsFallbackRecording(true);
        setVoiceStatus(lang === 'en-US' ? 'Recording locally — tap the microphone again when you finish speaking.' : 'Yerel kayıt başladı — konuşman bitince mikrofon simgesine tekrar dokun.');
      } catch (error) {
        setVoiceStatus(lang === 'en-US' ? 'Microphone permission is required for voice conversation.' : 'Sesli konuşma için mikrofon izni gerekiyor.');
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        // Ask for microphone permission explicitly before browser recognition starts.
        await startRecorder();
        stopSpeaking();
        prepareAudio();
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
      } catch (error) {
        console.error('Microphone permission error:', error);
        useAudioFallbackRef.current = false;
        stopRecorder();
        setVoiceStatus(lang === 'en-US' ? 'Microphone permission is required for voice conversation.' : 'Sesli konuşma için mikrofon izni gerekiyor.');
      }
    }
  };

  return (
    <>
      {/* ── FLOATING BUTTON (FAB) ──────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-blue-200/70 bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 shadow-[0_10px_34px_rgba(59,130,246,0.55)] transition-all duration-300 hover:scale-110 hover:from-sky-300 hover:via-blue-500 hover:to-indigo-600 hover:shadow-[0_14px_40px_rgba(59,130,246,0.7)] active:scale-95"
      >
        <span className="absolute -right-1 -top-1 flex h-6 w-6">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-200 opacity-80"></span>
          <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-cyan-300 to-sky-500 text-[9px] font-black tracking-tight text-[#06275a] shadow-md">AI</span>
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/15 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:rotate-12"><MessageSquare size={27} strokeWidth={2.5} className="text-white drop-shadow-md" /></span>
      </button>

      {/* ── SLIDE-OUT DRAWER ───────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-slate-950/98 border-l border-slate-800/80 text-white z-50 flex flex-col shadow-2xl backdrop-blur-md transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-300/70 bg-blue-50 text-blue-400 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/mira-avatar.png" alt="Mira" className="h-full w-full scale-[1.06] rounded-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight">Mira</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">On-demand Voice</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button
              onClick={() => {
                const nextLanguage = lang === 'en-US' ? 'tr-TR' : 'en-US';
                setLang(nextLanguage);
                setMessages([{
                  role: 'ai',
                  content: nextLanguage === 'tr-TR'
                    ? 'Merhaba! Ben AdventureWorks Yapay Zeka Satış Asistanınızım. Satış performansı, müşteri segmentleri veya tahminler hakkında bana istediğinizi sorabilirsiniz.'
                    : 'Hello! I am Mira, your AdventureWorks AI Sales Assistant. Ask me anything about our sales performance, customer segments, or forecasting.'
                }]);
              }}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/40 text-[10px] font-black uppercase flex items-center gap-1 transition-all"
              title="Switch language / Dili Değiştir"
            >
              <Globe size={11} className="text-blue-400" />
              {lang === 'en-US' ? '🇺🇸 EN' : '🇹🇷 TR'}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-transparent"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-blue-400'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <><span className="sr-only">Mira</span>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/assets/mira-avatar.png" alt="Mira" className="h-full w-full rounded-full object-cover" /></>}
              </div>
              <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/30 shadow-md'
                  : 'bg-slate-900/90 text-slate-100 rounded-tl-none border border-slate-800/80 shadow-md'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
                {/* Individual replay voice button for each message */}
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => speakText(msg.content)}
                    className="mt-1.5 flex items-center gap-1 text-[9px] text-blue-400/80 hover:text-blue-300 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5 transition-all self-start"
                  >
                    <Volume2 size={9} /> {lang === 'en-US' ? 'Listen' : 'Dinle'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-slate-800 text-blue-400">
                <Bot size={14} />
              </div>
              <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl bg-slate-900/60 text-slate-400 rounded-tl-none border border-slate-800/50 italic text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                {lang === 'en-US' ? 'Crunching data...' : 'Veriler inceleniyor...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/20">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1">
            <HelpCircle size={10} /> {lang === 'en-US' ? 'Suggested Questions' : 'Önerilen Sorular'}
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestions[lang].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="w-full text-left text-[11px] bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg p-2 transition-all flex items-center justify-between group"
              >
                <span className="line-clamp-1 font-semibold">{q}</span>
                <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en-US' ? "Ask a sales question..." : "Satış sorusu sorun..."}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
              disabled={loading}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                isListening || isFallbackRecording
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={lang === 'en-US' ? "Voice search (Speech to text)" : "Konuşarak arama (Ses tanıma)"}
            >
              {isListening || isFallbackRecording ? <Mic size={14} className="animate-bounce" /> : <MicOff size={14} />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
