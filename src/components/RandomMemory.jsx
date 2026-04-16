import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Loader2, Sparkles } from 'lucide-react'
import { pb, onSnapshot } from '../lib/supabase'

export default function RandomMemory({ onClose }) {
  const [memory, setMemory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRandomMemory() {
      try {
        const records = await pb.collection('milestones').getFullList()
        if (records.length > 0) {
          const random = records[Math.floor(Math.random() * records.length)]
          setMemory(random)
        }
      } catch (err) {
        console.error("Failed to fetch memories", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRandomMemory()
  }, [])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-sepia/20 backdrop-blur-md"
        />
        
        <motion.div
           initial={{ scale: 0.1, y: 100, rotate: -20, opacity: 0 }}
           animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
           exit={{ scale: 0.8, opacity: 0 }}
           transition={{ type: 'spring', damping: 20, stiffness: 100 }}
           className="relative w-full max-w-[600px] bg-[#FFF9E5] p-12 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center"
        >
          {/* Crease Lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-sepia/5 pointer-events-none" />
          <div className="absolute top-0 left-1/3 w-px h-full bg-sepia/5 pointer-events-none" />

          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-8">
                <div className="font-handwriting text-3xl text-rose flex items-center gap-2">
                   {loading ? "Searching for a memory..." : "Hello, love."}
                   {!loading && <Sparkles className="w-5 h-5" />}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-sepia/5 rounded-full">
                    <X className="w-6 h-6 text-sepia/40" />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                     <Loader2 className="w-12 h-12 text-rose animate-spin mb-4" />
                     <p className="font-journal text-sepia/60 italic">Folding the paper...</p>
                </div>
            ) : memory ? (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {memory.pageData?.photos?.[0] ? (
                         <div className="polaroid-frame rotate-2 shrink-0 max-w-[200px]">
                            <img src={memory.pageData.photos[0].url} className="w-full h-auto object-cover" alt="memory" />
                            <div className="font-journal mt-2 text-center text-[10px] sm:text-xs opacity-60">
                                {new Date(memory.date).toLocaleDateString()}
                            </div>
                         </div>
                    ) : (
                        <div className="w-[180px] h-[180px] bg-sepia/5 border-2 border-dashed border-sepia/20 flex items-center justify-center p-4 text-center rotate-3 shrink-0">
                           <span className="font-journal text-sepia/40 text-xs italic">A memory without a photo is still a treasure</span>
                        </div>
                    )}

                    <div className="flex flex-col space-y-4">
                        <h3 className="text-3xl md:text-4xl text-sepia leading-tight">{memory.title}</h3>
                        <p className="font-journal text-lg md:text-xl leading-relaxed text-sepia/80 line-clamp-4">
                            {memory.content}
                        </p>
                        
                        <div className="pt-4 flex items-center gap-2">
                           <span className="font-handwriting text-2xl">Always yours,</span>
                           <Heart className="w-5 h-5 text-rose fill-rose" />
                        </div>
                    </div>
                </div>
            ) : (
              <div className="text-center py-12">
                   <p className="font-journal text-2xl text-sepia/60 italic mb-8">
                     We haven't pinned any milestones yet. <br/> Let's create our first one today!
                   </p>
                   <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-sepia text-cream font-handwriting text-2xl hover:bg-sepia/90 transition-colors rounded-sm"
                   >
                     Let's go
                   </button>
              </div>
            )}

            {!loading && memory && (
                <div 
                    onClick={onClose}
                    className="mt-12 text-center font-journal text-sepia/40 cursor-pointer hover:text-rose transition-colors"
                >
                    - fold it back -
                </div>
            )}
          </div>

          <div className="absolute -bottom-10 -last-10 w-40 h-40 bg-rose/5 rounded-full blur-3xl p-10" />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
