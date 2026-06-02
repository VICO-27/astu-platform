
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { searchIndex } from "../mockData";
import { 
  Search, ChevronDown, User, Sun, Moon, ExternalLink, 
  BookOpen, Briefcase, Award, Calendar, Sparkles, GraduationCap,
  LogIn, LogOut
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar({ onStartTour, onNavigate, currentUser, onLoginClick, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showJumpOn, setShowJumpOn] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const searchRef = useRef(null);
  const jumpOnRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchFocused(false);
      if (jumpOnRef.current && !jumpOnRef.current.contains(event.target)) setShowJumpOn(false);
      if (accountRef.current && !accountRef.current.contains(event.target)) setShowAccount(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const query = searchQuery.toLowerCase();
    const filtered = searchIndex.filter(
      item => item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query)
    ).slice(0, 5);
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleSearchItemClick = (item) => {
    setSearchQuery("");
    setSearchFocused(false);
    if (item.type === "Department") onNavigate("courses");
    else if (item.type === "Course") onNavigate("courses");
    else if (item.type === "Material") onNavigate("materials");
  };

  const userInitials = currentUser?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() 
    || currentUser?.email?.[0]?.toUpperCase() || null;

  return (
    <nav className="h-14 fixed top-0 left-0 right-0 z-50 border-b bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 select-none transition-colors duration-300" style={{ backdropFilter: 'none' }}>

      {/* Brand */}
      <div id="tour-logo" className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate("home")}>
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
          <img src="/astu-logo.png" alt="ASTU" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.parentElement.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'; }} />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-heading">ASTU</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium -mt-1 uppercase tracking-wider">Platform</span>
        </div>
      </div>

      {/* Nav + Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl mx-8">
        <button onClick={() => onNavigate("courses")}
          className="relative text-sm font-semibold text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors py-1 group cursor-pointer">
          Courses
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
        </button>

        <div id="tour-search" className="relative flex-1" ref={searchRef}>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-slate-50 dark:bg-slate-900 transition-all duration-300 ${
            searchFocused
              ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/10"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}>
            <Search className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search courses, departments, materials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <AnimatePresence>
            {searchFocused && (searchQuery.trim() || searchResults.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-11 left-0 right-0 rounded-2xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 py-2"
              >
                {searchResults.length > 0 ? searchResults.map((item, index) => (
                  <div key={index} onClick={() => handleSearchItemClick(item)}
                    className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between transition-colors">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.code}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                      {item.type}
                    </span>
                  </div>
                )) : (
                  <div className="px-4 py-3 text-xs text-center text-slate-400 dark:text-slate-500">
                    No results for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Jump On */}
        <div id="tour-jumpon" className="relative" ref={jumpOnRef}>
          <button
            onClick={() => setShowJumpOn(!showJumpOn)}
            onMouseEnter={() => setShowJumpOn(true)}
            className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer"
          >
            Jump On
            <ChevronDown size={14} className={`transition-transform duration-200 ${showJumpOn ? "rotate-180 text-emerald-500" : ""}`} />
          </button>
          <AnimatePresence>
            {showJumpOn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                onMouseLeave={() => setShowJumpOn(false)}
                className="absolute top-8 left-0 w-44 rounded-2xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 py-1.5"
              >
                {[
                  { label: "Projects", icon: Briefcase, page: "projects" },
                  { label: "Materials", icon: BookOpen, page: "materials" },
                ].map(({ label, icon: Icon, page }) => (
                  <div key={page} onClick={() => { onNavigate(page); setShowJumpOn(false); }}
                    className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <Icon size={14} className="text-slate-400" />
                    {label}
                  </div>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-900 mx-2 my-1" />
                {[
                  { label: "Exam Workspace", icon: Award },
                  { label: "Study Planner", icon: Calendar },
                ].map(({ label, icon: Icon }) => (
                  <div key={label}
                    className="px-4 py-2 flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-600 cursor-not-allowed">
                    <Icon size={14} />
                    {label} <span className="text-[8px] ml-auto">Phase 2</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button onClick={onStartTour}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer">
          <Sparkles size={13} className="animate-pulse" />
          <span>Tour</span>
        </button>

        {/* Theme Toggle */}
        <button onClick={toggleTheme}
          className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* Account */}
        <div className="relative" ref={accountRef}>
          <button onClick={() => setShowAccount(!showAccount)}
            className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden ${
              currentUser ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}>
              {userInitials || <User size={13} />}
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {currentUser ? (currentUser.name?.split(" ")[0] || "Account") : "Account"}
            </span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${showAccount ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showAccount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-9 right-0 w-48 rounded-2xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 py-1.5"
              >
                {currentUser ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{currentUser.name || "Student"}</p>
                      <p className="text-[10px] text-slate-400">{currentUser.email}</p>
                    </div>
                    <div onClick={() => { onNavigate("profile"); setShowAccount(false); }}
                      className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                      <User size={14} className="text-slate-400" />
                      My Profile
                    </div>
                    <a href="https://estudent.astu.edu.et" target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowAccount(false)}
                      className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <span className="flex items-center gap-2.5"><GraduationCap size={14} className="text-slate-400" />Student Portal</span>
                      <ExternalLink size={12} className="text-slate-400" />
                    </a>
                    <div className="border-t border-slate-100 dark:border-slate-900 mx-2 my-1" />
                    <div onClick={() => { onLogout(); setShowAccount(false); }}
                      className="px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer flex items-center gap-2.5 text-xs text-rose-500 transition-colors">
                      <LogOut size={14} />
                      Sign Out
                    </div>
                  </>
                ) : (
                  <>
                    <div onClick={() => { onLoginClick(); setShowAccount(false); }}
                      className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                      <LogIn size={14} className="text-emerald-500" />
                      Sign In / Register
                    </div>
                    <div onClick={() => { onNavigate("profile"); setShowAccount(false); }}
                      className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                      <User size={14} className="text-slate-400" />
                      Profile Settings
                    </div>
                    <a href="https://estudent.astu.edu.et" target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowAccount(false)}
                      className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <span className="flex items-center gap-2.5"><GraduationCap size={14} className="text-slate-400" />Student Portal</span>
                      <ExternalLink size={12} className="text-slate-400" />
                    </a>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
