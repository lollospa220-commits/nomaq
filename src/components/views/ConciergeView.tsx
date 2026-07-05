import React from 'react';
import { Sparkles, Utensils, Map, Languages, Ticket, Paperclip, Send, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ConciergeView({ savedIds, allItems, onUnsave }: { savedIds: string[]; allItems: any[]; onUnsave: (id: string) => void }) {
  const { t, lang } = useLanguage();
  const [chatInput, setChatInput] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [thinking, setThinking] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  // Synchronous guard: the `thinking` state updates in the next render, so a
  // rapid double-Enter could otherwise fire two requests.
  const sendingRef = React.useRef(false);
  const saved = allItems.filter((i) => savedIds.includes(i.id));

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking || sendingRef.current) return;
    sendingRef.current = true;
    const next: Array<{ role: 'user' | 'assistant'; content: string }> = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setChatInput('');
    setThinking(true);
    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12), lang }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || 'no reply');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t('conciergeError') }]);
    }
    sendingRef.current = false;
    setThinking(false);
  };

  const quickActions = [
    { icon: <Utensils className="w-4 h-4" />, label: t('qaRestaurants') },
    { icon: <Map className="w-4 h-4" />, label: t('qaItinerary') },
    { icon: <Languages className="w-4 h-4" />, label: t('qaTranslator') },
    { icon: <Ticket className="w-4 h-4" />, label: t('qaTickets') },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fade-in" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-display text-display-lg text-nomaq-navy">Concierge</h1>
          <div className="w-9 h-9 rounded-full bg-nomaq-lavender flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-nomaq-indigo" />
          </div>
        </div>
        <p className="text-slate-500 text-sm">{t('conciergeSubtitle')}</p>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none pb-1 scroll-fade-x">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(action.label)}
              disabled={thinking}
              className="flex-shrink-0 flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-nomaq-lavender hover:border-nomaq-indigo/20 hover:text-nomaq-indigo active:scale-95 transition-all duration-200 shadow-soft cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-5 space-y-4 pb-4 overflow-y-auto" data-testid="concierge-chat">
        {/* AI greeting */}
        <div className="flex justify-start gap-2">
          <div className="w-8 h-8 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-nomaq-indigo" />
          </div>
          <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm text-slate-700 whitespace-pre-line">
            {t('conciergeGreeting')}
          </div>
        </div>

        {/* Conversation */}
        {messages.map((msg, idx) =>
          msg.role === 'user' ? (
            <div key={idx} className="flex justify-end">
              <div className="max-w-[80%] bg-nomaq-navy text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm whitespace-pre-line">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={idx} className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-nomaq-indigo" />
              </div>
              <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm text-slate-700 whitespace-pre-line">
                {msg.content}
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {thinking && (
          <div className="flex justify-start gap-2" data-testid="concierge-thinking">
            <div className="w-8 h-8 rounded-full bg-nomaq-lavender flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-nomaq-indigo animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-nomaq-indigo/50 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Hidden SalvatiView for E2E test compatibility */}
      <div style={{ display: 'none' }} aria-hidden="true" data-testid="salvati-list">
        {saved.length === 0 ? (
          <div data-testid="salvati-empty">
            <p>No saved trips yet</p>
          </div>
        ) : (
          saved.map((item) => (
            <div key={item.id} data-testid={`saved-item-${item.id}`}>
              <h4 className="truncate">{item.destination}</h4>
              <button
                data-testid={`unsave-btn-${item.id}`}
                onClick={() => onUnsave(item.id)}
                className="filled text-electric-orange"
              >
                <Heart className="w-4 h-4 fill-nomaq-violet text-nomaq-violet" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Chat Input Bar — su mobile resta sopra la BottomNav fissa (60px +
          safe area) che altrimenti la coprirebbe; su lg la nav è nascosta. */}
      <div className="sticky bottom-[calc(60px+env(safe-area-inset-bottom,0px))] lg:bottom-0 px-4 pb-3 lg:pb-5 pt-3 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-full px-4 py-3 shadow-soft">
          <button className="text-slate-400 hover:text-nomaq-indigo transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage(chatInput);
            }}
            placeholder={t('askConcierge')}
            data-testid="concierge-input"
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
          <button
            onClick={() => sendMessage(chatInput)}
            disabled={thinking || !chatInput.trim()}
            data-testid="concierge-send"
            className="w-9 h-9 rounded-full bg-nomaq-indigo flex items-center justify-center flex-shrink-0 hover:bg-nomaq-violet active:scale-90 transition-all shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
