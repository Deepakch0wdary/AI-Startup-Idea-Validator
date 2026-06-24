'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Sparkles, 
  User, 
  ChevronDown, 
  TrendingUp, 
  BrainCircuit, 
  Compass, 
  Lightbulb, 
  Megaphone, 
  Users,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

const MENTOR_ROLES = [
  { key: 'CONSULTANT', name: 'Startup Consultant', desc: 'Strategic, process-oriented, focused on business plan details and execution.', icon: Compass, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { key: 'INVESTOR', name: 'Investor Advisor', desc: 'Blunt, financially focused, evaluates metrics, valuation, risk, and funding ask.', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { key: 'PM', name: 'Product Manager', desc: 'Product scope, features prioritization, user journeys, and technical MVP stages.', icon: BrainCircuit, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { key: 'MARKETER', name: 'Marketing Strategist', desc: 'Branding, channels, target customer reach, CAC/LTV numbers, growth hacks.', icon: Megaphone, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { key: 'ANALYST', name: 'Business Analyst', desc: 'Core SWOT matrices, competitor threats, and data-driven market insights.', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' }
];

function MentorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [selectedRole, setSelectedRole] = useState('CONSULTANT');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(true);
  const [error, setError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Read initial idea from query param
  const paramIdeaId = searchParams.get('ideaId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadIdeas = async () => {
      try {
        const list = await api.ideas.list();
        setIdeas(list);
        if (list.length > 0) {
          setSelectedIdeaId(paramIdeaId || list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user startup ideas.');
      } finally {
        setIdeasLoading(false);
      }
    };

    loadIdeas();
  }, [paramIdeaId, router]);

  // Load chat history when idea or mentor role changes
  useEffect(() => {
    if (!selectedIdeaId) return;
    
    const fetchChatHistory = async () => {
      try {
        setError('');
        const history = await api.mentor.history(selectedIdeaId, selectedRole);
        setMessages(history);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve conversation logs.');
      }
    };

    fetchChatHistory();
  }, [selectedIdeaId, selectedRole]);

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedIdeaId || loading) return;
    
    setInputText('');
    setLoading(true);
    setError('');

    // Optimistically update UI with user's message
    const tempUserMsg = { id: Math.random().toString(), role: 'user', content: text, createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const responseData = await api.mentor.ask(selectedIdeaId, {
        mentorRole: selectedRole,
        message: text
      });

      const tempAssistantMsg = { id: Math.random().toString(), role: 'assistant', content: responseData.response, createdAt: new Date() };
      setMessages(prev => [...prev, tempAssistantMsg]);
    } catch (err: any) {
      setError(err.message || 'Failed to get a response from your AI Mentor.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const activeMentor = MENTOR_ROLES.find(r => r.key === selectedRole) || MENTOR_ROLES[0];
  const ActiveIcon = activeMentor.icon;

  const currentIdeaName = ideas.find(i => i.id === selectedIdeaId)?.name || 'Select startup';

  const quickPrompts = [
    'How do I get customers?',
    'How much funding is needed?',
    'How do I beat competitors?',
    'What should I build first?',
    'How can I improve my success score?'
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full h-[calc(100vh-100px)] flex flex-col relative z-10">
      
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        
        {/* Left Control Panel: Idea & Mentor select */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          
          {/* Startup Selector */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Discussing Startup</label>
            {ideasLoading ? (
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : ideas.length === 0 ? (
              <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                You must validate an idea before consulting the mentor.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedIdeaId}
                  onChange={(e) => setSelectedIdeaId(e.target.value)}
                  className="w-full py-2.5 pl-4 pr-10 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none appearance-none cursor-pointer"
                >
                  {ideas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Mentor List selectors */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex-1 flex flex-col gap-2 overflow-y-auto">
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Select Mentor Persona</span>
            {MENTOR_ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isActive = selectedRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setSelectedRole(role.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-violet-600/15 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-gray-400'}`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{role.name}</div>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Chat Panel */}
        <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden h-full">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-slate-900/40 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${activeMentor.color}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{activeMentor.name}</div>
              <div className="text-[10px] text-gray-400 font-medium">Discussing &quot;{currentIdeaName}&quot;</div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-20 max-w-sm mx-auto flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full border ${activeMentor.color}`}>
                  <ActiveIcon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-white">Start Consulting Your Mentor</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ask startup-specific questions regarding your SWOT, revenue forecasting, competitors, and product milestones.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={msg.id || i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] p-4 rounded-2xl border text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 border-violet-500 text-white rounded-br-none shadow-[0_4px_10px_rgba(139,92,246,0.15)]'
                      : 'bg-white/5 border-white/5 text-gray-200 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-bl-none text-gray-400 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>{activeMentor.name} is writing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts list */}
          {ideas.length > 0 && (
            <div className="px-6 py-2 bg-slate-950/20 flex gap-2 overflow-x-auto border-t border-white/5 no-scrollbar shrink-0">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 hover:text-white font-medium whitespace-nowrap cursor-pointer transition-all disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel */}
          <div className="p-4 border-t border-white/10 bg-slate-900/40 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!selectedIdeaId || loading}
                placeholder={selectedIdeaId ? `Ask the mentor about ${currentIdeaName}...` : 'Select a startup idea first...'}
                className="flex-1 py-3 px-4 rounded-xl glass-input text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading || !selectedIdeaId}
                className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 border border-transparent disabled:border-white/5 text-white disabled:text-gray-500 rounded-xl cursor-pointer disabled:pointer-events-none transition-all shadow-[0_0_10px_rgba(139,92,246,0.2)]"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function MentorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading AI Mentor...</span>
      </div>
    }>
      <MentorPageContent />
    </Suspense>
  );
}
