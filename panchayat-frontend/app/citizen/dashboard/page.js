"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Plus,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function CitizenDashboard() {
  const [userName, setUserName] = useState("Citizen");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    certApplied: 0,
    certApproved: 0,
    complaintsActive: 0,
    complaintsResolved: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("userName") || "Citizen");
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // Fallback endpoints assuming typical REST implementation for citizen self-data
      const [certs, compResults, noticesData] = await Promise.all([
        api.get("/search?q=").catch(() => ({ certificates: [] })), // Hack to get citizen certs if endpoint handles it
        api.get("/search?q=").catch(() => ({ complaints: [] })),
        api.get("/notices").catch(() => ([]))
      ]);
      
      const certificates = certs.certificates || [];
      const complaints = compResults.complaints || [];

      setStats({
        certApplied: certificates.length,
        certApproved: certificates.filter(c => c.status === "approved").length,
        complaintsActive: complaints.filter(c => c.status === "open" || c.status === "in_progress").length,
        complaintsResolved: complaints.filter(c => c.status === "resolved").length,
      });

      // Combine and sort activities
      const activities = [
        ...certificates.map(c => ({
          title: `App for ${c.certificate_type}`,
          time: new Date(c.submitted_at).toLocaleDateString(),
          status: c.status,
          type: "Certificate",
          timestamp: new Date(c.submitted_at).getTime()
        })),
        ...complaints.map(c => ({
          title: c.subject,
          time: new Date(c.submitted_at).toLocaleDateString(),
          status: c.status,
          type: "Complaint",
          timestamp: new Date(c.submitted_at).getTime()
        }))
      ].sort((a,b) => b.timestamp - a.timestamp).slice(0, 4);

      setRecentActivities(activities);

      if (noticesData && noticesData.length > 0) {
        setLatestNotice(noticesData[0]);
      }

    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Applied", value: stats.certApplied, icon: FileText, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Active", value: stats.complaintsActive, icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Approved", value: stats.certApproved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Pending", value: stats.certApplied - stats.certApproved, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
             <LayoutGrid className="w-3 h-3" /> Citizen Dashboard
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Radhe Radhe, <span className="text-primary">{userName}!</span></h1>
          <p className="text-slate-500 font-medium mt-1 italic">Welcome to your digital village portal. Everything looks good today.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="hidden sm:flex">Download History</Button>
           <Link href="/citizen/certificates/apply">
             <Button className="bg-primary text-white hover:bg-primary-dark">
                <Plus className="w-5 h-5 mr-2" /> New Application
             </Button>
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="group overflow-visible px-4 py-8 text-center flex flex-col items-center">
             <div className={`${stat.bg} ${stat.color} ${stat.border} border w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className="w-7 h-7" />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Quick Actions Card */}
          <Card className="border-none shadow-none bg-transparent">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">What do you need?</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href="/citizen/certificates/apply" className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all">
                  <div className="bg-blue-500/10 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Apply for Certificate</h4>
                  <p className="text-sm text-slate-400 font-medium">Income, Birth, or Residence documents for your family.</p>
                  <div className="mt-6 flex items-center text-primary font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                     Start Application <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
                
                <Link href="/citizen/complaints/new" className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all">
                  <div className="bg-rose-500/10 text-rose-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Lodge a Complaint</h4>
                  <p className="text-sm text-slate-400 font-medium">Issue with water, roads or electricity? Report it now.</p>
                  <div className="mt-6 flex items-center text-primary font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                     Lodge Complaint <ArrowUpRight className="w-4 h-4" />
                  </div>
                </Link>
             </div>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader 
              title="Application Timeline" 
              subtitle="Keep track of your latest requests and their progress" 
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {recentActivities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No recent activity found.</div>
                ) : recentActivities.map((activity, i) => (
                  <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg transition-all">
                        {activity.type === "Certificate" ? <FileText className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                         ['approved', 'resolved', 'closed'].includes(activity.status) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                       }`}>
                         {activity.status.replace("_", " ")}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Important Notice Board */}
          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
            <CardContent className="p-8 relative z-10">
              <div className="bg-primary/20 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <AlertCircle className="w-6 h-6 text-primary-light" />
              </div>
              <h3 className="text-2xl font-black mb-2">Notice Board</h3>
              {latestNotice ? (
                <>
                  <p className="font-bold text-primary-light text-sm mb-1">{latestNotice.title}</p>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                    {latestNotice.content}
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                  No new notices at the moment. Keep checking this space for updates.
                </p>
              )}
              <Link href="/citizen/notices">
                <Button size="sm" className="bg-primary text-white hover:bg-primary-dark border-none w-full">
                  View All Notices
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Progress Tracking (Mini) */}
          <Card>
             <CardHeader title="Village Stats" subtitle="Our village progress this month" />
             <CardContent className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Total Digitization</span>
                      <span className="text-primary font-black">94%</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[94%]" />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-slate-400">Scheme Utilization</span>
                      <span className="text-blue-500 font-black">62%</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[62%]" />
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <div>
                         <p className="text-xs font-black text-emerald-700 leading-none">Healthy Village</p>
                         <p className="text-[10px] text-emerald-600/70 font-bold mt-1 uppercase tracking-tight">Grade A Sustainability</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
