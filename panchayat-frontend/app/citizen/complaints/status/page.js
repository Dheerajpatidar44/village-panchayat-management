"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      setLoading(true);
      const data = await api.get("/search?q=");
      if (data && data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Meri <span className="text-primary">Shikayatein</span></h1>
          <p className="text-slate-500 font-medium mt-1">Track the status of your reported village issues.</p>
        </div>
        <Link href="/citizen/complaints/new">
          <Button className="gap-2 bg-slate-900 rounded-2xl text-white hover:bg-slate-800"><MessageSquare className="w-4 h-4" /> New Complaint</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : complaints.length === 0 ? (
          <div className="text-center p-20 text-slate-500 bg-white rounded-[2.5rem] border border-border">
            You haven't filed any complaints yet.
          </div>
        ) : complaints.map((complaint) => (
          <Card key={complaint.id} className={complaint.priority === 'high' ? "border-l-4 border-l-rose-500" : ""}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    complaint.status === 'open' ? 'bg-rose-50 text-rose-600' : 
                    complaint.status === 'resolved' || complaint.status === 'closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                       <h4 className="text-xl font-black text-slate-900 line-clamp-1">{complaint.subject}</h4>
                       <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">{complaint.complaint_type}</span>
                       {complaint.priority === 'high' && <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-xl font-black uppercase tracking-tighter">URGENT</span>}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">{complaint.description}</p>
                    <p className="text-xs text-slate-400 font-bold mt-2">Ref ID: {complaint.complaint_number} • Posted on {new Date(complaint.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-t-0">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Current Status</p>
                      <p className={`text-lg font-black uppercase ${
                        complaint.status === 'open' ? 'text-rose-600' : 
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{complaint.status.replace("_", " ")}</p>
                   </div>
                   <Button variant="outline" className="rounded-xl" onClick={() => alert("Details modal coming soon!")}>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
