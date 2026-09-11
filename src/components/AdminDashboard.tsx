import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  Coins,
  HardDrive,
  X,
  Plus,
  Crown,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState(250);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMetrics();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMetrics();
  }, [isOpen]);

  const handleGrantCredits = async (userId: string) => {
    try {
      await api.adjustUserCredits(userId, adjustAmount);
      setActionSuccess(`Added ${adjustAmount} credits!`);
      setTimeout(() => setActionSuccess(''), 2500);
      fetchMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpgradeTier = async (userId: string, role: string, sub: string) => {
    try {
      await api.updateUserTier(userId, role, sub);
      setActionSuccess(`Upgraded user to ${role}!`);
      setTimeout(() => setActionSuccess(''), 2500);
      fetchMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Enterprise Admin Control Panel</h2>
              <p className="text-[11px] text-slate-400">
                User governance, AI credit limits, server-side processing metrics & audit logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Refresh Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {actionSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {loading || !data ? (
            <div className="h-48 flex items-center justify-center text-slate-400">
              Loading administration metrics...
            </div>
          ) : (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> TOTAL ACCOUNTS
                  </div>
                  <div className="text-xl font-bold text-slate-100">{data.metrics.totalUsers}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {data.metrics.premiumUsers} Premium • {data.metrics.freeUsers} Free
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> TOTAL CREDITS USED
                  </div>
                  <div className="text-xl font-bold text-amber-400">{data.metrics.totalCreditsUsed}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Across all video jobs</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-teal-400" /> ACTIVE PROJECTS
                  </div>
                  <div className="text-xl font-bold text-slate-100">{data.metrics.totalActiveProjects}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Stored in persistence store</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1">
                    <Activity className="w-3.5 h-3.5 text-purple-400" /> SYSTEM HEALTH
                  </div>
                  <div className="text-sm font-bold text-emerald-400">{data.metrics.systemHealth}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Uptime: {data.metrics.uptimeHours}h</div>
                </div>
              </div>

              {/* Users Management Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  User Accounts & Quota Enforcement
                </h3>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="p-2.5">User</th>
                        <th className="p-2.5">Role / Tier</th>
                        <th className="p-2.5">Remaining Credits</th>
                        <th className="p-2.5">Credits Used</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-200">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'premium'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                  : u.role === 'admin'
                                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-emerald-400">{u.credits}</td>
                          <td className="p-2.5 text-slate-400">{u.totalCreditsUsed || 0}</td>
                          <td className="p-2.5 text-right space-x-1.5">
                            <button
                              onClick={() => handleGrantCredits(u.id)}
                              className="px-2 py-1 text-[10px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition"
                            >
                              +250 Credits
                            </button>
                            {u.role === 'free' && (
                              <button
                                onClick={() => handleUpgradeTier(u.id, 'premium', 'premium_pro')}
                                className="px-2 py-1 text-[10px] font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded transition inline-flex items-center gap-1"
                              >
                                <Crown className="w-2.5 h-2.5" /> Upgrade
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Recent Server-Side Audit Logs</span>
                </h3>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 max-h-44 overflow-y-auto space-y-1.5 font-mono text-[10px]">
                  {data.recentLogs.map((log: any) => (
                    <div key={log.id} className="text-slate-400 flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-emerald-400 font-bold shrink-0">[{log.action}]</span>
                      <span className="text-slate-300 truncate">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
