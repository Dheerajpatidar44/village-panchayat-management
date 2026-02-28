"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings as SettingsIcon, Shield, Bell, Globe, User, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    panchayat_name: "Gram Panchayat",
    district: "",
    contact_email: "",
    two_factor: "false",
    self_registration: "true",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await api.get("/settings");
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true"
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Portal <span className="text-primary">Settings</span></h1>
        <p className="text-slate-500 font-medium mt-1">Configure global village parameters and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <Card>
               <CardHeader title="General Configuration" subtitle="Village name and primary contact details" />
               <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Gram Panchayat Name</label>
                       <input 
                         className="w-full bg-slate-100 border-2 border-transparent pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                         value={settings.panchayat_name || ""} 
                         onChange={(e) => setSettings({...settings, panchayat_name: e.target.value})} 
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">District</label>
                       <input 
                         className="w-full bg-slate-100 border-2 border-transparent pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                         value={settings.district || ""} 
                         onChange={(e) => setSettings({...settings, district: e.target.value})} 
                       />
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Official Email ID</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-100 border-2 border-transparent pl-4 pr-4 py-3 text-sm font-semibold rounded-2xl transition-all focus:bg-white focus:border-primary/20 outline-none"
                      value={settings.contact_email || ""} 
                      onChange={(e) => setSettings({...settings, contact_email: e.target.value})} 
                    />
                  </div>
                  <div className="pt-4">
                     <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary">
                       {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                       Save Changes
                     </Button>
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader title="Security Controls" subtitle="Who can access the portal?" />
               <CardContent className="space-y-6">
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
                    onClick={() => handleToggle('two_factor')}
                  >
                     <div className="flex items-center gap-4">
                        <Shield className="w-6 h-6 text-primary" />
                        <div>
                           <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                           <p className="text-xs text-slate-500">Enable OTP login for all Clerks</p>
                        </div>
                     </div>
                     <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.two_factor === "true" ? "bg-primary" : "bg-slate-300"}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.two_factor === "true" ? "right-1" : "left-1"}`} />
                     </div>
                  </div>
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
                    onClick={() => handleToggle('self_registration')}
                  >
                     <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-blue-600" />
                        <div>
                           <p className="font-bold text-slate-900">Self-Registration</p>
                           <p className="text-xs text-slate-500">Allow citizens to register themselves</p>
                        </div>
                     </div>
                     <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.self_registration === "true" ? "bg-primary" : "bg-slate-300"}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.self_registration === "true" ? "right-1" : "left-1"}`} />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="space-y-8">
            <Card className="bg-slate-900 text-white border-none">
               <CardHeader className="border-white/10">
                  <h3 className="text-xl font-bold">System Info</h3>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Version</span>
                     <span className="font-bold">2.4.0 (Latest)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Last Backup</span>
                     <span className="font-bold">Today, 02:00 AM</span>
                  </div>
                  <div className="pt-6">
                     <Button variant="ghost" className="w-full border-white/10 text-white hover:bg-white/10">Check for Updates</Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
