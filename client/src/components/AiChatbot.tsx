import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Mic, MicOff, Languages } from 'lucide-react';
import axios from 'axios';

interface AiChatbotProps {
  language: string;
  user: any;
}

export default function AiChatbot({ language, user }: AiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am your Hatty360 AI Assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputText('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', {
        message: textToSend,
        language: language,
        user_id: user?.id
      });
      
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error connecting to my database. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsRecording(true);
    // Simulate speech-to-text
    setTimeout(() => {
      const voiceTexts = {
        en: "show Balacola temple fund progress",
        kn: "ಬಸವಣ್ಣನ ವಚನ ತಿಳಿಸು",
        ta: "நிகழ்வுகள் என்ன?"
      };
      const text = voiceTexts[language as 'en'|'kn'|'ta'] || voiceTexts['en'];
      setInputText(text);
      setIsRecording(false);
    }, 2000);
  };

  const getAssistantTitle = () => {
    const titles = {
      en: "AI Community Assistant",
      kn: "ಎಐ ಸಮುದಾಯ ಸಹಾಯಕ",
      ta: "ஏஐ சமூக உதவியாளர்",
      bd: "AI Community Assistant"
    };
    return titles[language as 'en'|'kn'|'ta'|'bd'] || titles['en'];
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-green hover:bg-brand-green-dark text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer border border-brand-green-light/30"
          title="Open AI Chatbot"
        >
          <Bot className="h-6 w-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,104,83,0.25)] border border-slate-100 w-[90vw] sm:w-[400px] h-[500px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-green to-brand-green-dark p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide font-display">{getAssistantTitle()}</h4>
                <span className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green-light animate-ping"></span>
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Auto Translate Toggle */}
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`p-2 rounded-lg transition-colors hover:bg-white/10 ${autoTranslate ? 'text-brand-green-light' : 'text-emerald-200'}`}
                title="Toggle Auto Translate"
              >
                <Languages className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-blue text-white rounded-br-none'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                  }`}
                >
                  {/* If auto-translate is active, add mock translation notice */}
                  {autoTranslate && msg.sender === 'bot' && (
                    <div className="text-[9px] text-brand-green font-semibold mb-1 flex items-center gap-1">
                      <Languages className="h-3 w-3" /> Auto-Translated to {language.toUpperCase()}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none border border-slate-100 px-4 py-3 text-sm shadow-sm flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Suggestion Pills */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => handleSend("show Balacola temple fund progress")}
              className="flex-shrink-0 text-[11px] font-semibold bg-white text-brand-green border border-brand-green/20 hover:bg-brand-green/5 rounded-full px-3 py-1 shadow-sm transition-colors"
            >
              Balacola Fund Progress
            </button>
            <button
              onClick={() => handleSend("tell me a Basavanna vachana")}
              className="flex-shrink-0 text-[11px] font-semibold bg-white text-brand-green border border-brand-green/20 hover:bg-brand-green/5 rounded-full px-3 py-1 shadow-sm transition-colors"
            >
              Basavanna Vachana
            </button>
            <button
              onClick={() => handleSend("what events are scheduled?")}
              className="flex-shrink-0 text-[11px] font-semibold bg-white text-brand-green border border-brand-green/20 hover:bg-brand-green/5 rounded-full px-3 py-1 shadow-sm transition-colors"
            >
              Upcoming Events
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-2.5 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-50 text-red-600 animate-pulse border border-red-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
              title={isRecording ? 'Listening...' : 'Voice Input (elderly friendly)'}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? 'Listening, please speak...' : 'Type a query...'}
              disabled={isRecording}
              className="flex-grow py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none input-glow text-slate-800 disabled:bg-slate-50"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
