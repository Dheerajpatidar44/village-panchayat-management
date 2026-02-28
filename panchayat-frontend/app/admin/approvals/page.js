"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ApprovalsPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    try {
      // Pending certificates needing final approval
      const data = await api.get("/search?q=");
      if (data && data.certificates) {
        setCertificates(data.certificates.filter(c => c.status === "pending" || c.status === "verified"));
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (id, action) => {
    try {
      await api.put(`/certificates/${id}`, { status: action });
      setCertificates(prev => prev.filter(c => c.id !== id));
      alert(`Certificate successfully ${action}!`);
    } catch (err) {
      console.error("Failed action:", err);
      alert("Error processing action.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Final Approvals</h1>
          <p className="text-slate-500">Approve certificates and documents verified by clerks</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                <span className="font-bold text-lg text-slate-700 block">All Caught Up!</span>
                No pending approvals require your attention.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Application ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Citizen</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Document Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{cert.application_number}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{cert.citizen?.full_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{cert.citizen?.mobile}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{cert.certificate_type}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 text-amber-700">
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button size="sm" onClick={() => handleAction(cert.id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 !h-8 px-3">
                             Approve
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleAction(cert.id, 'rejected')} className="text-rose-500 hover:bg-rose-50 border-rose-100 !h-8 px-3">
                             Reject
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
