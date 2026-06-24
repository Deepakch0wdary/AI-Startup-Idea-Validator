'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lightbulb, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  BrainCircuit, 
  CheckCircle,
  Sparkles,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-gray-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between w-full z-20">
        <Link href="/" className="flex items-center gap-2 text-violet-400 font-bold text-xl font-outfit">
          <Lightbulb className="w-6 h-6 animate-pulse" />
          <span>Antigravity <span className="text-white">Validator</span></span>
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-500 font-medium text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-all">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-500 font-medium text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Validated by Enterprise-Grade AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-outfit text-white max-w-4xl mx-auto leading-tight">
          Validate Your Startup Idea <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">In 60 Seconds</span>
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Stop building what nobody wants. Get a complete business roadmap, competitor SWOT analysis, financial models, and investor-ready pitch decks instantly.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            <span>Analyze Your Idea Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium border border-white/10 transition-all cursor-pointer text-center"
          >
            View Pricing
          </a>
        </div>

        {/* Interactive App Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-md p-2 shadow-2xl">
          <div className="rounded-xl border border-white/5 bg-slate-950/80 p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs text-gray-500 font-mono">dashboard.antigravity.ai/reports/ecocycle</div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Success Probability: 84%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-violet-400 mb-2">Value Proposition</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  EcoCycle automates family food-waste collection using IoT bin sensors, reducing disposal friction by 70% and turning waste into compost credits.
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Market Size (TAM)</h4>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-white">$5.2 Billion</span>
                  <span className="text-[10px] text-gray-400">CAGR 12%</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">Based on household organic waste trends in North America and Western Europe.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">AI SWOT analysis</h4>
                <div className="space-y-1.5">
                  <div className="text-[10px] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Strengths: Zero-friction IoT sensor</div>
                  <div className="text-[10px] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Weaknesses: High initial sensor CAC</div>
                  <div className="text-[10px] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Opportunities: Smart city integration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-slate-950/40 border-t border-b border-white/5 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight font-outfit text-white sm:text-4xl">
              11 Enterprise-Grade Valuation Engines
            </h2>
            <p className="mt-4 text-gray-400">
              Each validation builds a complete set of databases. You receive deep strategizing across all corporate dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-2xl">
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-fit mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Startup Success Predictor</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Calculates success rate percentages and growth coefficients, backed by detailed industry reports.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl w-fit mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">TAM/SAM/SOM Projections</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Unlock exact market volume forecasts and customer capture potential mapped onto interactive charts.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Mentor Integrations</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Discuss roadmap and pitch details with specialized AI consultants (VC, Product Manager, Marketer).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold font-outfit text-white">Transparent, Tiered Plans</h2>
          <p className="mt-4 text-gray-400">Start free to validate early designs, upgrade when raising funds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Free Tier</span>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/ forever</span>
              </div>
              <p className="mt-6 text-sm text-gray-400">Perfect for initial ideation and student founders.</p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>3 Startup validation reports</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic SWOT reports</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Web-based dashboard access</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/register" 
              className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-full font-semibold transition-all text-center"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 rounded-2xl border-2 border-violet-500 relative flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <span className="absolute top-0 right-8 -translate-y-1/2 bg-violet-600 text-white text-xs px-3 py-1 rounded-full uppercase font-bold border border-violet-400">Popular</span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">Founder Pro</span>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$49</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/ month</span>
              </div>
              <p className="mt-6 text-sm text-gray-400">Excellent for pitching and raising early angel capital.</p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited reports</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full AI Mentor (all roles)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export PPTX, PDF, and DOCX</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/register?plan=pro" 
              className="mt-8 w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-full font-semibold transition-all text-center shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise */}
          <div className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Enterprise</span>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$199</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/ month</span>
              </div>
              <p className="mt-6 text-sm text-gray-400">Built for incubators, accelerators, and VC firms.</p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Collaborative workspaces</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Custom AI Model tuning</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Admin metrics & API keys</span>
                </li>
              </ul>
            </div>
            <Link 
              href="/register?plan=enterprise" 
              className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-full font-semibold transition-all text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#070b12] py-8 text-center text-xs text-gray-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© 2026 Antigravity Labs. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Terms of Use</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
