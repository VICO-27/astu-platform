import React, { useRef, useState, useEffect } from "react";
import { mockAnnouncements } from "../mockData";
import { Megaphone, MessageSquare, X, Send } from "lucide-react";
import { announcements as apiAnnouncements } from "../api";
import { AnimatePresence, motion } from "framer-motion";

export default function LeftPanel() {
  const scrollRef = useRef(null);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [list, setList] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [focusComment, setFocusComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const commentInputRef = useRef(null);

  const handleCommentSubmit = (e, noticeId) => {
    if (e.key === "Enter" && commentText.trim()) {
      setComments(prev => ({
        ...prev,
        [noticeId]: [...(prev[noticeId] || []), commentText]
      }));
      setCommentText("");
    }
  };

  useEffect(() => {
    if (selectedNotice && focusComment && commentInputRef.current) {
      setTimeout(() => commentInputRef.current.focus(), 100);
    }
  }, [selectedNotice, focusComment]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await apiAnnouncements.list();
        if (data && data.length > 0) {
          // Duplicate list for smooth vertical marquee
          setList([...data, ...data, ...data]);
        } else {
          setList([...mockAnnouncements, ...mockAnnouncements, ...mockAnnouncements]);
        }
      } catch (err) {
        setList([...mockAnnouncements, ...mockAnnouncements, ...mockAnnouncements]);
      }
    }
    loadAnnouncements();
  }, []);

  const handleScrollInteraction = () => {
    setIsManualScroll(true);
  };

  return (
    <aside 
      id="tour-announcements"
      className="w-1/5 h-full border-r bg-[#e6f4ea] dark:bg-emerald-950/20 border-emerald-900/10 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-emerald-900/10 dark:border-slate-800 bg-white/50 dark:bg-emerald-950/50 backdrop-blur flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <Megaphone size={14} />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-heading">
            Announcements
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Live campus bulletins</p>
        </div>
      </div>

      {/* Scrolling Container */}
      <div 
        className="flex-1 overflow-y-auto no-scrollbar relative py-4 select-none"
        onMouseEnter={handleScrollInteraction}
        onMouseLeave={() => setIsManualScroll(false)}
        ref={scrollRef}
      >
        <div className={`flex flex-col gap-3.5 px-3 ${
          isManualScroll ? "" : "animate-marquee-scroll"
        }`}>
          {list.map((card, idx) => {
            const name = card.person_name || card.name || "Dean's Office";
            const avatar = card.image_url || card.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
            const role = card.role || "Official Bulletin";
            return (
              <div 
                key={`${card.id || idx}-${idx}`}
                className="glass-panel p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/30 group"
              >
                {/* Profile / Header */}
                <div className="flex items-center gap-2.5">
                  <img 
                    src={avatar} 
                    alt={name} 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      {name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded w-max">
                      {role}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>

                {/* Action Link */}
                <div className="flex items-center justify-between text-[9px] text-emerald-600 dark:text-emerald-400 font-bold border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span className="cursor-pointer hover:underline" onClick={() => { setSelectedNotice(card); setFocusComment(false); }}>View Full Notice</span>
                  <MessageSquare size={10} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => { setSelectedNotice(card); setFocusComment(true); }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Fade to cover scroll cutting edge */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#e6f4ea] dark:from-emerald-950/20 pointer-events-none" />

      {/* Notice Details Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-emerald-500" />
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider font-heading">Announcement</span>
                </div>
                <button onClick={() => setSelectedNotice(null)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <img src={selectedNotice.image_url || selectedNotice.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} alt="Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedNotice.person_name || selectedNotice.name || "Dean's Office"}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{selectedNotice.role || "Official Bulletin"}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-2">
                  {selectedNotice.description}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comments</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center px-3 py-2">
                    <input
                      ref={commentInputRef}
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => handleCommentSubmit(e, selectedNotice.id)}
                    />
                  </div>
                  <button 
                    onClick={() => handleCommentSubmit({ key: "Enter" }, selectedNotice.id)}
                    className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
                
                {/* Display Comments */}
                <div className="px-5 pb-5">
                  {(comments[selectedNotice.id] || []).map((c, i) => (
                    <div key={i} className="mb-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-100 mr-2">You</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
