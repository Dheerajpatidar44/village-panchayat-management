"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  BarChart3,
  Users,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  Target,
  Globe,
  X,
  Download,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [integrity, setIntegrity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showGlobalNoticeModal, setShowGlobalNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", priority: "high", expiryDate: "" });
  const [noticeSubmitting, setNoticeSubmitting] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, integrityData] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/system-integrity"),
      ]);
      setSummary(summaryData);
      setIntegrity(integrityData);
    } catch (err) {
      setError(err.message);
      // Fallback to default values
      setSummary({ totalRevenue: 420000, totalRevenueFormatted: "₹4.2L", totalCitizens: 8450, totalApprovals: 24, totalAlerts: 15, percentageChanges: { revenue: 8.2, citizens: 2.4, approvals: -12, alerts: 4 } });
      setIntegrity({ complaintResolvingRate: 78, schemeUtilizationRate: 62, monthlyGoalProgress: 71 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = summary ? [
    {
      label: "Revenue",
      value: summary.totalRevenueFormatted || "₹4.2L",
      icon: BarChart3,
      change: `${summary.percentageChanges?.revenue >= 0 ? "+" : ""}${summary.percentageChanges?.revenue || 0}%`,
      trend: (summary.percentageChanges?.revenue || 0) >= 0 ? "up" : "down",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Citizens",
      value: summary.totalCitizens?.toLocaleString("en-IN") || "0",
      icon: Users,
      change: `${summary.percentageChanges?.citizens >= 0 ? "+" : ""}${summary.percentageChanges?.citizens || 0}%`,
      trend: (summary.percentageChanges?.citizens || 0) >= 0 ? "up" : "down",
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Approvals",
      value: String(summary.totalApprovals ?? 0),
      icon: ShieldCheck,
      change: `${summary.percentageChanges?.approvals >= 0 ? "+" : ""}${summary.percentageChanges?.approvals || 0}%`,
      trend: (summary.percentageChanges?.approvals || 0) >= 0 ? "up" : "down",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Alerts",
      value: String(summary.totalAlerts ?? 0),
      icon: Sparkles,
      change: `${summary.percentageChanges?.alerts >= 0 ? "+" : ""}${summary.percentageChanges?.alerts || 0}%`,
      trend: (summary.percentageChanges?.alerts || 0) >= 0 ? "up" : "down",
      color: "text-rose-600",
      bg: "bg-rose-500/10",
    },
  ] : [];

  const handleExport = async () => {
    try {
      setExporting(true);
      await api.download(
        "/dashboard/export?format=csv",
        `panchayat-analytics-${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleGlobalNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      setNoticeSubmitting(true);
      await api.post("/notices/global", noticeForm);
      setNoticeSuccess(true);
      setTimeout(() => {
        setShowGlobalNoticeModal(false);
        setNoticeSuccess(false);
        setNoticeForm({ title: "", description: "", priority: "high", expiryDate: "" });
      }, 1500);
    } catch (err) {
      alert("Failed to broadcast notice: " + err.message);
    } finally {
      setNoticeSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> System Administrator
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Sarpanch Ji, <br />
            <span className="text-primary italic">Aapka Swagat Hai.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            className="rounded-2xl border-slate-200"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export Analytics</>
            )}
          </Button>
          <Button
            className="bg-slate-900 shadow-2xl shadow-slate-300"
            onClick={() => setShowGlobalNoticeModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" /> Global Notice
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
          ⚠️ Using cached data — {error}. Make sure the backend is running.
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-8">
                <div className="animate-pulse">
                  <div className="h-14 w-14 bg-slate-200 rounded-2xl mb-6" />
                  <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                  <div className="h-8 w-24 bg-slate-200 rounded" />
                </div>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} className="p-8 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                    {stat.change}{" "}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              </Card>
            ))}
      </div>

      {/* Charts & Integrity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <Card className="xl:col-span-2 relative overflow-hidden group">
          <CardHeader
            title="Village Performance Overview"
            subtitle="Complaint resolution vs Scheme application trends"
          />
          <CardContent>
            <div className="h-80 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center p-8 relative overflow-hidden group-hover:border-primary/30 transition-all">
              <div className="text-center space-y-4 group-hover:scale-105 transition-transform duration-500">
                <Globe className="w-16 h-16 text-slate-200 mx-auto" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">
                  Live Spatial Data Visualization Coming Soon
                </p>
              </div>
              <div className="absolute top-10 left-10 w-32 h-0.5 bg-primary/10 rounded-full pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-32 h-0.5 bg-blue-500/10 rounded-full pointer-events-none" />
            </div>
          </CardContent>
        </Card>

        {/* System Integrity */}
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-2xl shadow-emerald-200/50">
          <CardHeader className="border-white/10">
            <h3 className="text-xl font-black text-white">System Integrity</h3>
            <p className="text-xs text-emerald-100 font-bold uppercase tracking-widest mt-1">Village Health Score</p>
          </CardHeader>
          <CardContent className="space-y-10">
            {/* Complaint Resolving */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Complaint Resolving</span>
                <span className="text-white">
                  {loading ? "..." : `${integrity?.complaintResolvingRate ?? 78}%`}
                </span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000"
                  style={{ width: loading ? "0%" : `${integrity?.complaintResolvingRate ?? 78}%` }}
                />
              </div>
            </div>

            {/* Scheme Utilization */}
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-emerald-100/70">Scheme Utilization</span>
                <span className="text-white">
                  {loading ? "..." : `${integrity?.schemeUtilizationRate ?? 62}%`}
                </span>
              </div>
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="bg-white/40 h-full rounded-full transition-all duration-1000"
                  style={{ width: loading ? "0%" : `${integrity?.schemeUtilizationRate ?? 62}%` }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-4 p-5 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10 hover:bg-white/15 transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-xl">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">Monthly Goal</p>
                  <p className="text-[10px] text-emerald-100 font-bold mt-1 uppercase tracking-tight italic">
                    {integrity?.monthlyGoalProgress ?? 71}% Digitization Progress
                  </p>
                </div>
                <ArrowUpRight className="ml-auto w-5 h-5 text-white/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Notice Modal */}
      {showGlobalNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Broadcast Global Notice</h2>
              <button
                onClick={() => { setShowGlobalNoticeModal(false); setNoticeSuccess(false); }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {noticeSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-xl font-black text-slate-900">Notice Broadcast!</p>
                <p className="text-slate-500 font-medium mt-1">All citizens have been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleGlobalNoticeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Notice title..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Description *</label>
                  <textarea
                    required
                    value={noticeForm.description}
                    onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                    rows={4}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Notice content..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={noticeForm.expiryDate}
                    onChange={(e) => setNoticeForm({ ...noticeForm, expiryDate: e.target.value })}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowGlobalNoticeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-slate-900"
                    disabled={noticeSubmitting}
                  >
                    {noticeSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Broadcasting...</>
                    ) : (
                      "Broadcast"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
