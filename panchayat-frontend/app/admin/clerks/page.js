"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, MoreVertical, Loader2, RefreshCw, X, CheckCircle, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function ClerkManagement() {
  const [clerks, setClerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", mobile: "", department: "General", designation: "Clerk" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { loadClerks(); }, []);

  async function loadClerks() {
    try {
      setLoading(true);
      const data = await api.get("/users/clerks");
      setClerks(data);
    } catch (err) {
      console.error("Failed to load clerks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const created = await api.post("/users/clerks", form);
      setClerks(prev => [created, ...prev]);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setForm({ full_name: "", email: "", password: "", mobile: "", department: "General", designation: "Clerk" });
      }, 1500);
    } catch (err) { alert("Failed: " + err.message); }
    finally { setSubmitting(false); }
  }

  async function handleDeactivate(id) {
    if (!confirm("Deactivate this clerk?")) return;
    try {
      await api.put(`/users/${id}/deactivate`);
      setClerks(prev => prev.map(c => c.id === id ? { ...c, is_active: false } : c));
    } catch (err) { alert("Failed: " + err.message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clerk Management</h1>
          <p className="text-slate-500">Manage Panchayat staff and their accounts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadClerks}><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowModal(true)}><UserPlus className="w-4 h-4 mr-2" /> Naya Clerk Add Karein</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clerks.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-slate-400">No clerks found. Add one!</div>
          ) : clerks.map((clerk) => (
            <Card key={clerk.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${clerk.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-lg text-slate-500">
                    {clerk.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="relative group">
                    <button className="text-slate-400 hover:text-slate-600 p-1"><MoreVertical className="w-4 h-4" /></button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 hidden group-hover:block min-w-[140px]">
                      {clerk.is_active && (
                        <button onClick={() => handleDeactivate(clerk.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{clerk.full_name}</h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {clerk.clerk_profile?.designation || "Clerk"} • {clerk.clerk_profile?.department || "General"}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" /> {clerk.email}
                  </div>
                  {clerk.mobile && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="w-4 h-4" /> {clerk.mobile}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Employee ID</span>
                  <span className="text-sm font-bold text-slate-700">{clerk.clerk_profile?.employee_id || "N/A"}</span>
                </div>
                <div className="mt-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${clerk.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                    {clerk.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Clerk Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Add New Clerk</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-xl font-black text-slate-900">Clerk Created!</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {[
                  { key: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Vijay Sharma" },
                  { key: "email", label: "Email", type: "email", required: true, placeholder: "vijay@gram.in" },
                  { key: "password", label: "Password", type: "password", required: true, placeholder: "Min 6 characters" },
                  { key: "mobile", label: "Mobile", type: "tel", placeholder: "9000000000" },
                  { key: "department", label: "Department", type: "text", placeholder: "Revenue" },
                  { key: "designation", label: "Designation", type: "text", placeholder: "Senior Clerk" },
                ].map(({ key, label, type, required, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}{required && " *"}</label>
                    <input type={type} required={required} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 transition-colors" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-slate-900" disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Clerk"}
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
