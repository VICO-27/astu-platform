
import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import LeftPanel from "./components/LeftPanel";
import CenterPanel from "./components/CenterPanel";
import RightPanel from "./components/RightPanel";
import BottomBar from "./components/BottomBar";
import GuiderAssistant from "./components/GuiderAssistant";
import { mockCourses, mockMaterials, getMockAIResponse } from "./mockData";
import {
  auth as apiAuth, courses as apiCourses, materials as apiMaterials,
  projects as apiProjects, ai as apiAI, getStoredUser, setAuth, clearAuth,
  API_BASE_URL
} from "./api";
import {
  ArrowLeft, Cpu, GraduationCap, BookOpen, Briefcase, User as UserIcon,
  Sparkles, Send, Download, Eye, ExternalLink, Calendar, Search, ArrowRight,
  Play, Plus, X, ChevronDown, ChevronUp, LogIn, LogOut, RefreshCw, 
  FileText, Link, Trash2, Users, GitBranch, Activity, MessageSquare,
  Upload, CheckSquare, Clock, AlertCircle, MoreVertical, Tag, Edit3,
  Filter, SortAsc, ZapIcon, BookMarked, Layers
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ===== AUTH MODAL ===== */
function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // login | register | complete | success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // For profile completion
  const [studentId, setStudentId] = useState("");
  const [dept, setDept] = useState("Computer Science & Engineering");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(1);
  const [bio, setBio] = useState("");

  const deptOptions = [
    "Computer Science & Engineering", "Electrical & Computer Engineering",
    "Mechanical Engineering", "Civil Engineering", "Chemical Engineering",
    "Software Engineering", "Physics", "Chemistry", "Mathematics", "Biotechnology"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await apiAuth.login(email, password);
        onAuthSuccess(getStoredUser());
        onClose();
      } else if (mode === "register") {
        await apiAuth.register(email, password, name);
        setMode("complete");
      } else if (mode === "complete") {
        await apiAuth.completeProfile({ student_id: studentId, department_id: dept, year, semester, bio });
        setSuccessMessage("✅ Registration complete! Welcome to ASTU Platform.");
        setMode("success");
        // Close after 2 seconds
        setTimeout(() => {
          onAuthSuccess(getStoredUser());
          onClose();
        }, 2000);
      }
    } catch (err) {
      let errorMsg = "Authentication failed. Please try again.";
      if (err?.message) errorMsg = err.message;
      else if (err?.detail) errorMsg = err.detail;
      else if (err?.data) errorMsg = JSON.stringify(err.data).substring(0, 150);
      
      // Only show server unavailable if it's truly a network error
      if (!errorMsg || errorMsg.includes("[object")) {
        errorMsg = "Unable to reach the server. Please ensure the backend is running on port 8000.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError("");
    // TODO: For production, replace this with real Google OAuth flow
    // Temporary: Show message that Google auth is not yet configured
    setError("🔧 Google authentication requires OAuth credentials. For now, use email/password login to test the platform.");
    setGoogleLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <GraduationCap size={15} />
            </div>
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 font-heading">
              {mode === "complete" ? "Complete Your Profile" : mode === "login" ? "Sign In to ASTU" : "Create Account"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="text-[11px] text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3">
              {error}
            </div>
          )}

          {mode === "success" && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckSquare size={32} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Registration Complete!</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {successMessage || "Welcome to ASTU Platform. You can now access all features."}
                </p>
              </div>
            </div>
          )}

          {mode !== "complete" && mode !== "success" && (
            <>
              {mode === "register" && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} type="text" required placeholder="Abebe Bikila"
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="student@astu.edu.et"
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="••••••••"
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </>
          )}

          {mode === "complete" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</label>
                <input value={studentId} onChange={e => setStudentId(e.target.value)} type="text" required placeholder="UGR/12345/16"
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
                <select value={dept} onChange={e => setDept(e.target.value)}
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors">
                  {deptOptions.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors">
                    {[1,2,3,4,5].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Semester</label>
                  <select value={semester} onChange={e => setSemester(Number(e.target.value))}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors">
                    {[1,2].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Bio (optional)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="Tell us about yourself..."
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors resize-none" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <LogIn size={13} />}
            {loading ? "Processing..." : mode === "complete" ? "Finish Setup" : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {mode !== "complete" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-slate-950 text-slate-400">or</span>
                </div>
              </div>

              <button type="button" disabled={googleLoading}
                onClick={handleGoogleAuth}
                className="w-full py-2.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {googleLoading ? <RefreshCw size={13} className="animate-spin" /> : <span>🔍</span>}
                {googleLoading ? "Connecting..." : "Sign in with Google"}
              </button>

              <p className="text-center text-[10px] text-slate-400">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  {mode === "login" ? "Register" : "Sign In"}
                </button>
              </p>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}

/* ===== MAIN LAYOUT ===== */
function MainLayout() {
  const [activePage, setActivePage] = useState("home");
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [prefilledQuery, setPrefilledQuery] = useState("");
  const [tourActive, setTourActive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  useEffect(() => {
    const hasVisited = localStorage.getItem("astu_visited");
    if (!hasVisited) {
      const timer = setTimeout(() => setTourActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleUnauth = () => { setCurrentUser(null); setShowAuth(true); };
    window.addEventListener("astu-unauthorized", handleUnauth);
    return () => window.removeEventListener("astu-unauthorized", handleUnauth);
  }, []);

  const handleNavigation = (page, deptId = null, query = "") => {
    setActivePage(page);
    setSelectedDeptId(deptId);
    if (query) setPrefilledQuery(query);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    await apiAuth.logout();
    setCurrentUser(null);
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300">
      <Navbar
        onStartTour={() => setTourActive(true)}
        onNavigate={handleNavigation}
        currentUser={currentUser}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />
      <GuiderAssistant active={tourActive} onClose={() => setTourActive(false)} />

      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={handleAuthSuccess} />
        )}
      </AnimatePresence>

      <div className="flex-1 mt-14 h-[calc(100vh-56px)] w-full overflow-hidden flex flex-row">
        {activePage === "home" && (
          <>
            <LeftPanel />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <CenterPanel onNavigate={handleNavigation} />
              <BottomBar onNavigate={handleNavigation} />
            </div>
            <RightPanel />
          </>
        )}
        {activePage === "courses" && (
          <CoursesView
            initialDeptId={selectedDeptId}
            initialQuery={prefilledQuery}
            onBack={() => setActivePage("home")}
            currentUser={currentUser}
          />
        )}
        {activePage === "projects" && (
          <ProjectsView
            onBack={() => setActivePage("home")}
            currentUser={currentUser}
            onLoginClick={() => setShowAuth(true)}
          />
        )}
        {activePage === "materials" && (
          <MaterialsView onBack={() => setActivePage("home")} />
        )}
        {activePage === "profile" && (
          <ProfileView
            onBack={() => setActivePage("home")}
            currentUser={currentUser}
            onUpdate={(updated) => setCurrentUser(updated)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}

/* =========================================================================
   COURSES VIEW
   ========================================================================= */
function CoursesView({ initialDeptId, initialQuery, onBack, currentUser }) {
  const [coursesList, setCoursesList] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("Engineering");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [studyTab, setStudyTab] = useState("content");
  const [aiNotes, setAiNotes] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [chatInput, setChatInput] = useState(initialQuery || "");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const chatEndRef = useRef(null);

  // Load courses from API
  useEffect(() => {
    async function loadCourses() {
      try {
        let data;
        if (currentUser) {
          data = await apiCourses.listPersonalized().catch(() => apiCourses.list());
        } else {
          data = await apiCourses.list();
        }
        if (data && (data.results || data).length > 0) {
          setCoursesList(data.results || data);
        } else {
          setCoursesList(mockCourses);
        }
      } catch {
        setCoursesList(mockCourses);
      }
    }
    loadCourses();
  }, [currentUser]);

  // Respond to initial query
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setTimeout(() => handleSendChat(initialQuery), 500);
    }
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Load AI notes when tab selected
  useEffect(() => {
    if (studyTab === "notes" && selectedChapterId) {
      loadAINotes(selectedChapterId);
    }
  }, [studyTab, selectedChapterId]);

  const loadAINotes = async (chapterId) => {
    setNotesLoading(true);
    try {
      let notes = await apiAI.getNotes(chapterId);
      if (!notes?.content && !notes?.notes) {
        notes = await apiAI.generateNotes(chapterId);
      }
      setAiNotes(notes?.content || notes?.notes || notes?.answer || generateFallbackNotes(selectedCourse));
    } catch {
      setAiNotes(generateFallbackNotes(selectedCourse));
    } finally {
      setNotesLoading(false);
    }
  };

  const generateFallbackNotes = (course) => {
    const name = (course?.name || course?.title || "this course");
    return `# AI Study Notes — ${name}

## Chapter Overview
This chapter covers the fundamental concepts and methodologies of ${name}.

## Key Learning Objectives
1. **Core Concepts**: Understanding the theoretical framework that underpins this subject area and its real-world applications.
2. **Practical Skills**: Applying learned concepts to solve problems, complete lab assignments, and build working systems.
3. **Critical Analysis**: Evaluating different approaches and understanding trade-offs in design decisions.

## Important Topics
- Introduction to the domain and historical context
- Core algorithms, formulas, and design principles
- Laboratory exercises and hands-on implementations
- Exam preparation: common question patterns and problem-solving strategies

## Quick Review Questions
1. What are the primary goals and constraints of this domain?
2. How do the theoretical concepts relate to practical engineering problems?
3. What are the most common mistakes students make in this topic?

---
*Generated by ASTU AI Assistant · Powered by Groq LLaMA3*`;
  };

  const handleSendChat = async (messageText) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { sender: "user", text: textToSend };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const history = chatHistory.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
      
      if (selectedChapterId) {
        // Use streaming SSE for chapter chat
        let aiText = "";
        setChatHistory(prev => [...prev, { sender: "ai", text: "", streaming: true }]);
        
        await apiAI.streamChat(
          selectedChapterId, textToSend, history,
          (chunk) => {
            aiText += chunk;
            setChatHistory(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { sender: "ai", text: aiText, streaming: true };
              return updated;
            });
          },
          (err) => {
            // Fallback to non-streaming
            const fallback = getMockAIResponse(textToSend);
            setChatHistory(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { sender: "ai", text: fallback, streaming: false };
              return updated;
            });
            setIsTyping(false);
          },
          () => {
            setChatHistory(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = { ...updated[updated.length - 1], streaming: false };
              }
              return updated;
            });
            setIsTyping(false);
          }
        );
      } else {
        // Use home AI for general questions
        const response = await apiAI.askHome(textToSend, history);
        const responseText = response?.answer || response?.response || getMockAIResponse(textToSend);
        setChatHistory(prev => [...prev, { sender: "ai", text: responseText }]);
        setIsTyping(false);
      }
    } catch {
      const fallback = getMockAIResponse(textToSend);
      setChatHistory(prev => [...prev, { sender: "ai", text: fallback }]);
      setIsTyping(false);
    }
  };

  const filteredCourses = coursesList.filter(c => {
    if (selectedDeptFilter === "Engineering") {
      return !c.dept?.toLowerCase().includes("physics") && 
             !c.dept?.toLowerCase().includes("math") && 
             !c.dept?.toLowerCase().includes("chemistry") && 
             !c.dept?.toLowerCase().includes("biotech");
    }
    return c.dept?.toLowerCase().includes("physics") || 
           c.dept?.toLowerCase().includes("math") || 
           c.dept?.toLowerCase().includes("chemistry") || 
           c.dept?.toLowerCase().includes("biotech") ||
           c.category === "Applied Science" || c.category === "B";
  });

  const activeCourse = selectedCourse ? coursesList.find(c => (c.id === selectedCourse || c.id === parseInt(selectedCourse))) : null;
  const chapters = activeCourse?.chapters || [
    { id: 1, title: "Fundamentals & Introduction" },
    { id: 2, title: "Core Methodologies" },
    { id: 3, title: "Practical Lab Sessions" },
    { id: 4, title: "Advanced Topics & Applications" }
  ];

  return (
    <div className="flex-1 flex flex-row h-full overflow-hidden bg-slate-50 dark:bg-slate-900/10">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer">
            <ArrowLeft size={15} />
          </button>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-heading">Course Navigator</span>
        </div>

        <div className="p-3 border-b border-slate-100 dark:border-slate-900 flex gap-2">
          {["Engineering", "Applied Science"].map(cat => (
            <button key={cat}
              onClick={() => setSelectedDeptFilter(cat)}
              className={`flex-1 text-[10px] font-bold py-1 px-2 rounded-md transition-colors ${
                selectedDeptFilter === cat ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
              }`}
            >
              {cat === "Engineering" ? "Engineering" : "Applied Sci."}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 no-scrollbar">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {selectedDeptFilter} Courses
            </span>
            <div className="mt-1 flex flex-col gap-1">
              {(filteredCourses.length > 0 ? filteredCourses : mockCourses).map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course.id);
                    setSelectedChapterId(null);
                    setAiNotes(null);
                    setStudyTab("content");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium leading-tight transition-colors ${
                    selectedCourse === course.id
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <span className="block font-bold text-[9px] text-slate-400">{course.code}</span>
                  {course.name || course.title}
                </button>
              ))}
            </div>
          </div>

          {selectedCourse && (
            <div className="border-t border-slate-100 dark:border-slate-900 pt-3">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Chapters
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {chapters.map((ch, idx) => (
                  <button
                    key={ch.id || idx}
                    onClick={() => { setSelectedChapterId(ch.id); setAiNotes(null); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      selectedChapterId === ch.id
                        ? "bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Chapter {idx + 1}: {ch.title || ch.name || `Topic ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Study Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">
              {activeCourse ? (activeCourse.name || activeCourse.title) : "Select a Course"}
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {selectedChapterId ? `Chapter ${chapters.findIndex(c => c.id === selectedChapterId) + 1}: ${chapters.find(c => c.id === selectedChapterId)?.title || ""}` : "Choose a chapter from the sidebar"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-full text-[10px] font-bold">
              {["content", "notes", "video"].map(tab => (
                <button key={tab}
                  onClick={() => setStudyTab(tab)}
                  className={`px-3 py-1 rounded-full transition-all capitalize ${
                    studyTab === tab ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {tab === "notes" ? "AI Notes" : tab === "content" ? "Slides" : "Video"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAIPanel(p => !p)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Toggle AI Panel"
            >
              <Sparkles size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {!selectedCourse && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BookOpen size={56} className="text-emerald-500 mb-4 opacity-40" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select a Course to Start Studying</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Browse courses from the sidebar, then choose a chapter to access materials, slides, and AI-generated notes.</p>
            </div>
          )}

          {selectedCourse && studyTab === "content" && (
            <div className="w-full h-full min-h-[300px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950 shadow-sm flex flex-col items-center justify-center p-6 text-center">
              <BookOpen size={48} className="text-emerald-500 mb-3 opacity-80" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {activeCourse?.name || "Lecture Slides"} — Chapter Materials
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-sm mt-1">
                {selectedChapterId
                  ? "Slide viewer renders PDF/PPT content via Google Docs embed. Upload materials from the Admin panel to display them here."
                  : "Select a chapter from the sidebar to view its presentation slides and materials."}
              </p>
              {selectedChapterId && (
                <button className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors cursor-pointer">
                  <Download size={12} />
                  Download Chapter Materials
                </button>
              )}
            </div>
          )}

          {selectedCourse && studyTab === "notes" && (
            <div className="glass-panel p-6 rounded-3xl flex flex-col gap-4 max-w-2xl mx-auto shadow-sm bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles size={11} className={notesLoading ? "animate-spin" : ""} />
                  Groq LLaMA3 AI Study Notes
                </span>
                <button
                  onClick={() => selectedChapterId && loadAINotes(selectedChapterId)}
                  className="text-[9px] text-slate-400 hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} />
                  Regenerate
                </button>
              </div>
              {notesLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Sparkles size={28} className="text-emerald-500 animate-spin" />
                  <p className="text-[11px] text-slate-400">Generating AI study notes...</p>
                </div>
              ) : (
                <article className="prose dark:prose-invert text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 flex flex-col gap-3 font-medium whitespace-pre-wrap">
                  {aiNotes || generateFallbackNotes(activeCourse)}
                </article>
              )}
            </div>
          )}

          {selectedCourse && studyTab === "video" && (
            <div className="w-full h-full min-h-[300px] border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-950 relative flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="z-20 text-center flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                  <Play size={20} className="fill-current ml-1" />
                </div>
                <span className="text-xs font-bold text-white mt-2">Lecture Video</span>
                <span className="text-[9px] text-slate-400">
                  {activeCourse?.name || "Selected Course"} — {selectedChapterId ? `Chapter ${chapters.findIndex(c => c.id === selectedChapterId) + 1}` : "Select a chapter"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right AI Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-heading flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-500" />
                Chapter AI Assistant
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                llama3
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-500 mt-10">
                  <Sparkles size={28} className="text-emerald-500 mb-2 opacity-50 animate-pulse" />
                  <h4 className="text-[11px] font-bold">Ask Course-Specific Questions</h4>
                  <p className="text-[9px] mt-1 leading-normal max-w-[180px]">
                    I have context over course notes, slides, and syllabus. Ask anything!
                  </p>
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {["Explain the key concepts", "Generate quiz questions", "Summarize this chapter"].map(q => (
                      <button key={q} onClick={() => handleSendChat(q)}
                        className="text-[10px] text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/30 hover:text-emerald-600 transition-colors cursor-pointer">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index}
                    className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === "user" ? "items-end ml-auto" : "items-start"}`}
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                      {msg.sender === "user" ? "You" : "AI"}
                    </span>
                    <div className={`p-3 rounded-2xl text-[10px] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-500 text-white font-medium rounded-tr-none shadow-sm"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none"
                    }`}>
                      {msg.text}
                      {msg.streaming && <span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1 animate-pulse" />}
                    </div>
                  </div>
                ))
              )}
              {isTyping && !chatHistory.some(m => m.streaming) && (
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <Sparkles size={11} className="animate-spin text-emerald-500" />
                  <span>AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent border-none outline-none text-[10px] text-slate-700 dark:text-slate-200 placeholder-slate-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={isTyping}
                  className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   PROJECTS VIEW
   ========================================================================= */
function ProjectsView({ onBack, currentUser, onLoginClick }) {
  const [view, setView] = useState("list"); // list | workspace | create
  const [projectsList, setProjectsList] = useState([]);
  const [exploreProjects, setExploreProjects] = useState([]);
  const [tab, setTab] = useState("mine"); // mine | explore
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], in_progress: [], review: [], done: [] });
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [activity, setActivity] = useState([]);
  const [workspaceTab, setWorkspaceTab] = useState("kanban");
  const [loading, setLoading] = useState(true);
  const [aiProjectInput, setAiProjectInput] = useState("");
  const [aiProjectResponse, setAiProjectResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form
  const [newProject, setNewProject] = useState({ name: "", description: "", category: "coursework", type: "solo", visibility: "private", github_url: "" });
  const [creating, setCreating] = useState(false);

  // New task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "todo" });

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [mine, explore] = await Promise.all([
        apiProjects.list().catch(() => []),
        apiProjects.listExplore().catch(() => [])
      ]);
      setProjectsList(mine?.results || mine || getMockProjects());
      setExploreProjects(explore?.results || explore || []);
    } catch {
      setProjectsList(getMockProjects());
    } finally {
      setLoading(false);
    }
  };

  const getMockProjects = () => [
    { id: 1, name: "ASTU Course Tracker", description: "Track your academic progress across semesters", category: "coursework", visibility: "private", created_at: "2026-05-01" },
    { id: 2, name: "AI Chatbot Research", description: "Exploring LLM applications in educational settings", category: "research", visibility: "public", created_at: "2026-05-15" },
  ];

  const openWorkspace = async (project) => {
    setSelectedProject(project);
    setView("workspace");
    // Load tasks
    try {
      const taskData = await apiProjects.getTasks(project.id);
      const taskArr = taskData?.results || taskData || [];
      const grouped = { todo: [], in_progress: [], review: [], done: [] };
      taskArr.forEach(t => {
        const col = t.status || "todo";
        if (grouped[col]) grouped[col].push(t);
        else grouped.todo.push(t);
      });
      setTasks(grouped);
    } catch {
      setTasks({ todo: [{ id: 1, title: "Initial setup", priority: "high" }], in_progress: [], review: [], done: [] });
    }
    // Load messages
    try {
      const msgs = await apiProjects.getMessages(project.id);
      setMessages(msgs?.results || msgs || []);
    } catch { setMessages([]); }
    // Load activity
    try {
      const act = await apiProjects.getActivity(project.id);
      setActivity(act?.results || act || []);
    } catch { setActivity([]); }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await apiProjects.create(newProject);
      setProjectsList(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewProject({ name: "", description: "", category: "coursework", type: "solo", visibility: "private", github_url: "" });
    } catch {
      alert("Failed to create project. Make sure you are logged in.");
    } finally {
      setCreating(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const created = await apiProjects.createTask(selectedProject.id, newTask);
      const col = created.status || "todo";
      setTasks(prev => ({ ...prev, [col]: [...(prev[col] || []), created] }));
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", priority: "medium", status: "todo" });
    } catch {
      const mockTask = { id: Date.now(), ...newTask };
      setTasks(prev => ({ ...prev, todo: [...prev.todo, mockTask] }));
      setShowTaskModal(false);
    }
  };

  const handleMoveTask = async (task, fromCol, toCol) => {
    try {
      await apiProjects.moveTask(task.id, toCol);
    } catch {}
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== task.id),
      [toCol]: [...(prev[toCol] || []), { ...task, status: toCol }]
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const localMsg = { id: Date.now(), content: msgInput, sender: currentUser?.name || "You", created_at: new Date().toISOString() };
    setMessages(prev => [...prev, localMsg]);
    setMsgInput("");
    try {
      await apiProjects.sendMessage(selectedProject.id, msgInput);
    } catch {}
  };

  const handleAskProjectAI = async () => {
    if (!aiProjectInput.trim()) return;
    setAiLoading(true);
    setAiProjectResponse("");
    try {
      const res = await apiAI.askProject(selectedProject?.id, aiProjectInput, []);
      setAiProjectResponse(res?.answer || res?.response || "I can help with project planning, documentation, and code guidance!");
    } catch {
      setAiProjectResponse("I'm here to help with your project! I can generate task descriptions, write documentation, suggest architecture patterns, and review your project scope. What would you like help with?");
    } finally {
      setAiLoading(false);
    }
  };

  const kanbanColumns = [
    { key: "todo", label: "To Do", color: "bg-slate-400" },
    { key: "in_progress", label: "In Progress", color: "bg-blue-500" },
    { key: "review", label: "Review", color: "bg-amber-500" },
    { key: "done", label: "Done", color: "bg-emerald-500" }
  ];

  const priorityColors = { high: "text-rose-500", medium: "text-amber-500", low: "text-emerald-500" };

  if (view === "workspace" && selectedProject) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/10">
        {/* Header */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer">
              <ArrowLeft size={14} />
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">{selectedProject.name}</h2>
              <p className="text-[10px] text-slate-400">{selectedProject.description}</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-full text-[10px] font-bold">
            {["kanban", "chat", "ai", "activity"].map(t => (
              <button key={t} onClick={() => setWorkspaceTab(t)}
                className={`px-3 py-1 rounded-full transition-all capitalize ${workspaceTab === t ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-500"}`}>
                {t === "ai" ? "AI Assist" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-hidden p-4">
          {workspaceTab === "kanban" && (
            <div className="h-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Kanban Board</span>
                <button onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm cursor-pointer">
                  <Plus size={12} />
                  Add Task
                </button>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3 overflow-hidden">
                {kanbanColumns.map(col => (
                  <div key={col.key} className="flex flex-col gap-2 bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 overflow-hidden">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className={`w-2 h-2 rounded-full ${col.color}`} />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{col.label}</span>
                      <span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                        {(tasks[col.key] || []).length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2">
                      {(tasks[col.key] || []).map(task => (
                        <div key={task.id}
                          className="bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2 hover:border-emerald-500/30 transition-colors group">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{task.title}</p>
                          {task.description && <p className="text-[9px] text-slate-400 line-clamp-2">{task.description}</p>}
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold uppercase ${priorityColors[task.priority] || "text-slate-400"}`}>
                              {task.priority || "medium"}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {kanbanColumns.filter(c => c.key !== col.key).map(c => (
                                <button key={c.key} onClick={() => handleMoveTask(task, col.key, c.key)}
                                  className="text-[8px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 cursor-pointer">
                                  → {c.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceTab === "chat" && (
            <div className="h-full flex flex-col gap-3">
              <div className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <MessageSquare size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No messages yet. Start collaborating!</p>
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400">{msg.sender || msg.user?.name || "Member"}</span>
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-tl-none p-3 text-[11px] text-slate-700 dark:text-slate-300 w-max max-w-md">
                      {msg.content}
                    </div>
                    <span className="text-[8px] text-slate-300 dark:text-slate-700">{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2">
                <input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Send a message to your team..."
                  className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none border-none" />
                <button type="submit" className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer">
                  <Send size={12} />
                </button>
              </form>
            </div>
          )}

          {workspaceTab === "ai" && (
            <div className="h-full flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-heading">Project AI Assistant</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">Groq</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Generate README", "Create task descriptions", "Suggest architecture", "Write documentation"].map(q => (
                    <button key={q} onClick={() => { setAiProjectInput(q); }}
                      className="text-[10px] px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500/30 hover:text-emerald-600 transition-colors cursor-pointer">
                      {q}
                    </button>
                  ))}
                </div>
                {aiProjectResponse && (
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto no-scrollbar">
                    {aiProjectResponse}
                  </div>
                )}
                {!aiProjectResponse && (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <Sparkles size={32} className="text-emerald-500 mx-auto mb-2 opacity-30 animate-pulse" />
                      <p className="text-xs text-slate-400">Ask me to help with your project!</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2">
                <input value={aiProjectInput} onChange={e => setAiProjectInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAskProjectAI()}
                  placeholder="Ask project AI assistant..."
                  className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none border-none" />
                <button onClick={handleAskProjectAI} disabled={aiLoading}
                  className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer disabled:opacity-50">
                  {aiLoading ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                </button>
              </div>
            </div>
          )}

          {workspaceTab === "activity" && (
            <div className="h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto no-scrollbar">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">Activity Log</h3>
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Activity size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <Activity size={11} />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{act.description || act.message}</p>
                        <span className="text-[9px] text-slate-400">{new Date(act.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {showTaskModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">New Task</h3>
                  <button onClick={() => setShowTaskModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer"><X size={14} /></button>
                </div>
                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                  <input value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} required placeholder="Task title"
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none" />
                  <textarea value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} placeholder="Description (optional)" rows={2}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none resize-none" />
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority: e.target.value}))}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button type="submit" className="py-2 rounded-full text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer">Create Task</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/10">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer">
            <ArrowLeft size={14} />
          </button>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">Project Workspace</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-full text-[10px] font-bold">
            {["mine", "explore"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-full transition-all capitalize ${tab === t ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-500"}`}>
                {t === "mine" ? "My Projects" : "Explore"}
              </button>
            ))}
          </div>
          {currentUser ? (
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm cursor-pointer">
              <Plus size={12} />
              New Project
            </button>
          ) : (
            <button onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer">
              <LogIn size={12} />
              Login to Create
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 grid grid-cols-3 gap-4 content-start">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-40">
            <RefreshCw size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : (tab === "mine" ? projectsList : exploreProjects).map(project => (
          <div key={project.id}
            className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-3 hover:border-emerald-500/30 hover:shadow-md transition-all group cursor-pointer"
            onClick={() => openWorkspace(project)}
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Briefcase size={16} />
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                project.visibility === "public" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50" : "bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
              }`}>
                {project.visibility || "private"}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{project.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{project.description}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-2 mt-auto">
              <span className="text-[9px] font-bold uppercase text-slate-400">{project.category || "project"}</span>
              <span className="text-[9px] text-slate-400">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {!loading && (tab === "mine" ? projectsList : exploreProjects).length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center h-40 text-center">
            <Briefcase size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-semibold text-slate-500">{tab === "mine" ? "No projects yet. Create your first!" : "No public projects found."}</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-heading">Create New Project</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer"><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
                <input value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} required placeholder="Project name"
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none" />
                <textarea value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))} required placeholder="Project description" rows={2}
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={newProject.category} onChange={e => setNewProject(p => ({...p, category: e.target.value}))}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                    <option value="coursework">Coursework</option>
                    <option value="research">Research</option>
                    <option value="personal">Personal</option>
                    <option value="open_source">Open Source</option>
                  </select>
                  <select value={newProject.visibility} onChange={e => setNewProject(p => ({...p, visibility: e.target.value}))}
                    className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <input value={newProject.github_url} onChange={e => setNewProject(p => ({...p, github_url: e.target.value}))} placeholder="GitHub repo URL (optional)"
                  className="p-2.5 border rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none" />
                <button type="submit" disabled={creating}
                  className="py-2.5 rounded-full text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
                  {creating ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   MATERIALS VIEW
   ========================================================================= */
function MaterialsView({ onBack }) {
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiMaterials.list();
        const items = data?.results || data || [];
        setMaterialsList(items.length > 0 ? items : mockMaterials);
      } catch {
        setMaterialsList(mockMaterials);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = materialsList
    .filter(m => {
      const matchSearch = !searchQuery || 
        (m.title || m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.course || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "all" || (m.type || m.file_type || "").toLowerCase() === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "downloads") return (b.downloads || b.download_count || 0) - (a.downloads || a.download_count || 0);
      if (sortBy === "name") return (a.title || a.name || "").localeCompare(b.title || b.name || "");
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const handleDownload = async (material) => {
    try {
      await apiMaterials.trackDownload(material.id);
    } catch {}
    if (material.file_url || material.url) {
      window.open(material.file_url || material.url, "_blank");
    } else {
      alert(`Download: ${material.title || material.name}`);
    }
  };

  const typeIcon = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "pdf") return "📄";
    if (t === "youtube") return "▶️";
    if (t === "ppt" || t === "pptx") return "📊";
    if (t === "markdown") return "📝";
    if (t === "mp4") return "🎬";
    return "📁";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/10">
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer">
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-heading">Materials Repository</h2>
            <p className="text-[10px] text-slate-400">{filtered.length} resources available</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5">
            <Search size={12} className="text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search materials..."
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none border-none w-36" />
          </div>
          {/* Type filter */}
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 outline-none cursor-pointer">
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="ppt">PPT</option>
            <option value="youtube">YouTube</option>
            <option value="markdown">Markdown</option>
          </select>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 outline-none cursor-pointer">
            <option value="date">Sort: Newest</option>
            <option value="downloads">Sort: Downloads</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 grid grid-cols-3 gap-4 content-start">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-40">
            <RefreshCw size={24} className="animate-spin text-emerald-500" />
          </div>
        ) : filtered.map(m => (
          <div key={m.id}
            className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3 hover:border-emerald-500/20 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{typeIcon(m.type || m.file_type)}</span>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                {(m.type || m.file_type || "file").toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors leading-tight line-clamp-2">
                {m.title || m.name}
              </h3>
              <p className="text-[10px] text-slate-400 italic">
                {m.course || m.course_name || "General Materials"}
              </p>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-2">
              <span>{m.downloads || m.download_count || 0} downloads</span>
              <span>{m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setPreviewItem(m)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-300 cursor-pointer"
                title="Preview"
              >
                <Eye size={12} />
              </button>
              <button
                onClick={() => handleDownload(m)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Download size={11} />
                Download
              </button>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center h-40 text-center">
            <BookOpen size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-semibold text-slate-500">No materials found for your search.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{previewItem.title || previewItem.name}</span>
                <button onClick={() => setPreviewItem(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer"><X size={14} /></button>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <span className="text-4xl mb-3">{typeIcon(previewItem.type || previewItem.file_type)}</span>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">{previewItem.title || previewItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{previewItem.course || previewItem.course_name}</p>
                {(previewItem.file_url || previewItem.url) ? (
                  <a href={previewItem.file_url || previewItem.url} target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                    <ExternalLink size={12} />
                    Open Resource
                  </a>
                ) : (
                  <p className="mt-4 text-[11px] text-slate-400">Preview not available. Download the file to view its contents.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   PROFILE VIEW
   ========================================================================= */
function ProfileView({ onBack, currentUser, onUpdate }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || currentUser?.full_name || "ASTU Student",
    studentId: currentUser?.student_id || "",
    bio: currentUser?.bio || "",
    dept: currentUser?.department || currentUser?.department_name || "Computer Science & Engineering",
    year: currentUser?.year || 1,
    semester: currentUser?.semester || 1
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const deptOptions = [
    "Computer Science & Engineering", "Electrical & Computer Engineering",
    "Mechanical Engineering", "Civil Engineering", "Chemical Engineering",
    "Software Engineering", "Physics", "Chemistry", "Mathematics", "Biotechnology"
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiAuth.updateProfile({
        full_name: formData.name,
        bio: formData.bio,
        year: formData.year,
        semester: formData.semester,
      });
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900/20 p-6 gap-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-500 cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-heading">Student Profile</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Manage your academic enrollment settings</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex items-center justify-center p-4">
        <form onSubmit={handleSave}
          className="glass-panel p-6 rounded-3xl w-full max-w-lg shadow-xl bg-white dark:bg-slate-950 flex flex-col gap-4">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
              {initials || "?"}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{formData.name}</h3>
              <p className="text-[10px] text-slate-400">{currentUser?.email || "student@astu.edu.et"}</p>
              <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-full font-bold">
                {formData.dept}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Student ID</label>
              <input type="text" value={formData.studentId} readOnly
                className="p-2 border rounded-lg bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 outline-none cursor-not-allowed" />
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Short Bio</label>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={2}
                className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Department</label>
              <select value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })}
                className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                {deptOptions.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Year</label>
                <select value={formData.year} onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                  {[1,2,3,4,5].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Semester</label>
                <select value={formData.semester} onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                  className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none">
                  {[1,2].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className={`w-full mt-2 py-2.5 rounded-full text-xs font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer ${
              saved ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25"
            }`}>
            {saving ? <RefreshCw size={13} className="animate-spin" /> : null}
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile Settings"}
          </button>

          <a href="https://portal.astu.edu.et" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
            <ExternalLink size={11} />
            Open Official ASTU Portal
          </a>
        </form>
      </div>
    </div>
  );
}
