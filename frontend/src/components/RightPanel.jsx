import React, { useState, useEffect } from "react";
import { 
  Bell, MessageSquare, Calendar as CalendarIcon, Calculator, 
  Settings, Info, HelpCircle, ChevronRight, X, Delete, Plus, Trash2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function RightPanel() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcTab, setCalcTab] = useState("scientific"); // "scientific" | "gpa"
  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  
  // GPA Calculator State
  const [gpaCourses, setGpaCourses] = useState([{ id: 1, credits: 3, grade: "A" }]);
  const gradePoints = { "A+": 4.0, "A": 4.0, "A-": 3.75, "B+": 3.5, "B": 3.0, "B-": 2.75, "C+": 2.5, "C": 2.0, "C-": 1.75, "D": 1.0, "F": 0.0 };

  // Custom Date States
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    setToday(new Date());
  }, []);

  const handleComingSoon = () => {
    alert("Coming soon in Phase 3!");
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysArr = [];
  const totalDays = getDaysInMonth(today);
  const startDayOffset = getFirstDayOfMonth(today);

  for (let i = 0; i < startDayOffset; i++) {
    daysArr.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArr.push(d);
  }

  // Calculator Logic
  const handleCalcBtn = (value) => {
    if (value === "C") {
      setCalcInput("");
      setCalcResult("");
    } else if (value === "DEL") {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (value === "=") {
      try {
        let evalStr = calcInput
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(")
          .replace(/sqrt\(/g, "Math.sqrt(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/log\(/g, "Math.log10(")
          .replace(/pi/g, "Math.PI")
          .replace(/e/g, "Math.E")
          .replace(/\^/g, "**");

        const openParens = (evalStr.match(/\(/g) || []).length;
        const closeParens = (evalStr.match(/\)/g) || []).length;
        if (openParens > closeParens) {
          evalStr += ")".repeat(openParens - closeParens);
        }

        const fn = new Function(`return ${evalStr}`);
        const res = fn();
        
        if (res !== undefined && !isNaN(res)) {
          setCalcResult(Number(res.toFixed(5)).toString());
        } else {
          setCalcResult("Error");
        }
      } catch (err) {
        setCalcResult("Syntax Error");
      }
    } else {
      setCalcInput(prev => prev + value);
    }
  };

  // GPA Logic
  const calculateGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    gpaCourses.forEach(c => {
      const cr = Number(c.credits);
      if(cr > 0 && gradePoints[c.grade] !== undefined) {
        totalCredits += cr;
        totalPoints += cr * gradePoints[c.grade];
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const addGpaCourse = () => {
    setGpaCourses([...gpaCourses, { id: Date.now(), credits: 3, grade: "A" }]);
  };

  const updateGpaCourse = (id, field, value) => {
    setGpaCourses(gpaCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeGpaCourse = (id) => {
    setGpaCourses(gpaCourses.filter(c => c.id !== id));
  };

  return (
    <aside 
      id="tour-dashboard"
      className="w-[300px] h-full flex flex-col border-l border-emerald-900/10 dark:border-slate-800 bg-[#e6f4ea] dark:bg-emerald-950/20 shrink-0 overflow-y-auto no-scrollbar p-4 gap-4"
    >
      {/* 1. Inbox Notification Bell (Shell) */}
      <div onClick={handleComingSoon} className="glass-panel p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-heading">
              Student Inbox
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">3 unread notifications</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-400" />
      </div>

      {/* 2. Group Chat Shortcut (Shell) */}
      <div onClick={handleComingSoon} className="glass-panel p-3.5 rounded-2xl shadow-sm flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-all duration-300 hover:border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-50">
              <MessageSquare size={16} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-heading">
                Group Chat
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Topics channels active</p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-slate-400 dark:text-slate-500">
            52 students online in #CSE-Year-3
          </span>
        </div>
      </div>

      {/* 3. Calendar Widget */}
      <div onClick={handleComingSoon} className="glass-panel p-3.5 rounded-2xl shadow-sm flex flex-col gap-2 bg-white/60 dark:bg-slate-900/60 cursor-pointer hover:shadow-md transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase font-heading">
            {monthNames[today.getMonth()]} {today.getFullYear()}
          </span>
          <CalendarIcon size={12} className="text-emerald-500" />
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mt-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <span key={idx} className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500">
              {day}
            </span>
          ))}
          {daysArr.map((day, idx) => {
            const isToday = day === today.getDate();
            return (
              <span 
                key={idx} 
                className={`text-[9px] font-medium py-0.5 rounded-md flex items-center justify-center ${
                  day === null 
                    ? "opacity-0" 
                    : isToday 
                    ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20" 
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* 4. Calculator Trigger Card */}
      <div 
        onClick={() => setShowCalculator(true)}
        className="glass-panel p-3.5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer bg-emerald-500/5 dark:bg-emerald-400/5 border-emerald-500/20 hover:bg-emerald-500/10 dark:hover:bg-emerald-400/10 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-heading">
              Calculator
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Scientific & GPA tools</p>
          </div>
        </div>
        <ChevronRight size={14} className="text-emerald-500" />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings & Info Buttons */}
      <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
        <button 
          onClick={() => alert("About Us (Phase 2): ASTU Platform v1.0.0 Portfolio project")}
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg text-left transition-colors"
        >
          <Info size={13} />
          About ASTU Platform
        </button>
        <button 
          onClick={() => alert("Settings configuration panel")}
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg text-left transition-colors"
        >
          <Settings size={13} />
          Account Settings
        </button>
        <button 
          onClick={() => alert("Need help? Visit the ASTU platform help desk in the main computer building.")}
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg text-left transition-colors"
        >
          <HelpCircle size={13} />
          Support & Help
        </button>
      </div>

      {/* 5. Floating Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-80 max-w-full overflow-hidden flex flex-col"
            >
              {/* Calculator Header with Tabs */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <button onClick={() => setCalcTab("scientific")} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${calcTab === "scientific" ? "bg-emerald-500 text-white" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
                    Scientific
                  </button>
                  <button onClick={() => setCalcTab("gpa")} className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${calcTab === "gpa" ? "bg-emerald-500 text-white" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
                    GPA/CGPA
                  </button>
                </div>
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
                >
                  <X size={15} />
                </button>
              </div>

              {calcTab === "scientific" ? (
                <>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-950 flex flex-col items-end gap-1 border-b border-slate-100 dark:border-slate-900">
                    <input 
                      type="text" 
                      value={calcInput}
                      onChange={(e) => setCalcInput(e.target.value)}
                      placeholder="0"
                      className="w-full text-right bg-transparent text-slate-800 dark:text-slate-100 font-mono text-base font-medium placeholder-slate-300 dark:placeholder-slate-800 outline-none border-none"
                      autoFocus
                    />
                    <span className="text-emerald-500 dark:text-emerald-400 font-mono text-lg font-bold min-h-6">
                      {calcResult ? `= ${calcResult}` : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-3 bg-slate-50/30 dark:bg-slate-950/20 font-mono text-xs select-none">
                    <button onClick={() => handleCalcBtn("sin(")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">sin</button>
                    <button onClick={() => handleCalcBtn("cos(")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">cos</button>
                    <button onClick={() => handleCalcBtn("tan(")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">tan</button>
                    <button onClick={() => handleCalcBtn("DEL")} className="calc-btn text-rose-500 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100"><Delete size={14} /></button>
                    <button onClick={() => handleCalcBtn("sqrt(")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">√</button>
                    <button onClick={() => handleCalcBtn("^")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">xʸ</button>
                    <button onClick={() => handleCalcBtn("pi")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">π</button>
                    <button onClick={() => handleCalcBtn("C")} className="calc-btn text-rose-500 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100">C</button>
                    <button onClick={() => handleCalcBtn("(")} className="calc-btn text-slate-500 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">(</button>
                    <button onClick={() => handleCalcBtn(")")} className="calc-btn text-slate-500 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">)</button>
                    <button onClick={() => handleCalcBtn("ln(")} className="calc-btn text-emerald-600 bg-emerald-50/50 dark:bg-slate-900 dark:text-emerald-400 hover:bg-emerald-100">ln</button>
                    <button onClick={() => handleCalcBtn("/")} className="calc-btn text-emerald-600 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">/</button>
                    <button onClick={() => handleCalcBtn("7")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">7</button>
                    <button onClick={() => handleCalcBtn("8")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">8</button>
                    <button onClick={() => handleCalcBtn("9")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">9</button>
                    <button onClick={() => handleCalcBtn("*")} className="calc-btn text-emerald-600 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">*</button>
                    <button onClick={() => handleCalcBtn("4")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">4</button>
                    <button onClick={() => handleCalcBtn("5")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">5</button>
                    <button onClick={() => handleCalcBtn("6")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">6</button>
                    <button onClick={() => handleCalcBtn("-")} className="calc-btn text-emerald-600 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">-</button>
                    <button onClick={() => handleCalcBtn("1")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">1</button>
                    <button onClick={() => handleCalcBtn("2")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
                    <button onClick={() => handleCalcBtn("3")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
                    <button onClick={() => handleCalcBtn("+")} className="calc-btn text-emerald-600 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800">+</button>
                    <button onClick={() => handleCalcBtn("0")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 col-span-2">0</button>
                    <button onClick={() => handleCalcBtn(".")} className="calc-btn text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">.</button>
                    <button onClick={() => handleCalcBtn("=")} className="calc-btn text-white bg-emerald-500 hover:bg-emerald-600 font-bold shadow-md shadow-emerald-500/25">=</button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col p-4 bg-slate-50/30 dark:bg-slate-950/20 max-h-96 overflow-y-auto no-scrollbar gap-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Courses</span>
                    <button onClick={addGpaCourse} className="text-[10px] flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded hover:bg-emerald-200 transition-colors">
                      <Plus size={12}/> Add Course
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {gpaCourses.map((course, i) => (
                      <div key={course.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 w-4">{i+1}.</span>
                        <input type="number" min="1" max="10" value={course.credits} onChange={e => updateGpaCourse(course.id, 'credits', e.target.value)} className="w-12 text-xs p-1 border rounded bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-center" placeholder="Cr" />
                        <select value={course.grade} onChange={e => updateGpaCourse(course.id, 'grade', e.target.value)} className="flex-1 text-xs p-1 border rounded bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700">
                          {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button onClick={() => removeGpaCourse(course.id)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Estimated GPA:</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{calculateGPA()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}