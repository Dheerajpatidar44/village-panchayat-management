"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle, XCircle, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CertificateVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.get("/search?q=");
      if (data && data.certificates) {
        setRequests(data.certificates.filter(c => c.status === "pending"));
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/certificates/${id}`, { status });
      setRequests(prev => prev.filter(r => r.id !== id));
      alert(`Certificate ${status} successfully.`);
    } catch (err) {
      console.error("Failed to verify:", err);
      alert("Error updating certificate.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificate Verification</h1>
          <p className="text-slate-500">Naye applications ki janch karein aur aage bhejein</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
            <span className="font-bold text-lg text-slate-700 block">No pending Verifications</span>
            You have verified all certificates.
          </div>
        ) : requests.map((request) => (
          <Card key={request.id}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{request.citizen?.full_name}</h4>
                        <p className="text-xs text-slate-500">Applied for {request.certificate_type}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      request.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Application No</span>
                      <span className="font-semibold text-slate-700">{request.application_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">Date Submitted</span>
                      <span className="font-semibold text-slate-700">{new Date(request.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 w-full md:w-64 flex flex-col justify-center space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs border-primary/20 text-primary">
                    <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Documents
                  </Button>
                  <Button size="sm" onClick={() => handleVerify(request.id, 'verified')} className="w-full justify-start text-xs bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 mr-2" /> Verify & Push
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleVerify(request.id, 'rejected')} className="w-full justify-start text-xs text-rose-600 border-rose-100 hover:bg-rose-50">
                    <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
