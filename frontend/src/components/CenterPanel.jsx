import React, { useState, useEffect } from "react";
import { mockDepartments } from "../mockData";
import { ChevronLeft, ChevronRight, Play, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { departments as apiDepartments } from "../api";

const getDeptIcon = (code) => {
  const c = String(code).toUpperCase();
  if (c.includes("CSE")) return "💻";
  if (c.includes("ECE")) return "🔌";
  if (c.includes("MECH")) return "⚙️";
  if (c.includes("CIVIL")) return "🏗️";
  if (c.includes("CHEM")) return "🧪";
  if (c.includes("SE")) return "📱";
  if (c.includes("PHYS")) return "⚛️";
  if (c.includes("CHEM")) return "⚗️";
  if (c.includes("MATH")) return "🔢";
  if (c.includes("BIOTECH")) return "🧬";
  return "🎓";
};

const getDeptVideo = (code, name) => {
  const n = String(name || code).toLowerCase();
  if (n.includes("power")) return "/videos/power-control-eng.mp4";
  if (n.includes("software")) return "/videos/software-eng.mp4";
  if (n.includes("electronics")) return "/videos/electronics-communication-eng.mp4";
  if (n.includes("chemical") || n.includes("chem")) return "/videos/chemical-eng.mp4";
  if (n.includes("material")) return "/videos/material-eng.mp4";
  if (n.includes("water")) return "/videos/water-resource-mg.mp4";
  if (n.includes("architecture")) return "/videos/architecture.mp4";
  if (n.includes("physics")) return "/videos/physics.mp4";
  if (n.includes("biology")) return "/videos/biology.mp4";
  if (n.includes("industrial")) return "/videos/industrial.mp4";
  if (n.includes("math")) return "/videos/math.mp4";
  if (n.includes("pharma")) return "/videos/pharma.mp4";
  if (n.includes("mech")) return "/videos/mech.mp4";
  if (n.includes("civil")) return "/videos/civil.mp4";
  return "/videos/cse.mp4";
};

const getCollege = (name) => {
  const n = String(name).toLowerCase();
  if (n.includes("computer") || n.includes("software") || n.includes("electronics") || n.includes("power")) return "College of Electrical Engineering and Computing";
  if (n.includes("architecture") || n.includes("civil") || n.includes("water")) return "College of Civil Engineering";
  if (n.includes("mech") || n.includes("chemical") || n.includes("material")) return "College of Mechanical, Material and Chemical Engineering";
  return "Faculty of Applied Sciences";
};

const sortDepartments = (depts) => {
  const eng = depts.filter(d => d.category === "Engineering");
  const app = depts.filter(d => d.category === "Applied Science");

  const coeec = eng.filter(d => getCollege(d.name).includes("Computing"));
  const coce = eng.filter(d => getCollege(d.name).includes("Civil"));
  const commce = eng.filter(d => getCollege(d.name).includes("Mechanical"));

  const interleavedEng = [];
  const maxEng = Math.max(coeec.length, coce.length, commce.length);
  for(let i = 0; i < maxEng; i++) {
    if(coeec[i]) interleavedEng.push(coeec[i]);
    if(coce[i]) interleavedEng.push(coce[i]);
    if(commce[i]) interleavedEng.push(commce[i]);
  }
  const classifiedIds = new Set(interleavedEng.map(d => d.id));
  const remainingEng = eng.filter(d => !classifiedIds.has(d.id));
  
  return [...interleavedEng, ...remainingEng, ...app];
};

export default function CenterPanel({ onNavigate }) {
  const [departmentsList, setDepartmentsList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Engineering");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    async function loadDepts() {
      try {
        const data = await apiDepartments.list();
        if (data && data.length > 0) {
          const formatted = data.map(d => {
            let cat = "Engineering";
            const rawCat = String(d.category).toLowerCase();
            if (rawCat.includes("applied") || rawCat.includes("science") || rawCat === "b") {
              cat = "Applied Science";
            }
            return {
              id: d.id,
              name: d.name,
              code: d.short_name || d.code || "DEPT",
              category: cat,
              college: getCollege(d.name),
              description: d.description || `Explore course curriculum for the ${d.name} faculty.`,
              videoUrl: d.video_url || getDeptVideo(d.short_name || d.code, d.name),
              icon: getDeptIcon(d.short_name || d.code)
            };
          });
          setDepartmentsList(sortDepartments(formatted));
        } else {
          setDepartmentsList(sortDepartments(mockDepartments.map(d => ({...d, college: getCollege(d.name), videoUrl: getDeptVideo(d.code, d.name)}))));
        }
      } catch (err) {
        setDepartmentsList(sortDepartments(mockDepartments.map(d => ({...d, college: getCollege(d.name), videoUrl: getDeptVideo(d.code, d.name)}))));
      }
    }
    loadDepts();
  }, []);

  // Filter departments based on selected category
  const filteredDepts = departmentsList.filter(
    (dept) => dept.category === activeCategory
  );

  // Auto-cycle departments every 8 seconds
  useEffect(() => {
    if (filteredDepts.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(timer);
  }, [currentIndex, activeCategory, filteredDepts.length]);

  // Reset index when changing category
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentIndex(0);
    setVideoLoaded(false);
  };

  const handleNext = () => {
    if (filteredDepts.length === 0) return;
    setVideoLoaded(false);
    if (currentIndex === filteredDepts.length - 1) {
      setActiveCategory(activeCategory === "Engineering" ? "Applied Science" : "Engineering");
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (filteredDepts.length === 0) return;
    setVideoLoaded(false);
    if (currentIndex === 0) {
      setActiveCategory(activeCategory === "Engineering" ? "Applied Science" : "Engineering");
      // Note: Setting to last index of new category requires knowing its length, 
      // but for simplicity let's just go to 0 of the new category.
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentDept = filteredDepts[currentIndex] || filteredDepts[0];

  return (
    <main 
      id="tour-departments"
      className="flex-1 h-full flex flex-col items-center justify-between px-6 py-4 overflow-hidden relative bg-slate-50 dark:bg-slate-900/10"
    >
      
      {/* Category Toggle Tabs */}
      <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 bg-transparent z-10">
        <div className="flex flex-col">
          <h1 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-1.5 leading-none">
            <Cpu size={15} className="text-emerald-500" />
            ASTU Department Showcase
          </h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Explore academic faculties</span>
        </div>
        
        {/* Horizontal Category Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => handleCategoryChange("Engineering")}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              activeCategory === "Engineering" 
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Category A: Engineering
          </button>
          <button 
            onClick={() => handleCategoryChange("Applied Science")}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 cursor-pointer ${
              activeCategory === "Applied Science" 
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Category B: Applied Science
          </button>
        </div>
      </div>

      {/* Main Showcase Carousel */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 py-4 relative z-10">
        
        {/* Display Card Container */}
        <div className="flex-1 w-full h-full flex items-center justify-center relative">
          {currentDept ? (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentDept.id}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => onNavigate("courses", currentDept.id)}
                className="w-full h-full rounded-3xl overflow-hidden relative border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col justify-end p-6 cursor-pointer group shadow-lg"
              >
                
                {/* Silent Background Video */}
                <video 
                  key={currentDept.videoUrl}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  onCanPlay={() => setVideoLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    videoLoaded ? "opacity-90 group-hover:opacity-95" : "opacity-0"
                  }`}
                  src={currentDept.videoUrl}
                />

                {/* Light overlay to preserve readability while keeping the video visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-0" />

                {/* Sleek Animated Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/50 z-30">
                  <motion.div 
                    key={currentIndex + activeCategory} // re-trigger animation on cycle
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                    className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                </div>

                {/* Navigation Buttons Inside Card (Left & Right) */}
                <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-between z-20 pointer-events-none">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="p-2.5 rounded-full bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="p-2.5 rounded-full bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Department Details Layout */}
                <div className="relative z-10 flex flex-col gap-2 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentDept.icon}</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 px-2 py-0.5 rounded-full tracking-wider">
                      {currentDept.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Category: {currentDept.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-3xl font-extrabold text-white leading-tight font-heading group-hover:text-emerald-400 transition-colors [text-shadow:0_2px_4px_rgba(0,0,0,0.9)]">
                    {currentDept.name}, <span className="block text-sm md:text-lg text-emerald-300 mt-1">{currentDept.college}</span>
                  </h2>
                  
                  <p className="text-xs md:text-sm leading-relaxed text-slate-100 font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                    {currentDept.description}
                  </p>

                  {/* Hover Interactive Indicator */}
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 w-max px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Play size={10} className="fill-current" />
                    <span>Enter Course Portal</span>
                  </div>
                </div>

                {/* Department Background Banner Fallback icon */}
                {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Cpu size={120} className="text-emerald-500" />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center text-slate-400 text-xs">No faculties available in this category.</div>
          )}
        </div>



      </div>

    </main>
  );
}
