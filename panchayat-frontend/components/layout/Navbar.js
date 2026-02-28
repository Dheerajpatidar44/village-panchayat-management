"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, Menu, LogOut, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function Navbar({ role }) {
  const [user, setUser] = useState({ name: "User", village: "Panchayat Portal" });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load user data from local storage
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName") || "User";
      setUser({ name, village: "Sarahi Village" });
      loadNotifications();
    }
  }, []);

  async function loadNotifications() {
    try {
      const data = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  async function handleMarkRead(id, e) {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!val.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await api.get(`/search?q=${encodeURIComponent(val)}`);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce time
  };

  const getNotificationIconColor = (type) => {
    switch(type) {
      case 'alert': return 'text-rose-500 bg-rose-50';
      case 'success': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };

  return (
    <header className="h-20 border-b border-slate-200/50 glass sticky top-0 z-40 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center gap-6 flex-1 relative">
        <button className="lg:hidden p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        
        <div className="relative max-w-lg w-full hidden md:block group z-50">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
             <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search records, schemes, citizens..."
            className="w-full bg-slate-100 border-2 border-transparent rounded-[1.25rem] pl-11 pr-4 py-3 text-sm font-medium focus:bg-white focus:border-primary/20 outline-none transition-all"
          />
          
          {/* Search Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[400px] overflow-y-auto">
              <div className="p-4">
                {isSearching ? (
                  <div className="text-center py-4 text-slate-400 text-sm font-medium">Searching...</div>
                ) : !searchResults ? null : Object.keys(searchResults).every(k => searchResults[k].length === 0) ? (
                  <div className="text-center py-4 text-slate-400 text-sm font-medium">No results found</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(searchResults).map(([category, items]) => {
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={category}>
                          <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 px-2 tracking-widest">{category}</h4>
                          <div className="space-y-1">
                            {items.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex flex-col p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                                <span className="font-bold text-slate-900 text-sm">
                                  {item.title || item.name || item.full_name || item.scheme_name || item.subject}
                                </span>
                                <span className="text-xs text-slate-500 line-clamp-1">
                                  {item.subtitle || item.email || item.description || `ID: ${item.id.slice(0,8)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-xs uppercase tracking-tighter shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {role} Access
        </div>
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all group"
          >
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-4 h-4 bg-primary text-[8px] font-black text-white flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[450px]">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium">No new notifications</div>
                  ) : notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 rounded-2xl flex gap-3 cursor-pointer transition-colors ${!n.is_read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50'}`}
                      onClick={() => !n.is_read && handleMarkRead(n.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getNotificationIconColor(n.type)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{n.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pl-5 border-l border-slate-200">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.village}</p>
          </div>
          <Link href={`/${role}/profile`} className="relative group cursor-pointer block">
             <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 p-1 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden">
                   <User className="w-6 h-6 text-primary" />
                </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
          </Link>
          <button 
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm group border border-rose-100"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
