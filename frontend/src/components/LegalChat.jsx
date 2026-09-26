import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Quote, Loader2 } from 'lucide-react';
import { chatWithDocument, getDocumentChatHistory } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function LegalChat({ documentId, initialQuestion = null, className = '' }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What are my obligations?",
    "Can I cancel this agreement?",
    "When does this expire?",
    "What happens if I break the agreement?",
    "Can they share my personal information?",
    "What happens after account termination?"
  ];

  useEffect(() => {
    if (documentId) {
      loadHistory();
    }
  }, [documentId]);

  const loadHistory = async () => {
    try {
      const res = await getDocumentChatHistory(documentId);
      if (res.data.history && res.data.history.length > 0) {
        setMessages(res.data.history.map(m => ({
          role: m.role,
          content: m.content,
          citation: m.citations && m.citations[0] ? m.citations[0] : null
        })));
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            content: 'Hello! I am LegalLens Document Assistant. You can ask me any question about this document. My answers are strictly grounded in the document text.',
            citation: null
          }
        ]);
      }
    } catch {
      // Fallback welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! Ask me any question about this analyzed document. Answers are strictly grounded in the extracted text.',
          citation: null
        }
      ]);
    }
  };

  const handleSend = async (questionText = null) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    const newMsgs = [...messages, { role: 'user', content: q }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await chatWithDocument(documentId, q);
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: res.data.answer,
          citation: res.data.citation,
          clause_found: res.data.clause_found
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'An error occurred while querying the document text. Please try again.',
          citation: null
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border-3 border-black shadow-neo-md flex flex-col h-[580px] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b-2 border-black bg-neo-yellow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black text-white border-2 border-black shadow-2xs">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-black text-base uppercase tracking-tight">{t('upload.tabChat', 'Grounded Document Chat')}</h3>
            <p className="text-xs font-bold text-slate-800">{t('chat.groundedNotice', 'Strictly grounded in document text • No hallucinations')}</p>
          </div>
        </div>
        <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-neo-green text-black border-2 border-black shadow-2xs">
          {t('chat.groundingActive', 'Source Grounding Active')}
        </span>
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-3 bg-[#fcfaf2] border-b-2 border-black flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-black font-black uppercase tracking-wider text-[11px] shrink-0 ml-1">{t('chat.suggestionsLabel', 'Suggestions:')}</span>
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-3 py-1 rounded-lg bg-white border-2 border-black hover:bg-neo-yellow text-black font-bold transition whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-neo-blue border-2 border-black text-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold">
                <Bot className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}

            <div className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed border-2 border-black shadow-neo-sm ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-xs font-medium' 
                : 'bg-white text-black rounded-bl-xs font-medium'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.citation && (
                <div className="mt-3 pt-2.5 border-t-2 border-black/20 text-xs text-black bg-neo-yellow/30 p-3 rounded-lg border-2 border-black">
                  <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-black mb-1">
                    <Quote className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('chat.excerpt', 'Relevant Document Excerpt:')}</span>
                  </div>
                  <p className="italic font-mono text-xs text-black font-bold leading-relaxed">{msg.citation}</p>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-black border-2 border-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold">
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neo-blue border-2 border-black text-black flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="bg-white border-2 border-black shadow-neo-sm rounded-2xl p-3.5 rounded-bl-xs text-xs text-black font-bold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>{t('chat.verifying', 'Verifying clauses and grounding answer in document text...')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 border-t-2 border-black bg-[#fcfaf2] flex items-center gap-2.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.inputPlaceholder', 'Ask a question about this document (e.g. Can I cancel? What are my duties?)...')}
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-black focus:outline-none text-sm font-semibold bg-white text-black placeholder:text-slate-500 shadow-2xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 rounded-xl bg-neo-yellow hover:bg-neo-yellow/90 disabled:bg-slate-200 text-black border-2 border-black font-black text-sm uppercase transition flex items-center gap-1.5 shadow-neo-sm cursor-pointer disabled:cursor-not-allowed hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">{t('assistant.askBtn', 'Ask')}</span>
        </button>
      </form>
    </div>
  );
}
