"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Users, Search, Filter, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CitizenManagement() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadCitizens();
  }, [page]);

  async function loadCitizens() {
    try {
      setLoading(true);
      const data = await api.get(`/users?role=citizen&page=${page}&limit=${limit}`);
      setCitizens(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load citizens:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = citizens.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.mobile?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Management</h1>
          <p className="text-slate-500">Gaav ke sabhi logo ka record yahan manage karein</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Ward</Button>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-12 text-slate-500">No citizens found.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Village</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((citizen) => (
                    <tr key={citizen.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                             {citizen.full_name ? citizen.full_name.charAt(0) : "C"}
                           </div>
                           <div className="font-semibold text-slate-900">{citizen.full_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {citizen.profile?.village || "Sarahi"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{citizen.mobile || "N/A"}</div>
                        <div className="text-[10px] text-slate-400">{citizen.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          citizen.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {citizen.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!loading && (
            <div className="p-6 border-t border-border flex items-center justify-between text-sm">
              <p className="text-slate-500 text-xs">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
