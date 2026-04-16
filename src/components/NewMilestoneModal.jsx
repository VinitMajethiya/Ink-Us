import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Star, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react'
import { db, collection, addDoc } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'

export default function NewMilestoneModal({ isOpen, onClose, perspective }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)

    console.log("Attempting to pin memory for perspective:", perspective)

    try {
      // Initiate adding document
      const docRef = await addDoc(collection(db, "milestones"), {
        title,
        date,
        text,
        perspective: perspective.toLowerCase(),
        layout: 'slambook',
        pageData: { 
          title, 
          content: '', 
          photos: [] 
        },
        stickyNotes: [],
        created_at: new Date().toISOString()
      })

      console.log("Memory successfully pinned with ID:", docRef.id)
      
      // Close instantly on success
      onClose()
      setTitle('')
      setDate('')
      setText('')
    } catch (error) {
      console.error("Supabase Error:", error)
      const errorDetail = error.message || "Unknown error";
      alert(`Failed to pin memory: ${errorDetail}.`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sepia/60 backdrop-blur-sm z-[150]"
          />
      {/* Modal Container */}
      <motion.div 
        className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-8 overflow-y-auto pointer-events-none"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="w-full max-w-lg bg-[#FCFAF2] shadow-[0_0_50px_rgba(0,0,0,0.3)] p-10 border-8 border-white pointer-events-auto relative my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Ink Spills & Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture" />
          <div className="absolute -top-4 -left-4 w-24 h-24 opacity-20 pointer-events-none rotate-[-15deg]">
               <img src="/assets/ink-spill.png" className="w-full h-full" />
          </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                    <h2 className="text-4xl text-sepia font-handwriting">Pin a New Memory</h2>
                    <span className="font-journal text-lg opacity-40 italic">A headline for our journey...</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-sepia/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-sepia/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="relative group">
                      <label className="block font-journal text-sm opacity-40 mb-1" style={{ color: 'var(--ink)' }}>Headline</label>
                      <input 
                        type="text" 
                        placeholder="What happened today?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent border-b-2 py-3 font-handwriting text-3xl focus:outline-none transition-colors placeholder:opacity-10 appearance-none"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--ink)' }}
                        required
                      />
                      <Heart className="absolute right-0 bottom-4 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                    </div>

                    <div className="relative group">
                      <label className="block font-journal text-sm opacity-40 mb-1" style={{ color: 'var(--ink)' }}>Date</label>
                      <input 
                        type="text" 
                        placeholder="e.g. November 14th"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-transparent border-b-2 py-3 font-journal text-xl focus:outline-none transition-colors placeholder:opacity-10 appearance-none"
                        style={{ borderColor: 'var(--card-border)', color: 'var(--ink)' }}
                        required
                      />
                      <Calendar className="absolute right-0 bottom-4 w-4 h-4 opacity-10 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-journal text-sm opacity-40" style={{ color: 'var(--ink)' }}>The Premise</label>
                  <textarea 
                    placeholder="Briefly describe the moment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-[var(--ink)]/5 border-2 border-dashed p-4 font-journal text-xl min-h-[100px] focus:outline-none transition-colors placeholder:opacity-10"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--ink)' }}
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 text-cream font-handwriting text-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden group/submit"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent translate-y-full group-hover/submit:translate-y-0 transition-transform" />
                  {isSaving ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin" />
                      Pinning...
                    </>
                  ) : (
                    <>
                      <Star className="w-8 h-8 text-white/80 group-hover/submit:rotate-180 transition-transform duration-700" />
                      Pin to Our Story
                    </>
                  )}
                </button>
                
                <p className="text-center font-journal text-sm opacity-30 italic">
                    details and photos are added in the "Relive" section later
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </>
      )}
    </AnimatePresence>
  )
}
