"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search, MoreHorizontal, Edit, Trash, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SchemeManagement() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ totalBeneficiaries: 0, fundsDistributed: 0, pendingQueries: 0 });

  useEffect(() => {
    loadSchemes();
  }, []);

  async function loadSchemes() {
    try {
      setLoading(true);
      const data = await api.get("/schemes");
      setSchemes(data);
      
      // Calculate Stats
      let bens = 0;
      let funds = 0;
      data.forEach(s => {
        bens += s.approved_applications || 0;
        funds += s.utilized_funds || 0;
      });
      setStats({
        totalBeneficiaries: bens,
        fundsDistributed: funds,
        pendingQueries: data.reduce((acc, s) => acc + (s.total_applications - s.approved_applications), 0)
      });
    } catch (err) {
      console.error("Failed to load schemes:", err);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount}`;
  };

  const filteredSchemes = schemes.filter(s => 
    s.scheme_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scheme Management</h1>
          <p className="text-slate-500">Add or manage government schemes for villagers</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Nayi Yojna Jodein</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-primary mb-1">Total Beneficiaries</p>
               <h3 className="text-3xl font-bold text-primary">
                 {loading ? "..." : stats.totalBeneficiaries.toLocaleString("en-IN")}
               </h3>
               <div className="flex items-center gap-1 text-xs text-primary/60 mt-4">
                  <Users className="w-3.5 h-3.5" /> Across all active schemes
               </div>
            </CardContent>
         </Card>
         <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-emerald-700 mb-1">Fund Distributed</p>
               <h3 className="text-3xl font-bold text-emerald-700">
                 {loading ? "..." : formatCurrency(stats.fundsDistributed)}
               </h3>
               <div className="flex items-center gap-1 text-xs text-emerald-600 mt-4">
                  <Plus className="w-3.5 h-3.5" /> Total utilized funds
               </div>
            </CardContent>
         </Card>
         <Card className="bg-rose-50 border-rose-100">
            <CardContent className="p-6">
               <p className="text-sm font-medium text-rose-700 mb-1">Pending Queries</p>
               <h3 className="text-3xl font-bold text-rose-700">
                 {loading ? "..." : stats.pendingQueries}
               </h3>
               <div className="flex items-center gap-1 text-xs text-rose-600 mt-4">
                  Pending applications
               </div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10" 
              placeholder="Search schemes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Loading schemes data...</p>
              </div>
            ) : filteredSchemes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No schemes found matching your search.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Scheme Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Applications</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Approved</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{scheme.scheme_name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{scheme.total_applications}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-1000" 
                                style={{ width: scheme.total_applications ? `${(scheme.approved_applications / scheme.total_applications) * 100}%` : '0%' }}
                              ></div>
                           </div>
                           <span className="text-[10px] font-bold text-slate-500">{scheme.approved_applications}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          scheme.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {scheme.is_active ? "Active" : "Paused"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                         </button>
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
