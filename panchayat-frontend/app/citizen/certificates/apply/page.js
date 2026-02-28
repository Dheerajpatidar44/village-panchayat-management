"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileText, Upload, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ApplyCertificate() {
  const router = useRouter();
  const [type, setType] = useState("Income Certificate");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/certificates", { certificate_type: type });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit application:", err);
      setError("Failed to submit certificate application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-emerald-100 p-6 rounded-full">
          <FileText className="w-16 h-16 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Application Submitted!</h2>
        <p className="text-slate-500 max-w-md">
          Aapka certificate application jama ho gaya hai. Aap progress "Meri Applications" page par dekh sakte hain.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => setSubmitted(false)}>Apply for Another</Button>
          <Button onClick={() => router.push("/citizen/certificates")}>View Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Certificate ke liye Apply Karein</h1>
        <p className="text-slate-500">Apni jankari bharein aur documents upload karein</p>
      </div>

      <Card>
        <CardHeader title="Certificate Application Form" />
        <CardContent>
          {error && (
            <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm font-bold">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Certificate ka Prakaar (Type)</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Income Certificate">Income Certificate (Aay Praman Patra)</option>
                  <option value="Birth Certificate">Birth Certificate (Janam Praman Patra)</option>
                  <option value="Death Certificate">Death Certificate (Mrityu Praman Patra)</option>
                  <option value="Residence Certificate">Residence Certificate (Nivas Praman Patra)</option>
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Aadhar Number</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none" placeholder="0000 0000 0000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Pura Naam (Full Name)</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none" placeholder="Ex: Ramesh Kumar" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Pita ka Naam (Father's Name)</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none" placeholder="Ex: Suresh Kumar" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Mobile Number</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none" type="tel" placeholder="+91" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Date of Birth</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-100 pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Pura Pata (Full Address)</label>
              <textarea
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 min-h-[100px] font-semibold text-sm"
                placeholder="Village, Post Office, District, Block..."
              ></textarea>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 border-b pb-2">Documents Upload</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-primary/50 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">Aadhar Card Upload</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">PNG, JPG or PDF (Max 2MB)</p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-primary/50 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">Ration Card / ID Upload</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">PNG, JPG or PDF (Max 2MB)</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                Panchayat ke niyam ke hisab se, galat jankari dene par aapka application reject ho jayega aur karyawahi ho sakti hai.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-6 text-lg gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
