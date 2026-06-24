'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Lightbulb, 
  Sparkles, 
  MapPin, 
  Building2, 
  Users, 
  HelpCircle,
  Cpu
} from 'lucide-react';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

export default function ValidatePage() {
  const router = useRouter();
  
  // Wizard steps: 1 (Basic Details), 2 (Problem & Persona), 3 (Solution & Target)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing AI Validator...');
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [countryRegion, setCountryRegion] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Loading text cycles
  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Scanning industry benchmarks...',
      'Mapping competitor SWOT matrix...',
      'Calculating TAM, SAM, and SOM sizes...',
      'Simulating pricing and MRR models...',
      'Drafting 9-slide investor pitch deck...',
      'Running success probability simulation...',
      'Writing Business Model Canvas blocks...',
      'Finalizing report formatting...'
    ];

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < messages.length - 1) {
        idx++;
        setLoadingMessage(messages[idx]);
      }
    }, 2800);

    return () => clearInterval(timer);
  }, [loading]);

  const handleNext = () => {
    if (step === 1 && (!name || !industry || !countryRegion)) {
      setError('Please fill in all basic details first.');
      return;
    }
    if (step === 2 && (!targetCustomers || !problemStatement)) {
      setError('Please outline target customers and the core problem statement.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution) {
      setError('Please provide your solution concept.');
      return;
    }
    
    setError('');
    setLoading(true);
    setLoadingMessage('Activating Antigravity AI Engine...');

    try {
      const res = await api.ideas.create({
        name,
        industry,
        countryRegion,
        targetCustomers,
        problemStatement,
        solution
      });

      // Confetti WOW celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setLoadingMessage('Report generated! Redirecting...');
      setTimeout(() => {
        router.push(`/reports/${res.ideaId}`);
      }, 1500);

    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred during AI validation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] px-4 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-white/10 shadow-2xl text-center flex flex-col items-center gap-6 relative z-10">
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Spinning load ring */}
            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <Cpu className="w-8 h-8 text-violet-400 animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white font-outfit">Validating Your Startup Idea</h3>
            <p className="text-sm text-gray-400 mt-2 font-medium animate-pulse">{loadingMessage}</p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full animate-[shimmer_2s_infinite]" style={{ width: '85%' }} />
          </div>

          <p className="text-[11px] text-gray-500 italic">This usually takes around 10-15 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full relative z-10">
      
      {/* Back button */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 cursor-pointer transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-10 bg-white/5 border border-white/10 rounded-2xl p-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
              step >= num 
                ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}>
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider hidden sm:inline ${
              step >= num ? 'text-violet-400' : 'text-gray-500'
            }`}>
              {num === 1 ? 'Concept' : num === 2 ? 'Problem' : 'Solution'}
            </span>
            {num < 3 && <div className="w-8 sm:w-16 h-px bg-white/10 mx-2" />}
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-outfit text-white">
            {step === 1 ? 'Startup Core Parameters' : step === 2 ? 'Customer Pain Points' : 'Solution Framework'}
          </h2>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Concept */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Startup Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lightbulb className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. EcoCycle, PayStream"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Industry / Domain
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Waste Management, FinTech SaaS, CleanTech"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Country / Region
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={countryRegion}
                  onChange={(e) => setCountryRegion(e.target.value)}
                  placeholder="e.g. USA, European Union, Global"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Problem & Customer */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Target Customers
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Users className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={targetCustomers}
                  onChange={(e) => setTargetCustomers(e.target.value)}
                  placeholder="e.g. Suburban families, Small businesses, Freelancers"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Problem Statement
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-gray-400">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  rows={4}
                  placeholder="Describe the exact pain points. E.g.: Food waste collection is messy and high friction, resulting in 40% of household organics ending up in landfills, costing families waste fees."
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Solution */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Startup Solution
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-gray-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <textarea
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  rows={6}
                  placeholder="Describe your solution. E.g.: A smart compost bin with weight sensors and carbon-filter vacuum seals that connects to an app, awarding composting tokens for garbage reductions."
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-8">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition-all border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer ml-auto"
            >
              <Cpu className="w-4 h-4" />
              <span>Generate AI Validation</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
