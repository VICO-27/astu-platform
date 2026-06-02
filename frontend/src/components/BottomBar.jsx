
import React, { useState, useEffect } from "react";
import { Sparkles, Send, X, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ai as apiAI } from "../api";
import { getMockAIResponse } from "../mockData";

export default function BottomBar({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setDrawerQuery(query);
    setQuery("");
    setShowDrawer(true);
    setIsTyping(true);
    setAiResponse("");
  };

  useEffect(() => {
    if (!isTyping || !drawerQuery) return;
    let active = true;

    async function fetchResponse() {
      try {
        const response = await apiAI.askHome(drawerQuery);
        const fullResponse = response?.answer || response?.response || getMockAIResponse(drawerQuery);
        if (!active) return;
        let index = 0;
        setAiResponse("");
        const interval = setInterval(() => {
          if (!active) { clearInterval(interval); return; }
          setAiResponse((prev) => prev + fullResponse.charAt(index));
          index++;
          if (index >= fullResponse.length) {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 8);
      } catch (err) {
        if (!active) return;
        // Fallback to mock AI if backend not available
        const fallback = getMockAIResponse(drawerQuery);
        let index = 0;
        const interval = setInterval(() => {
          if (!active) { clearInterval(interval); return; }
          setAiResponse((prev) => prev + fallback.charAt(index));
          index++;
          if (index >= fallback.length) {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 8);
      }
    }

    fetchResponse();
    return () => { active = false; };
  }, [isTyping, drawerQuery]);

  const handleClose = () => {
    setShowDrawer(false);
    setAiResponse("");
    setDrawerQuery("");
  };

  return (
    <div
      id="tour-aibar"
      className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-col items-center justify-center relative z-25 transition-colors duration-300"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200"
      >
        <Sparkles size={18} className="text-emerald-500 animate-pulse shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about ASTU courses, announcements, or departments..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
        />
        <button
          type="submit"
          className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute bottom-16 left-6 right-6 p-5 rounded-2xl border bg-white dark:bg-slate-950 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-3.5 z-40 max-h-[300px] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-heading">
                    ASTU Copilot Assistant
                  </h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Query: &ldquo;{drawerQuery}&rdquo;
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap no-scrollbar">
              {aiResponse}
              {isTyping && (
                <span className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1 animate-pulse" />
              )}
            </div>

            {!isTyping && (
              <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-900 pt-2.5">
                <button
                  onClick={() => {
                    handleClose();
                    onNavigate("courses", null, drawerQuery);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Continue in Course AI Panel</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
