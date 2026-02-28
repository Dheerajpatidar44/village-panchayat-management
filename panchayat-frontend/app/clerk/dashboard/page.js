"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { 
  Users, 
  FileCheck, 
  MessageCircle, 
  Clock,
  ArrowUpRight,
  Loader2,
  Search,
  Zap,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ClerkDashboard() {
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [summary, certs] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/search?q=") // To get pending certificates
      ]);
      
      setData(summary);
      
      if (certs && certs.certificates) {
        setTasks(certs.certificates.filter(c => c.status === "pending").slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Citizens", value: data?.citizens_registered || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Pending Tasks", value: tasks.length, icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Rev Collected", value: `₹${(data?.revenue_collected || 0).toLocaleString()}`, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Open Complaints", value: data?.open_complaints || 0, icon: MessageCircle, color: "text-rose-600", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
             <Clock className="w-3 h-3" /> Duty: Active Shift
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Karmachari <span className="text-primary">Dashboard</span></h1>
          <p className="text-slate-500 font-medium mt-1">Ready to serve the citizens. {tasks.length} pending tasks require your attention.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="gap-2"><Search className="w-4 h-4" /> Quick Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-8">
             <div className="flex items-start justify-between">
                <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                   <stat.icon className="w-6 h-6" />
                </div>
             </div>
             <div className="mt-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader title="Action Required" subtitle="Verify documents and update complaint status" />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                  No pending tasks!
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Application ID</th>
                      <th className="px-8 py-5">Task Type</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tasks.map((task, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-900">{task.application_number}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{task.citizen?.full_name || "Unknown"}</div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-500">{task.certificate_type}</td>
                        <td className="px-8 py-6 text-right">
                          <Link href="/clerk/verification">
                            <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-white group-hover:shadow-lg transition-all rounded-xl">
                              Review <ArrowUpRight className="ml-1 w-3 h-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
           <CardHeader className="border-white/5">
              <h3 className="text-xl font-black text-white">Daily Target</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Shift Progress</p>
           </CardHeader>
           <CardContent className="space-y-8">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-white/10 rounded-3xl relative">
                 <svg className="w-32 h-32 rotate-[-90deg]">
                    <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/10" />
                    <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="364" strokeDashoffset="109" className="text-primary" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">70%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Done</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span className="text-slate-400 tracking-wider">Reports Ready</span>
                    <span className="text-emerald-400">Done</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span className="text-slate-400 tracking-wider">Citizen Documents</span>
                    <span className="text-amber-400 italic">Pending</span>
                 </div>
              </div>
              <Button className="w-full py-6 bg-white/10 hover:bg-white/20 border-none text-white rounded-2xl">End Shift</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
