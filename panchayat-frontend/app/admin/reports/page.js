"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart as PieChartIcon, BarChart2, Download, Table, Calendar, Filter, Loader2, Users, FileText, MessageSquare, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const reports = [
    { title: "Monthly Revenue Report", category: "Finance", format: "PDF/CSV" },
    { title: "Scheme Distribution Summary", category: "Schemes", format: "Excel" },
    { title: "Grievance Resolution Rate", category: "Public", format: "PDF" },
    { title: "Village Population Growth", category: "Health", format: "Excel" },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const result = await api.get("/reports/summary");
      setData(result);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper calcs
  const resolutionRate = data ? ((data.complaints.resolved + data.complaints.closed) / Math.max(1, data.complaints.total)) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
          <p className="text-slate-500">Analyze village progress and generate documentation</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Calendar className="w-4 h-4 mr-2" /> Current Year</Button>
           <Button><Download className="w-4 h-4 mr-2" /> Export All</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2">
              <CardHeader title="Analytical Overview" subtitle="Key metrics across modules" />
              <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Completion Rate</p>
                       <p className="text-2xl font-bold text-slate-900">{resolutionRate.toFixed(1)}%</p>
                       <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: `${resolutionRate}%` }}></div>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Fund Utilization</p>
                       <p className="text-2xl font-bold text-slate-900">{data.revenue.formatted}</p>
                       <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[75%]"></div>
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Active Citizens</p>
                       <p className="text-2xl font-bold text-slate-900">{data.users.citizens}</p>
                       <div className="w-full bg-slate-200 h-1 rounded-full mt-4 flex items-center">
                          <Users className="w-3 h-3 text-slate-400 ml-auto" />
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Certificates</p>
                       <p className="text-2xl font-bold text-slate-900">{data.certificates.total}</p>
                       <div className="w-full bg-slate-200 h-1 rounded-full mt-4 overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(data.certificates.approved / Math.max(1, data.certificates.total)) * 100}%` }}></div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                       <FileText className="w-8 h-8 text-slate-300 mb-2" />
                       <h4 className="font-bold text-slate-700">Scheme Breakdown</h4>
                       <p className="text-xs text-slate-500 mt-2">{data.schemes.active} Active schemes vs {data.schemes.inactive} Inactive</p>
                    </div>
                    <div className="h-48 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                       <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                       <h4 className="font-bold text-slate-700">Grievance Status</h4>
                       <p className="text-xs text-slate-500 mt-2">{data.complaints.open} Open, {data.complaints.in_progress} In Progress<br/>{data.complaints.resolved} Resolved</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card>
              <CardHeader title="Available Reports" />
              <CardContent className="p-0">
                 <div className="divide-y divide-border">
                    {reports.map((report, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <div className="bg-primary/5 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                               <Table className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                               <p className="text-[10px] text-slate-400 uppercase font-bold">{report.category}</p>
                            </div>
                         </div>
                         <Download className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                 </div>
                 <div className="p-4 border-t border-border">
                    <Button variant="ghost" className="w-full text-xs" onClick={() => alert("Report generation triggered.")}>Create Custom Report</Button>
                 </div>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
}
