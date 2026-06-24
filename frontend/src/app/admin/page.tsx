'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Users as UsersIcon, 
  FileText, 
  MessageSquare, 
  Cpu, 
  Trash2, 
  Crown, 
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setError('');
      const usersData = await api.admin.users();
      const analyticsData = await api.admin.analytics();
      
      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message || 'You are not authorized to view the admin panel.');
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
    loadAdminData();
  }, [router]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete user "${userName}"? This will permanently delete their account and all their startup validation reports and chat logs.`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.admin.deleteUser(userId);
      setSuccessMsg(res.message || 'User deleted successfully.');
      await loadAdminData();
      
      // Auto clear alert
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    try {
      setLoading(true);
      const res = await api.admin.updateSubscription(userId, plan);
      setSuccessMsg(res.message || 'Subscription plan updated.');
      await loadAdminData();
      
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription plan.');
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] gap-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading administrative controls...</span>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] px-4">
        <div className="glass-panel max-w-md p-8 text-center flex flex-col items-center gap-4 border border-rose-500/20">
          <ShieldAlert className="w-12 h-12 text-rose-500" />
          <h3 className="text-lg font-bold text-white">Access Denied</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = analytics?.summary || { totalUsers: 0, totalReports: 0, totalMentorQuestions: 0, aiTokenMockUsage: 0 };
  const plans = analytics?.subscriptions || { FREE: 0, PRO: 0, ENTERPRISE: 0 };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold font-outfit text-white flex items-center gap-3">
            Admin Control Panel
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              System Root
            </span>
          </h1>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Total Registered Users</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.totalReports}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Startup Reports Generated</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.totalMentorQuestions}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Mentor Interactions</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{(stats.aiTokenMockUsage / 1000).toFixed(1)}k</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Simulated Tokens Used</div>
          </div>
        </div>
      </div>

      {/* Main panel split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* User Table (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-violet-400" />
            <span>Manage System Accounts</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Reports</th>
                  <th className="p-3">Subscription</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-all">
                    <td className="p-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-semibold font-mono">{u._count?.ideas || 0}</td>
                    <td className="p-3">
                      <select
                        value={u.subscription?.plan || 'FREE'}
                        onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                        className="py-1 px-2 rounded-md bg-slate-900 border border-white/10 text-xs text-white focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 cursor-pointer transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription breakdown & activity logs (1 col) */}
        <div className="space-y-6">
          
          {/* Subscription Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-md font-bold text-white mb-4">Subscription Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">FREE tier</span>
                <span className="font-bold text-white">{plans.FREE} users</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-violet-400 font-semibold">PRO tier</span>
                <span className="font-bold text-white">{plans.PRO} users</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-400 font-semibold">ENTERPRISE tier</span>
                <span className="font-bold text-white">{plans.ENTERPRISE} users</span>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-md font-bold text-white mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>System Activity Logs</span>
            </h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {analytics?.recentReports.map((r: any, idx: number) => (
                <div key={idx} className="border-l-2 border-violet-500 pl-3 py-0.5">
                  <div className="text-xs font-bold text-white">Idea Validated: &quot;{r.name}&quot;</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Industry: {r.industry} | {new Date(r.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
              {analytics?.recentUsers.map((u: any, idx: number) => (
                <div key={idx} className="border-l-2 border-emerald-500 pl-3 py-0.5">
                  <div className="text-xs font-bold text-white">User Joined: {u.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Email: {u.email} | {new Date(u.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
