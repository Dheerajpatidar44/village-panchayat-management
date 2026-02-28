"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, IndianRupee, Tractor, GraduationCap, Home, HeartPulse, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchemes();
  }, []);

  async function loadSchemes() {
    try {
      setLoading(true);
      const data = await api.get("/schemes");
      // Only show active schemes to citizens
      setSchemes(data.filter(s => s.is_active));
    } catch (err) {
      console.error("Failed to load schemes:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper to map category to icon and color
  const getCategoryTheme = (category) => {
    const map = {
      'agriculture': { icon: Tractor, color: "bg-emerald-100 text-emerald-600" },
      'education': { icon: GraduationCap, color: "bg-purple-100 text-purple-600" },
      'housing': { icon: Home, color: "bg-blue-100 text-blue-600" },
      'health': { icon: HeartPulse, color: "bg-rose-100 text-rose-600" },
      'employment': { icon: IndianRupee, color: "bg-amber-100 text-amber-600" },
    };
    return map[category?.toLowerCase()] || { icon: IndianRupee, color: "bg-slate-100 text-slate-600" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-slate-500">Sarkari yojnaon ka labh uthayein</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : schemes.length === 0 ? (
        <div className="text-center p-20 text-slate-500">No active schemes available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => {
            const theme = getCategoryTheme(scheme.department || "general");
            return (
              <Card key={scheme.id} className="group hover:border-primary/50 transition-all overflow-hidden h-full">
                <CardContent className="p-0 h-full">
                   <div className="flex h-full">
                      <div className={`w-28 flex flex-col items-center justify-center gap-2 ${theme.color} border-r border-border/10`}>
                         <theme.icon className="w-10 h-10" />
                         <span className="text-[10px] font-bold uppercase text-center px-1">{scheme.department || "General"}</span>
                      </div>
                      <div className="flex-1 p-6 space-y-4 flex flex-col justify-between">
                         <div>
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{scheme.scheme_name}</h3>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{scheme.description}</p>
                         </div>
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50">
                            <div>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                               <p className="text-sm font-bold text-emerald-600 tracking-tight">Accepting Applications</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 self-start sm:self-auto" onClick={() => alert("Scheme application feature coming soon!")}>
                               Apply Now <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                         </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-slate-900 text-white border-none mt-8">
         <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
               <h3 className="text-2xl font-bold">Help Chahiye?</h3>
               <p className="text-slate-400">Agar aapko eligibility check karne me dikkat aa rahi hai toh Clerk se milein.</p>
            </div>
            <div className="flex gap-4">
               <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800">Check Eligibility</Button>
               <Button className="bg-primary text-white hover:bg-primary/90">Contact Helpdesk</Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
