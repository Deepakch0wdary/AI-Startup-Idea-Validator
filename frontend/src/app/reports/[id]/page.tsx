'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  Award, 
  Compass, 
  Layers, 
  Briefcase, 
  Users, 
  ClipboardCopy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PieChart
} from 'lucide-react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function ReportViewer() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation Tabs: dashboard, canvas, swot, competitors, financials, risks, team, pitchdeck
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Pitch deck slide state
  const [currentSlide, setCurrentSlide] = useState(0);

  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchIdeaDetails = async () => {
      try {
        const data = await api.ideas.get(id);
        setIdea(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load validation report.');
      } finally {
        setLoading(false);
      }
    };
    fetchIdeaDetails();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Compiling report modules...</span>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] px-4">
        <div className="glass-panel max-w-md p-8 rounded-2xl border border-rose-500/20 text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h3 className="text-lg font-bold text-white">Error Loading Report</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{error || 'Startup report could not be loaded.'}</p>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Exports trigger
  const handlePrint = () => {
    window.print();
  };

  const slides = idea.pitchDeck?.slides || [];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6 no-print">
        <div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            {idea.name}
            <span className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 uppercase tracking-wider font-semibold">
              {idea.industry}
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Target Market: {idea.countryRegion}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={api.reports.downloadPdfUrl(id)}
            download
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </a>
          <a
            href={api.reports.downloadDocxUrl(id)}
            download
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>DOCX</span>
          </a>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          
          <Link
            href={`/mentor?ideaId=${id}`}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult AI Mentor</span>
          </Link>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2 no-print">
        {[
          { key: 'dashboard', label: 'Executive Summary', icon: Compass },
          { key: 'canvas', label: 'Business Canvas', icon: Layers },
          { key: 'swot', label: 'SWOT Analysis', icon: Award },
          { key: 'competitors', label: 'Competitors', icon: Users },
          { key: 'financials', label: 'Financials', icon: TrendingUp },
          { key: 'risks', label: 'Risks', icon: ShieldAlert },
          { key: 'team', label: 'Team Recommendation', icon: Briefcase },
          { key: 'pitchdeck', label: 'Investor Pitch Deck', icon: ClipboardCopy },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-all ${
                activeTab === t.key 
                  ? 'border-violet-500 text-violet-400 font-semibold' 
                  : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div ref={printAreaRef} className="space-y-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Summary */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white font-outfit mb-3">Startup Overview</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-sans">
                  {idea.report?.businessOverview}
                </p>
              </div>

              {/* Value prop & problem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-2">Value Proposition</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{idea.report?.valueProposition}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Core Problem Solved</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{idea.report?.problemSolved}</p>
                </div>
              </div>

              {/* TAM/SAM/SOM Metrics */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-violet-400" />
                  <span>Market Mapped Volumes</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">TAM (Total Addressable Market)</span>
                    <div className="text-xl font-black text-white mt-1">$5.0 B</div>
                    <p className="text-[10px] text-gray-400 mt-1">Global industry volume</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">SAM (Serviceable Addressable Market)</span>
                    <div className="text-xl font-black text-violet-400 mt-1">$1.2 B</div>
                    <p className="text-[10px] text-gray-400 mt-1">Country/Region share</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">SOM (Serviceable Obtainable Market)</span>
                    <div className="text-xl font-black text-emerald-400 mt-1">$80 M</div>
                    <p className="text-[10px] text-gray-400 mt-1">Target capture plan</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right side predictor and investor readiness */}
            <div className="space-y-6">
              
              {/* Success Predictor */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center">
                <h3 className="text-md font-bold text-white mb-6">Success Probability</h3>
                
                <div className="relative inline-flex items-center justify-center mb-6">
                  <svg className="w-32 h-32">
                    <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="54" cx="64" cy="64"/>
                    <circle 
                      className="text-violet-500" 
                      strokeWidth="8" 
                      strokeDasharray={339}
                      strokeDashoffset={339 - (339 * (idea.successPrediction?.successProbability || 65)) / 100}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="54" 
                      cx="64" 
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black text-white">{idea.successPrediction?.successProbability || 65}%</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mb-4">
                  <div>
                    <div className="text-sm font-bold text-rose-400">{idea.successPrediction?.failureRisk || 35}%</div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Failure Risk</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-400">{idea.successPrediction?.growthPotential || 75}%</div>
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Growth Potential</div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 italic text-left bg-white/5 border border-white/5 p-3 rounded-lg leading-relaxed">
                  {idea.successPrediction?.justification}
                </p>
              </div>

              {/* Investor Score */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="text-md font-bold text-white mb-4">Investor Readiness</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                      <span>Investor Fit Score</span>
                      <span className="text-violet-400">{idea.investorScore?.investorScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: `${idea.investorScore?.investorScore || 50}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                      <span>Scalability Score</span>
                      <span className="text-blue-400">{idea.investorScore?.scalabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${idea.investorScore?.scalabilityScore || 50}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                      <span>Market Fit</span>
                      <span className="text-emerald-400">{idea.investorScore?.marketFitScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${idea.investorScore?.marketFitScore || 50}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Investment Verdict</span>
                    <div className="text-xs text-white bg-white/5 border border-white/10 p-3 rounded-lg font-medium mt-1 leading-relaxed">
                      {idea.investorScore?.investmentRecommendation}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* BUSINESS MODEL CANVAS TAB */}
        {activeTab === 'canvas' && idea.businessModel && (
          <div className="glass-panel rounded-2xl border border-white/5 p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 font-outfit">Business Model Canvas</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Key Partners */}
              <div className="md:col-span-1 border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Key Partners</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {idea.businessModel.keyPartners.map((item: string, i: number) => (
                    <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>

              {/* Activities & Resources */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex-1">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Key Activities</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {idea.businessModel.keyActivities.map((item: string, i: number) => (
                      <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex-1">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Key Resources</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {idea.businessModel.keyResources.map((item: string, i: number) => (
                      <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Value Propositions */}
              <div className="md:col-span-1 border border-white/10 rounded-xl p-4 bg-violet-600/10">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Value Propositions</h4>
                <ul className="space-y-2 text-xs text-gray-200">
                  {idea.businessModel.valuePropositions.map((item: string, i: number) => (
                    <li key={i} className="flex gap-1.5"><span className="text-violet-500 font-bold">•</span> {item}</li>
                  ))}
                </ul>
              </div>

              {/* Relationships & Channels */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex-1">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Customer Relationships</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {idea.businessModel.customerRelationships.map((item: string, i: number) => (
                      <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border border-white/10 rounded-xl p-4 bg-white/5 flex-1">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Channels</h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {idea.businessModel.channels.map((item: string, i: number) => (
                      <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Customer Segments */}
              <div className="md:col-span-1 border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Customer Segments</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {idea.businessModel.customerSegments.map((item: string, i: number) => (
                    <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Costs & Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Cost Structure</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {idea.businessModel.costStructure.map((item: string, i: number) => (
                    <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-3">Revenue Streams</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {idea.businessModel.revenueStreams.map((item: string, i: number) => (
                    <li key={i} className="flex gap-1.5"><span className="text-violet-500">•</span> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SWOT TAB */}
        {activeTab === 'swot' && idea.swot && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit no-print">SWOT Matrix</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6">
                <h4 className="text-md font-bold text-emerald-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Strengths (S)</span>
                </h4>
                <ul className="space-y-3">
                  {idea.swot.strengths.map((str: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-emerald-500 font-bold">•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="border border-rose-500/20 bg-rose-500/5 rounded-2xl p-6">
                <h4 className="text-md font-bold text-rose-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>Weaknesses (W)</span>
                </h4>
                <ul className="space-y-3">
                  {idea.swot.weaknesses.map((str: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-rose-500 font-bold">•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="border border-blue-500/20 bg-blue-500/5 rounded-2xl p-6">
                <h4 className="text-md font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Opportunities (O)</span>
                </h4>
                <ul className="space-y-3">
                  {idea.swot.opportunities.map((str: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-blue-500 font-bold">•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6">
                <h4 className="text-md font-bold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Threats (T)</span>
                </h4>
                <ul className="space-y-3">
                  {idea.swot.threats.map((str: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 leading-relaxed pl-4 relative">
                      <span className="absolute left-0 text-amber-500 font-bold">•</span>
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* COMPETITORS TAB */}
        {activeTab === 'competitors' && idea.competitors && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit">Competitor Mapping</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {idea.competitors.map((comp: any, i: number) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-bold text-white">{comp.name}</h4>
                      <span className="text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                        {comp.type}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Competitor Strengths</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {comp.strengths.map((str: string, idx: number) => (
                            <span key={idx} className="text-[10px] text-gray-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                              {str}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Competitor Weaknesses</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {comp.weaknesses.map((str: string, idx: number) => (
                            <span key={idx} className="text-[10px] text-gray-400 bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded-md">
                              {str}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 bg-violet-600/5 border border-violet-500/10 rounded-xl p-3">
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Our Advantage Over Them</span>
                    <ul className="space-y-1.5 mt-2">
                      {comp.advantages.map((adv: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-200 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'financials' && idea.revenueForecast && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit">Financial Forecast Models</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-2">Pricing Model Design</h4>
                <div className="text-sm font-bold text-white mb-4">{idea.revenueForecast.pricingModel}</div>
                
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-2">Primary Streams</h4>
                <ul className="space-y-2">
                  {idea.revenueForecast.streams.map((str: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5-Year ARR Growth Chart using Recharts */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-4">5-Year ARR Projections</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={idea.revenueForecast.arrForecast}>
                      <defs>
                        <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorArr)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 12-Month MRR Growth Area Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-4">12-Month MRR Progression</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={idea.revenueForecast.mrrForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === 'risks' && idea.riskReport && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit">Risk Matrix Evaluation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-2">Technical Risk</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{idea.riskReport.technicalRisk}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-2">Financial Risk</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{idea.riskReport.financialRisk}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-2">Adoption Risk</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{idea.riskReport.adoptionRisk}</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-2">Market Risk</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{idea.riskReport.marketRisk}</p>
              </div>
            </div>
          </div>
        )}

        {/* TEAM RECOMM TAB */}
        {activeTab === 'team' && idea.teamRecommendation && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white font-outfit">MVP Team Roles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(idea.teamRecommendation.roles as any[]).map((role: any, idx: number) => (
                <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-md font-bold text-violet-400 mb-2">{role.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed mb-4">{role.reason}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 text-xs font-semibold mt-auto">
                    <span className="text-gray-500">Estimated Cost</span>
                    <span className="text-white bg-white/5 px-2.5 py-1 rounded border border-white/10">{role.budget}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PITCH DECK TAB */}
        {activeTab === 'pitchdeck' && slides.length > 0 && (
          <div className="space-y-6 no-print">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white font-outfit">Investor Pitch Deck Slides</h3>
              <a
                href={api.reports.downloadPptxUrl(id)}
                download
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold cursor-pointer transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Editable PowerPoint (PPTX)</span>
              </a>
            </div>

            {/* Slide Viewer */}
            <div className="border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative bg-[#0f172a] h-[420px] flex flex-col justify-between p-8">
              
              {/* Background accent glow */}
              <div className="absolute top-10 right-10 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />

              <div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400 uppercase tracking-widest font-semibold">
                  Slide {slides[currentSlide].slideNumber || currentSlide + 1}
                </span>

                <h2 className="text-2xl font-black font-outfit text-violet-400 mt-4 mb-6">
                  {slides[currentSlide].title}
                </h2>

                <ul className="space-y-3 text-sm text-gray-300">
                  {slides[currentSlide].content.map((point: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <span className="text-xs text-emerald-400 font-bold">
                  {slides[currentSlide].metrics}
                </span>
                
                {/* Navigation slide arrows */}
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide(currentSlide - 1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500 font-mono">
                    {currentSlide + 1} / {slides.length}
                  </span>
                  <button
                    disabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide(currentSlide + 1)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* List slides summaries below */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {slides.map((s: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`py-2 rounded-lg text-center text-xs font-semibold border cursor-pointer transition-all ${
                    currentSlide === idx 
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  S{idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
