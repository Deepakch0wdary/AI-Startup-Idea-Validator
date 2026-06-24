'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  Lightbulb, 
  MapPin, 
  MessageSquareCode,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async (query = '') => {
    try {
      const data = await api.ideas.list(query);
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchReports();
  }, [router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchReports(val);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this startup report? All SWOT, Competitor, and Pitch analyses will be permanently deleted.')) {
      return;
    }
    try {
      await api.ideas.delete(id);
      setReports(reports.filter(r => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete report.');
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.ideas.duplicate(id);
      await fetchReports(search);
      alert('Report duplicated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate report.');
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics
  const totalIdeas = reports.length;
  const avgSuccess = totalIdeas > 0 
    ? Math.round(reports.reduce((acc, r) => acc + (r.successPrediction?.successProbability || 0), 0) / totalIdeas) 
    : 0;
  const highInvestorScoreCount = reports.filter(r => (r.investorScore?.investorScore || 0) > 75).length;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      
      {/* Upper banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-white">Your Startup Portfolio</h1>
          <p className="text-gray-400 text-sm mt-1">Select or launch validation reports to analyze startup metrics</p>
        </div>
        <Link 
          href="/validate"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Validate New Idea</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalIdeas}</div>
            <div className="text-xs text-gray-400 font-medium">Validated Ideas</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{avgSuccess}%</div>
            <div className="text-xs text-gray-400 font-medium">Average Success Rate</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <MessageSquareCode className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{highInvestorScoreCount}</div>
            <div className="text-xs text-gray-400 font-medium">High Investor Readiness (&gt;75)</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by startup name, industry, region..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading startup reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
          <div className="inline-flex p-4 bg-white/5 rounded-full text-gray-400 mb-4">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No startup reports found</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
            {search ? 'No results match your search query.' : 'You haven\'t validated any startup ideas yet. Submit your first concept to generate a complete business audit.'}
          </p>
          {!search && (
            <Link
              href="/validate"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer"
            >
              Get Started
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">
                    {report.industry}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span>{report.successPrediction?.successProbability || 50}%</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{report.name}</h3>
                
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span className="line-clamp-1">{report.countryRegion}</span>
                </div>

                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-6">
                  {report.problemStatement}
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDuplicate(report.id, e)}
                    title="Duplicate Report"
                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    title="Delete Report"
                    className="p-2 text-gray-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/10 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/reports/${report.id}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    <span>Analyze</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
