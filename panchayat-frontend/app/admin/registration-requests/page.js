"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  UserCheck, UserX, Clock, CheckCircle2, XCircle,
  User, Mail, Phone, MapPin, CreditCard, Calendar,
  Search, Filter, Loader2, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";

export default function RegistrationRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.get("/registrations");
      setRequests(data);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      setActionLoading(id + "_approve");
      await api.put(`/registrations/${id}`, { status: "approved" });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved", reviewed_at: new Date().toISOString() } : r));
    } catch (err) { alert("Failed: " + err.message); }
    finally { setActionLoading(null); }
  }

  async function handleReject(id) {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return; // cancelled
    try {
      setActionLoading(id + "_reject");
      await api.put(`/registrations/${id}`, { status: "rejected", rejection_reason: reason });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", reviewed_at: new Date().toISOString() } : r));
    } catch (err) { alert("Failed: " + err.message); }
    finally { setActionLoading(null); }
  }

  const filtered = requests.filter(req => {
    const matchesFilter = filter === "all" || req.status === filter;
    const matchesSearch = !searchTerm ||
      req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.aadhaar_number?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Registration Requests</h1>
          <p className="text-slate-600 font-medium">Nayi citizen registration requests ko verify aur approve karein</p>
        </div>
        <Button variant="outline" onClick={loadRequests} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", value: stats.total, icon: User, color: "from-blue-500 to-blue-600" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "from-amber-500 to-amber-600" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-rose-500 to-rose-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`p-6 bg-gradient-to-br ${color} text-white border-0`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-black">{loading ? "..." : value}</span>
            </div>
            <p className="text-sm font-bold opacity-80">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or Aadhaar..."
              className="w-full bg-slate-50 border-2 border-transparent pl-12 pr-4 py-3 text-sm font-semibold rounded-xl transition-all focus:bg-white focus:border-primary/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All", icon: Filter },
              { value: "pending", label: "Pending", icon: Clock },
              { value: "approved", label: "Approved", icon: CheckCircle2 },
              { value: "rejected", label: "Rejected", icon: XCircle },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  filter === value ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Loading requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No Requests Found</h3>
          <p className="text-slate-500 font-medium">
            {filter === "all" ? "Koi registration request nahi hai" : `Koi ${filter} request nahi hai`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((request) => (
            <Card key={request.id} className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1">{request.full_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                          request.status === "pending" ? "bg-amber-100 text-amber-700"
                          : request.status === "approved" ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                        }`}>
                          {request.status === "pending" && <Clock className="w-3 h-3" />}
                          {request.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {request.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {request.status}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Submitted: {new Date(request.submitted_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: Mail, color: "blue", label: "Email", value: request.email },
                      { icon: Phone, color: "emerald", label: "Mobile", value: request.mobile },
                      { icon: CreditCard, color: "purple", label: "Aadhaar", value: request.aadhaar_number },
                      { icon: Calendar, color: "rose", label: "Date of Birth", value: request.date_of_birth ? new Date(request.date_of_birth).toLocaleDateString("en-IN") : "-" },
                    ].map(({ icon: Icon, color, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${color}-600`} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400 uppercase">{label}</p>
                          <p className="text-sm font-bold text-slate-900">{value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase">Address</p>
                        <p className="text-sm font-bold text-slate-900">
                          {request.address}, {request.village} - {request.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === "pending" && (
                  <div className="flex lg:flex-col gap-3 lg:w-48">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 gap-2"
                      disabled={actionLoading === request.id + "_approve"}
                    >
                      {actionLoading === request.id + "_approve"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserCheck className="w-5 h-5" />}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="outline"
                      className="flex-1 lg:flex-none border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl py-6 gap-2"
                      disabled={actionLoading === request.id + "_reject"}
                    >
                      {actionLoading === request.id + "_reject"
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <UserX className="w-5 h-5" />}
                      Reject
                    </Button>
                  </div>
                )}
                {request.status !== "pending" && (
                  <div className="lg:w-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${request.status === "approved" ? "bg-emerald-100" : "bg-rose-100"}`}>
                        {request.status === "approved"
                          ? <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                          : <XCircle className="w-8 h-8 text-rose-600" />}
                      </div>
                      {request.reviewed_at && (
                        <p className="text-xs font-bold text-slate-400">
                          {new Date(request.reviewed_at).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
