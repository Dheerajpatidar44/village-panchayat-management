"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Bell, Calendar, Trash, Edit2, Globe, Loader2, RefreshCw, X, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

const PRIORITY_COLORS = {
  low: "text-slate-500 bg-slate-100",
  normal: "text-blue-600 bg-blue-100",
  high: "text-amber-600 bg-amber-100",
  urgent: "text-rose-600 bg-rose-100",
};

export default function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", notice_type: "general", priority: "normal", is_published: false, expiry_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadNotices(); }, []);

  async function loadNotices() {
    try {
      setLoading(true);
      const data = await api.get("/notices");
      setNotices(data);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const created = await api.post("/notices", form);
      setNotices(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ title: "", content: "", notice_type: "general", priority: "normal", is_published: false, expiry_date: "" });
    } catch (err) { alert("Failed: " + err.message); }
    finally { setSubmitting(false); }
  }

  async function handleTogglePublish(notice) {
    try {
      const updated = await api.put(`/notices/${notice.id}`, { is_published: !notice.is_published });
      setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, is_published: !n.is_published } : n));
    } catch (err) { alert("Failed: " + err.message); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this notice?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n.id !== id));
    } catch (err) { alert("Failed: " + err.message); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Management</h1>
          <p className="text-slate-500">Create and broadcast village-wide announcements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadNotices} className="gap-2"><RefreshCw className="w-4 h-4" /></Button>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" /> Nayi Notice Banayein</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notices.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No notices yet. Create one!</p>
            </Card>
          ) : notices.map((notice) => (
            <Card key={notice.id}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${notice.is_published ? "bg-emerald-50" : "bg-slate-100"}`}>
                    <Bell className={`w-6 h-6 ${notice.is_published ? "text-emerald-500" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{notice.title}</h3>
                      {notice.is_global && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">GLOBAL</span>}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${PRIORITY_COLORS[notice.priority] || "text-slate-500 bg-slate-100"}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(notice.created_at).toLocaleDateString("en-IN")}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${notice.is_published ? "text-emerald-600" : "text-slate-400"}`}>
                        {notice.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Type</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Globe className="w-3 h-3 text-primary" />
                      <span className="text-sm font-bold text-slate-900 capitalize">{notice.notice_type}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublish(notice)}
                      className={`p-2 rounded-lg border transition-all text-sm font-bold ${notice.is_published ? "border-rose-100 text-rose-500 hover:bg-rose-50" : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"}`}
                      title={notice.is_published ? "Unpublish" : "Publish"}
                    >
                      {notice.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      disabled={deletingId === notice.id}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg border border-transparent hover:border-rose-100"
                    >
                      {deletingId === notice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Create Notice</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Title *</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50" placeholder="Notice title..." />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Content *</label>
                <textarea required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 resize-none" placeholder="Notice content..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Type</label>
                  <select value={form.notice_type} onChange={e => setForm({ ...form, notice_type: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 bg-white">
                    {["general", "meeting", "financial", "infrastructure", "health", "scheme", "global"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50 bg-white">
                    {["low", "normal", "high", "urgent"].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-primary/50" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-bold text-slate-700">Publish immediately</span>
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-slate-900" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Notice"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
