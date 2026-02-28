"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Image, Send, HelpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewComplaint() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    complaint_type: "other",
    subject: "",
    description: "",
    priority: "normal"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/complaints", formData);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit complaint:", err);
      alert("Error submitting complaint");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-rose-100 p-6 rounded-full text-rose-600">
          <MessageSquare className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Shikayat Jama ho Gayi!</h2>
        <p className="text-slate-500 max-w-md">
          Aapki samasya note kar li gayi hai. Hum jald se jald iska samadhan karenge.
        </p>
        <div className="pt-4 flex gap-4">
          <Button variant="outline" onClick={() => router.push("/citizen/dashboard")}>Back to Dashboard</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => router.push("/citizen/complaints/status")}>Track Complaint</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Shikayat (Complaint) Karein</h1>
        <p className="text-slate-500">Gaav ki kisi bhi samasya ko hum tak pahuchayein</p>
      </div>

      <Card>
        <CardHeader title="Complaint Details" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Samasya ka Prakaar (Category)</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.complaint_type}
                  onChange={(e) => setFormData({...formData, complaint_type: e.target.value})}
                >
                  <option value="water">Water (Paani)</option>
                  <option value="road">Road (Sadak)</option>
                  <option value="electricity">Electricity (Bijli)</option>
                  <option value="sanitation">Sanitation (Safai)</option>
                  <option value="other">Other (Anye)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Priority</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="high">Urgent (Zaroori)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Short Summary (Vishay)</label>
               <input 
                 className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                 placeholder="Ex: Gali ki light kharab hai" 
                 value={formData.subject}
                 onChange={(e) => setFormData({...formData, subject: e.target.value})}
                 required
               />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Pura Vivran (Detailed Description)</label>
              <textarea
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 min-h-[150px] font-semibold text-sm"
                placeholder="Samasya ke baare me vistar se batayein..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              ></textarea>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-primary py-6">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Complaint <Send className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Kya aapko pata hai?</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Halki samasyaon ka samadhan 48 ghante ke andar kiya jata hai. Gambhir samasyaon me 7-10 din lag sakte hain.
          </p>
        </div>
      </div>
    </div>
  );
}
