"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FileText, Clock, CheckCircle2, Search, Filter, Download, Box, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import Link from "next/link";

export default function MyCertificates() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await api.get("/search?q=");
      if (data && data.certificates) {
        setApplications(data.certificates);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusConfig = (status) => {
    const config = {
      'pending': { color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
      'verified': { color: "text-blue-600", bg: "bg-blue-50", icon: Search },
      'approved': { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
      'rejected': { color: "text-rose-600", bg: "bg-rose-50", icon: Box },
    };
    return config[status] || config['pending'];
  };

  const getStepProgress = (status) => {
    if (status === 'approved') return 3;
    if (status === 'verified') return 2;
    if (status === 'rejected') return -1;
    return 1; // pending
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mere Certificates</h1>
          <p className="text-slate-500">Aapke sabhi application ka status yahan dekhein</p>
        </div>
        <div className="flex gap-2">
          <Link href="/citizen/certificates/apply">
             <Button className="bg-primary text-white hover:bg-primary-dark">New Application</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Abhi tak koi application nahi hai</h3>
            <p className="text-slate-500 mb-6">Naye certificate ke liye aaj hi apply karein</p>
            <Link href="/citizen/certificates/apply">
              <Button>Apply Now</Button>
            </Link>
          </div>
        ) : applications.map((app) => {
          const config = getStatusConfig(app.status);
          const Icon = config.icon;
          const step = getStepProgress(app.status);

          return (
            <Card key={app.id}>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`p-4 rounded-xl ${config.bg} ${config.color}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{app.certificate_type}</h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Ref: {app.application_number}</p>
                    </div>
                  </div>

                  <div className="flex-1 md:text-center w-full md:w-auto border-y md:border-y-0 border-slate-100 py-4 md:py-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Submitted On</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(app.submitted_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className={`text-sm font-bold uppercase ${config.color}`}>{app.status}</span>
                    </div>
                    {app.status === "approved" ? (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => alert("Details coming soon!")}>Details</Button>
                    )}
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between max-w-2xl mx-auto">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Submitted</span>
                   </div>
                   <div className={`flex-1 h-1 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-100'} mx-2 rounded-full transition-colors`}></div>
                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full transition-colors`}></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clerk Verify</span>
                   </div>
                   <div className={`flex-1 h-1 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-100'} mx-2 rounded-full transition-colors`}></div>
                   <div className="flex flex-col items-center gap-2">
                      <div className={`w-4 h-4 ${step >= 3 ? 'bg-emerald-500' : (step === -1 ? 'bg-rose-500' : 'bg-slate-200')} rounded-full transition-colors`}></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{step === -1 ? 'Rejected' : 'Approved'}</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
