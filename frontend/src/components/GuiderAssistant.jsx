import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronRight, ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GuiderAssistant({ active, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const tourSteps = [
    {
      targetId: "tour-logo",
      title: "ASTU Brand Portal",
      description: "Welcome to the ASTU Platform! Click the ASTU brand logo anytime to return to this home dashboard.",
      position: "bottom"
    },
    {
      targetId: "tour-search",
      title: "Global Search Index",
      description: "Looking for something specific? Type any course title, code, or department name here for instant lookup.",
      position: "bottom"
    },
    {
      targetId: "tour-jumpon",
      title: "Jump On Shortcuts",
      description: "Hover or click here to jump straight to your collaborative Projects, download Materials, or view exams.",
      position: "bottom"
    },
    {
      targetId: "tour-announcements",
      title: "Campus Notice Board",
      description: "A live-scrolling vertical announcements column. Hovering pauses the scroll, and you can manually scroll to read notices.",
      position: "right"
    },
    {
      targetId: "tour-departments",
      title: "Faculties Showcase",
      description: "Cycle through Engineering and Applied Science departments. The background plays silent previews. Click any card to enter courses.",
      position: "top"
    },
    {
      targetId: "tour-dashboard",
      title: "Dashboard Widgets",
      description: "Check notifications, hop into course chatrooms, view the calendar, or launch the Scientific Calculator popup.",
      position: "left"
    },
    {
      targetId: "tour-aibar",
      title: "ASTU AI Copilot",
      description: "Type questions here for immediate, general information about ASTU. Submitting lets you transfer the chat to Courses.",
      position: "top"
    }
  ];

  const updateCoords = () => {
    if (!active) return;
    const step = tourSteps[currentStep];
    const el = document.getElementById(step.targetId);
    
    if (el) {
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  };

  // Recalculate coordinates on step change, resize, or scroll
  useEffect(() => {
    updateCoords();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      updateCoords();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateCoords);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateCoords);
    };
  }, [currentStep, active]);

  if (!active) return null;

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem("astu_visited", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("astu_visited", "true");
    onClose();
  };

  // Calculate Tooltip Position
  const getTooltipStyle = () => {
    if (isMobile) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed",
        width: "90%",
        maxWidth: "320px"
      };
    }

    const gap = 16;
    const tooltipWidth = 280;
    const tooltipHeight = 160;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case "bottom":
        top = coords.top + coords.height + gap;
        left = coords.left + coords.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = coords.top - tooltipHeight - gap;
        left = coords.left + coords.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = coords.top + coords.height / 2 - tooltipHeight / 3;
        left = coords.left - tooltipWidth - gap;
        break;
      case "right":
        top = coords.top + coords.height / 2 - tooltipHeight / 3;
        left = coords.left + coords.width + gap;
        break;
      default:
        top = coords.top + coords.height + gap;
        left = coords.left;
        break;
    }

    if (typeof window !== 'undefined') {
      left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));
      top = Math.max(12, Math.min(top, window.innerHeight - tooltipHeight - 12));
    }

    return {
      top,
      left,
      position: "absolute"
    };
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      
      {/* 1. Backdrop Spotlight SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto z-40">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {coords.width > 0 && (
              <rect 
                x={coords.left - 6} 
                y={coords.top - 6} 
                width={coords.width + 12} 
                height={coords.height + 12} 
                rx={8} 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(15, 23, 42, 0.45)" 
          mask="url(#spotlight-mask)" 
          className="backdrop-blur-[1px] transition-all duration-300"
          onClick={handleSkip}
        />
      </svg>

      {/* Target Indicator Ring */}
      {coords.width > 0 && (
        <motion.div
          layout
          className="absolute border-2 border-emerald-500 rounded-lg pointer-events-none z-50 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 2. Tooltip Dialog Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 5 }}
          transition={{ duration: 0.2 }}
          style={getTooltipStyle()}
          className="w-70 bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl rounded-2xl p-4 border border-slate-800 dark:border-slate-200 z-50 pointer-events-auto flex flex-col gap-2.5 font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-600 px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Sparkles size={9} />
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <button 
              onClick={handleSkip}
              className="text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-950 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Text Details */}
          <div>
            <h4 className="text-xs font-bold font-heading">
              {step.title}
            </h4>
            <p className="text-[10px] leading-relaxed text-slate-300 dark:text-slate-600 mt-1">
              {step.description}
            </p>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between border-t border-slate-800 dark:border-slate-100 pt-2.5 mt-1.5">
            <button 
              onClick={handleSkip}
              className="text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-950 cursor-pointer"
            >
              Skip Tour
            </button>
            
            <div className="flex gap-1.5">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-slate-200 text-slate-300 dark:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft size={12} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-[9px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{currentStep === tourSteps.length - 1 ? "Finish" : "Next"}</span>
                <ChevronRight size={10} />
              </button>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
