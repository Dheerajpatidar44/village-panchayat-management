"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare, Clock, CheckCircle, AlertCircle, Search, Shield,
  ChevronDown, Loader2, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";

const STATUS_STYLES = {
  open: "text-rose-600 bg-rose-50",
  in_progress: "text-amber-600 bg-amber-50",
  resolved: "text-emerald-600 bg-emerald-50",
  closed: "text-slate-400 bg-slate-50",
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadComplaints(); }, []);

  async function loadComplaints() {
    try {
      setLoading(true);
      const data = await api.get("/complaints");
      setComplaints(data);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id, newStatus) {
    try {
      setUpdating(id);
      await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = complaints.filter(c => {
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch = !searchTerm ||
      c.citizen?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_number?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === "open").length,
    in_progress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <Shield className="w-3 h-3" /> Monitoring Grievances
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Complaint <span className="text-primary">Center</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 italic">Monitor the resolution speed and citizen satisfaction.</p>
        </div>
        <Button variant="outline" onClick={loadComplaints} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stat Pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: "all", label: "All", count: counts.all },
          { key: "open", label: "Open", count: counts.open },
          { key: "in_progress", label: "In Progress", count: counts.in_progress },
          { key: "resolved", label: "Resolved", count: counts.resolved },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              filterStatus === key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${filterStatus === key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"}`}>
              {count}
            </span>
          </button>
        ))}

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Loading complaints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-semibold">No complaints found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((complaint) => (
            <Card
              key={complaint.id}
              className={`${complaint.priority === "high" ? "border-l-4 border-l-rose-500" : ""}`}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      complaint.status === "open" ? "bg-rose-50 text-rose-600" :
                      complaint.status === "in_progress" ? "bg-amber-50 text-amber-600" :
                      "bg-slate-50 text-slate-400"
                    }`}>
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-slate-900">{complaint.citizen?.full_name || "Unknown"}</h4>
                        <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-black uppercase tracking-widest">
                          {complaint.complaint_type}
                        </span>
                        {complaint.priority === "high" && (
                          <span className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-xl font-black uppercase tracking-tighter">URGENT</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-700">{complaint.subject}</p>
                      <p className="text-sm text-slate-400 font-bold">
                        Ref: {complaint.complaint_number} • {new Date(complaint.submitted_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</p>
                      <p className={`text-base font-black capitalize ${STATUS_STYLES[complaint.status]?.split(" ")[0]}`}>
                        {complaint.status?.replace(/_/g, " ")}
                      </p>
                    </div>

                    {/* Status Update Dropdown */}
                    <div className="relative group">
                      <Button variant="outline" size="sm" className="gap-1" disabled={updating === complaint.id}>
                        {updating === complaint.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Update <ChevronDown className="w-3 h-3" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 hidden group-hover:block min-w-[150px]">
                        {["open", "in_progress", "resolved", "closed"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(complaint.id, s)}
                            className={`w-full text-left px-4 py-2.5 text-sm font-bold capitalize hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              complaint.status === s ? "text-primary" : "text-slate-700"
                            }`}
                          >
                            {s.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {complaint.description && (
                  <p className="mt-3 text-sm text-slate-500 pl-[76px] line-clamp-2">{complaint.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
