"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      alert(`Complaint marked as ${status}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating complaint.");
    }
  };

  const filtered = filter === "all" ? complaints : complaints.filter(c => c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Tracking</h1>
          <p className="text-slate-500">Resolve citizen grievances and update status</p>
        </div>
        <div className="flex gap-2">
           <select 
             className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           >
             <option value="all">All Complaints</option>
             <option value="open">Open</option>
             <option value="in_progress">In Progress</option>
             <option value="resolved">Resolved</option>
             <option value="closed">Closed</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-12 text-slate-500">No complaints found.</div>
        ) : filtered.map((complaint) => (
          <Card key={complaint.id} className={complaint.priority === 'high' ? "border-l-4 border-l-rose-500" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className={`p-3 rounded-xl ${complaint.status === 'open' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                       <h4 className="font-bold text-slate-900">{complaint.subject}</h4>
                       <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">{complaint.complaint_type}</span>
                       {complaint.priority === 'high' && <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">URGENT</span>}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-1">{complaint.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                       {complaint.citizen?.full_name} • ID: {complaint.complaint_number} • Date: {new Date(complaint.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-t-0">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Current Status</p>
                      <p className={`text-sm font-bold uppercase ${
                        complaint.status === 'open' ? 'text-rose-600' : 
                        complaint.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{complaint.status.replace("_", " ")}</p>
                   </div>
                   <div className="flex gap-2">
                      {complaint.status === 'open' && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => handleUpdateStatus(complaint.id, 'in_progress')}>In Progress</Button>
                      )}
                      {(complaint.status === 'open' || complaint.status === 'in_progress') && (
                        <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(complaint.id, 'resolved')}>Resolve</Button>
                      )}
                      {complaint.status === 'resolved' && (
                        <Button size="sm" variant="outline" className="text-xs text-slate-500 border-slate-200" onClick={() => handleUpdateStatus(complaint.id, 'closed')}>Close</Button>
                      )}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
