import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Star, Plus, Eye, Trash2, X, Check } from 'lucide-react'
import { pb, db, collection, query, orderBy, onSnapshot, doc, deleteDoc } from '../lib/supabase'

import NewMilestoneModal from './NewMilestoneModal'
import DeepDiveView from './DeepDiveView'

export default function Timeline({ perspective }) {
  const [milestones, setMilestones] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const q = query(collection(db, "milestones"), orderBy("created_at", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msData = [];
      querySnapshot.forEach((doc) => {
          msData.push({ id: doc.id, ...doc.data() });
      });
      setMilestones(msData);
    });

    return () => unsubscribe();
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "milestones", id))
      setDeletingId(null)
    } catch (err) {
      console.error("Error deleting milestone:", err)
      alert("Failed to delete memory.")
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16 md:mb-24 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-24 bg-rose/10 blur-3xl rounded-full" />
             <h2 className="text-5xl md:text-7xl font-handwriting">The Story of Us</h2>
             <div className="font-journal text-xl md:text-2xl text-rose/60">a walk through our time</div>
        </div>

        <div className="relative group/timeline">
          {/* SVG Ink Spine */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-1 bg-transparent border-l-2 border-dashed border-sepia/20" />
          
          <svg className="absolute top-0 left-6 md:left-1/2 -translate-x-1/2 h-full w-2 shadow-sm opacity-30" preserveAspectRatio="none">
            <path 
                d="M1 0 Q4 100 1 200 T1 400 Q-2 500 1 600 T1 800 Q4 900 1 1000" 
                fill="none" 
                stroke="#2A2118" 
                strokeWidth="2"
                strokeLinecap="round"
            />
          </svg>

          {/* Create Node Button (Wax Seal Style) */}
          <div className="absolute top-0 left-6 md:left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAdding(true)}
              className="w-14 h-14 rounded-full bg-sepia text-cream shadow-2xl border-4 border-gold/40 flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-8 h-8 relative z-10" />
            </motion.button>
            <span className="font-handwriting text-xl md:text-2xl text-sepia/60 whitespace-nowrap bg-cream/80 px-4 py-1 rounded-full backdrop-blur-sm border border-sepia/5 shadow-sm transform -translate-x-[-10px] md:translate-x-0">
                Pin a memory
            </span>
          </div>

          <div className="space-y-32">
            {milestones.map((ms, idx) => {
              const isHis = ms.perspective === 'his';
              const isAuthor = perspective.toLowerCase() === ms.perspective.toLowerCase();
              const isConfirming = deletingId === ms.id;

              // Theme-specific logic based on the milestone's perspective
              const cardSide = isHis ? 'his' : 'her';
              
              const accentColor = isHis ? 'text-sepia' : 'text-rose';
              const buttonText = ms.layout ? 'Relive the Memory' : 'Create this Memory';
              
              // Alignment based on perspective
              const alignmentClass = isHis ? 'justify-start md:pr-[10%]' : 'justify-end md:pl-[10%]';
              const tiltClass = isHis ? 'rotate-[-1deg]' : 'rotate-[1deg]';

              return (
                <motion.div 
                  key={ms.id}
                  initial={{ opacity: 0, x: isHis ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex w-full flex-col md:flex-row ${alignmentClass} ${cardSide}-perspective pl-12 md:pl-0`}
                >
                  {/* Connector Dot */}
                  <div className={`absolute top-8 left-6 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full ${isHis ? 'bg-sepia' : 'bg-rose'} border-4 border-white z-10 shadow-sm`} />

                  <div className={`w-full md:w-[46%] p-6 md:p-8 shadow-xl border-2 relative transition-all duration-500 group/card hover:shadow-2xl bg-white border-[var(--card-border)] ${tiltClass}`}>
                      {/* Side Indicator Tag */}
                      <div className={`absolute -top-4 ${isHis ? 'left-6' : 'right-6'} px-3 py-1 rounded-sm shadow-sm z-10 font-handwriting text-sm flex items-center gap-2 ${isHis ? 'bg-[#E8E2D0] text-sepia/60' : 'bg-rose/20 text-rose'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isHis ? 'bg-sepia/40' : 'bg-rose'}`} />
                          {isHis ? "His Perspective" : "Her Perspective"}
                      </div>

                      {/* Torn Edge Effect Mockup */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 torn-edge backdrop-blur-[2px]" />
                      
                      {/* Delete Button (Only for author) */}
                      {isAuthor && (
                        <div className={`absolute -top-3 ${isHis ? '-left-3' : '-right-3'} z-20`}>
                           <AnimatePresence mode="wait">
                            {!isConfirming ? (
                              <motion.button
                                key="trash"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setDeletingId(ms.id)}
                                className="p-2.5 bg-white shadow-lg rounded-full text-sepia/20 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-all border border-sepia/5"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            ) : (
                              <motion.div
                                key="confirm"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 bg-white shadow-2xl rounded-full p-1.5 border-2 border-red-500/20"
                              >
                                  <button 
                                    onClick={() => handleDelete(ms.id)}
                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                                    title="Confirm Delete"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => setDeletingId(null)}
                                    className="p-1.5 bg-sepia/10 text-sepia rounded-full hover:bg-sepia/20"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <span className="text-[11px] font-journal px-2 text-red-500 font-bold uppercase tracking-widest whitespace-nowrap">Delete?</span>
                              </motion.div>
                            )}
                           </AnimatePresence>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <span className="font-stamp text-sm opacity-30 uppercase tracking-[0.2em]">{ms.date}</span>
                        {!isHis && <Star className="w-4 h-4 text-rose/20" />}
                        {isHis && <Bookmark className="w-4 h-4 text-sepia/20" />}
                      </div>

                      <h3 className={`text-4xl mb-3 ${accentColor} font-handwriting leading-tight`}>{ms.title}</h3>
                      <p className="font-journal text-xl opacity-70 leading-relaxed">{ms.text}</p>

                      {/* Relive/Create Action */}
                      <button 
                        onClick={() => setSelectedMilestone(ms)}
                        className="mt-8 flex items-center gap-3 group/btn"
                      >
                        <div className={`p-2.5 rounded-full transition-all shadow-sm ${isHis ? 'bg-sepia/5 group-hover/btn:bg-sepia group-hover/btn:text-cream' : 'bg-rose/5 group-hover/btn:bg-rose group-hover/btn:text-cream'}`}>
                           <Eye className="w-5 h-5" />
                        </div>
                        <span className={`font-handwriting text-2xl ${accentColor}/40 group-hover/btn:text-current transition-colors`}>
                          {buttonText}
                        </span>
                      </button>

                      {/* Special Detail (Always present now) */}
                      <div className={`absolute -bottom-4 ${isHis ? '-right-4' : '-left-4'} w-12 h-12 ${isHis ? 'bg-sepia' : 'bg-rose'} rounded-full shadow-xl flex items-center justify-center border-4 border-white`}>
                           <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                              <Star className="w-4 h-4 text-gold/80" />
                           </div>
                      </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMilestone && (
          <DeepDiveView 
            milestone={selectedMilestone} 
            perspective={perspective}
            onClose={() => setSelectedMilestone(null)} 
          />
        )}
      </AnimatePresence>

      <NewMilestoneModal 
        isOpen={isAdding} 
        perspective={perspective}
        onClose={() => setIsAdding(false)} 
      />
    </section>
  )
}
