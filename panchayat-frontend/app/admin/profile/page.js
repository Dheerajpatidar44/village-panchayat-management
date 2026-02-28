"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Phone, Edit, Key, Shield, LogOut, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("userName", data.full_name);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  if (!user) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500">Manage your administrative credentials and personal details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="md:col-span-1 border-primary/10">
            <CardContent className="p-6 text-center space-y-4">
               <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-emerald-700/20 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-xl">
                  <User className="w-12 h-12 text-primary" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900">{user.full_name}</h3>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">System {user.role}</p>
               </div>
               <div className="pt-4 border-t border-slate-100 flex justify-center gap-2">
                  <Button variant="outline" className="w-full text-xs gap-2"><Edit className="w-3 h-3" /> Edit Photo</Button>
               </div>
            </CardContent>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader title="Personal Information" />
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="w-full bg-slate-50 border-2 border-slate-100 pl-11 pr-4 py-3 text-sm font-bold rounded-xl text-slate-700 outline-none" value={user.full_name} readOnly />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input className="w-full bg-slate-50 border-2 border-slate-100 pl-11 pr-4 py-3 text-sm font-bold rounded-xl text-slate-700 outline-none" value={user.email} readOnly />
                    </div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 pl-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="w-full bg-slate-50 border-2 border-slate-100 pl-11 pr-4 py-3 text-sm font-bold rounded-xl text-slate-700 outline-none" value={user.mobile || "Not provided"} readOnly />
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="w-full gap-2"><Key className="w-4 h-4" /> Change Password</Button>
                  <Button variant="outline" className="w-full gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100" onClick={() => { localStorage.clear(); router.push('/login'); }}><LogOut className="w-4 h-4" /> Logout Safely</Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
