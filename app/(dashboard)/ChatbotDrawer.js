'use client'

import { useState, useRef, useEffect } from 'react';
import { 
  Send, MessageSquare, X, Bot, User, HelpCircle, 
  ArrowRight, Mic, MicOff, Volume2, VolumeX, Globe 
} from 'lucide-react';

export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en-US'); // 'en-US' or 'tr-TR'
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true); // default to unmuted as requested
  
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: 'Hello! I am your AdventureWorks AI Sales Assistant. Ask me anything about our sales performance, customer segments, or forecasting.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // Adjust welcome message when switching language
  useEffect(() => {
    if (lang === 'tr-TR') {
      setMessages([
        { role: 'ai', content: 'Merhaba! Ben AdventureWorks Yapay Zeka Satış Asistanınızım. Satış performansı, müşteri segmentleri veya tahminler hakkında bana istediğinizi sorabilirsiniz.' }
      ]);
    } else {
      setMessages([
        { role: 'ai', content: 'Hello! I am your AdventureWorks AI Sales Assistant. Ask me anything about our sales performance, customer segments, or forecasting.' }
      ]);
    }
  }, [lang]);

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
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          setInput(speechToText);
          handleSend(speechToText);
        };

        recognition.onerror = (e) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
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

  // Text-To-Speech (Speech Synthesis) function
  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Stop speaking any currently playing text
    window.speechSynthesis.cancel();

    // Clean text from markdown characters (asterisks, hashtags, underscores) for clean voice output
    const cleanText = text.replace(/[*#_`~]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for much better clarity and fluency
    utterance.pitch = 1.0;

    // Select suitable voice (prioritize Google or Premium/Natural sounding voices)
    const voices = window.speechSynthesis.getVoices();
    
    // Filter voices matching selected language
    const langVoices = voices.filter(v => v.lang.startsWith(lang.substring(0, 2)));
    
    // Look for high-quality premium/natural/google voices
    let bestVoice = langVoices.find(v => 
      v.name.includes("Google") || 
      v.name.includes("Natural") || 
      v.name.includes("Premium") ||
      v.name.includes("Samantha") ||
      v.name.includes("Daniel")
    );
    
    if (!bestVoice && langVoices.length > 0) {
      bestVoice = langVoices[0];
    }
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Pre-load voices on component mount to prevent lag
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      handleVoices();
      window.speechSynthesis.onvoiceschanged = handleVoices;
    }
  }, []);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    if (!textToSend) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to get response');

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);

      // Speak response out loud if voice output is unmuted
      if (isVoiceEnabled) {
        speakText(reply);
      }

    } catch (e) {
      const errMsg = `Error: ${e.message}`;
      setMessages(prev => [...prev, { role: 'ai', content: errMsg }]);
      if (isVoiceEnabled) speakText(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Apple Safari, or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop TTS if speaking
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
    }
  };

  const toggleVoiceOutput = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    if (!nextState && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      {/* ── FLOATING BUTTON (FAB) ──────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 group border border-blue-400/20"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 text-[9px] font-bold text-white items-center justify-center">AI</span>
        </span>
        <MessageSquare size={22} className="text-white group-hover:rotate-12 transition-transform duration-300" />
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
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400">
              <Bot size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight">AI Sales Copilot</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Voice Q&A Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button
              onClick={() => setLang(lang === 'en-US' ? 'tr-TR' : 'en-US')}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/40 text-[10px] font-black uppercase flex items-center gap-1 transition-all"
              title="Switch language / Dili Değiştir"
            >
              <Globe size={11} className="text-blue-400" />
              {lang === 'en-US' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>

            {/* Voice Mute/Unmute */}
            <button
              onClick={toggleVoiceOutput}
              className={`p-1.5 rounded-lg border transition-all ${
                isVoiceEnabled
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-white'
              }`}
              title={isVoiceEnabled ? 'Speech Output Enabled (Speak)' : 'Speech Output Muted (Silent)'}
            >
              {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
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
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
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
                isListening
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={lang === 'en-US' ? "Voice search (Speech to text)" : "Konuşarak arama (Ses tanıma)"}
            >
              {isListening ? <Mic size={14} className="animate-bounce" /> : <MicOff size={14} />}
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
          {isListening && (
            <p className="text-[10px] text-rose-400 font-bold text-center mt-2 animate-pulse">
              {lang === 'en-US' ? 'Listening...' : 'Dinleniyor...'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
