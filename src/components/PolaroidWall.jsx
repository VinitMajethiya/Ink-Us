import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Plus, Image as ImageIcon, X, Check, Loader2, Edit3 } from 'lucide-react'
import { pb, db, collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'

export default function PolaroidWall({ perspective }) {
  const isHer = perspective === 'her'
  const [memories, setMemories] = useState([])
  const [editingSlot, setEditingSlot] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Local state for editing form
  const [editTitle, setEditTitle] = useState('')
  const [editImage, setEditImage] = useState('')

  // Always show at least 6 slots, and always at least one empty "plank" at the end
  const slotsToShow = Math.max(6, memories.length + 1)

  useEffect(() => {
    // Real-time sync from PocketBase
    const q = { collectionName: 'wall_memories', sort: 'slotIndex' }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      setMemories(data)
    })
    return () => unsubscribe()
  }, [])

  const handleEditClick = (slotIndex, existing) => {
    setEditingSlot(slotIndex)
    setEditTitle(existing?.title || '')
    setEditImage(existing?.image || '')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      try {
        const url = await uploadToCloudinary(file)
        setEditImage(url)
      } catch (err) {
        alert("Upload failed")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSave = async () => {
    if (!editImage && !editTitle) {
       setEditingSlot(null)
       return
    }

    try {
      const existing = memories.find(m => m.slotIndex === editingSlot)
      const data = {
        title: editTitle,
        image: editImage,
        slotIndex: editingSlot,
        perspective: perspective,
        rotation: (Math.random() * 10 - 5).toFixed(1)
      }

      if (existing) {
        await updateDoc(doc(db, 'wall_memories', existing.id), data)
      } else {
        await addDoc(collection(db, 'wall_memories'), data)
      }
      setEditingSlot(null)
    } catch (err) {
      console.error("Supabase Error:", err)
      alert("Failed to save memory")
    }
  }

  const handleDelete = async () => {
    const existing = memories.find(m => m.slotIndex === editingSlot)
    if (!existing) return

    try {
      await deleteDoc(doc(db, 'wall_memories', existing.id))
      setEditingSlot(null)
    } catch (err) {
      console.error("Delete Error:", err)
      alert("Failed to unpin memory")
    }
  }

  return (
    <section className={`py-24 shadow-inner relative overflow-hidden transition-colors duration-1000 ${isHer ? 'bg-[#F2E4ED]' : 'bg-[#E0D5B7]'}`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cork-board.png")' }} />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className={`text-6xl transition-colors duration-1000 ${isHer ? 'text-petal' : 'text-sepia'}`}>Memory Wall</h2>
          <div className={`font-journal text-xl transition-colors duration-1000 ${isHer ? 'text-plum/60' : 'text-sepia/60'}`}>pinned with love</div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-12">
          {Array.from({ length: slotsToShow }).map((_, idx) => {
            const mem = memories.find(m => m.slotIndex === idx)
            const isEditing = editingSlot === idx

            if (mem) {
              return (
                <motion.div
                  key={mem.id}
                  style={{ rotate: parseFloat(mem.rotation) }}
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                  className="polaroid-frame group cursor-pointer"
                  onClick={() => handleEditClick(idx, mem)}
                >
                  <PinIcon isHer={isHer} />
                  <div className="w-[140px] md:w-[200px] h-[160px] md:h-[220px] bg-sepia/5 overflow-hidden relative">
                    <img 
                        src={mem.image} 
                        alt={mem.title} 
                        className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1]" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Edit3 className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 font-handwriting text-center text-sm md:text-lg">{mem.title}</div>
                </motion.div>
              )
            }

            return (
              <RusticPlank 
                key={idx} 
                isHer={isHer} 
                onClick={() => handleEditClick(idx, null)} 
              />
            )
          })}
        </div>
      </div>

      {/* Mini Modal Overlay */}
      <AnimatePresence>
        {editingSlot !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setEditingSlot(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-cream p-8 rounded-lg shadow-2xl relative z-10 w-full max-w-md border-x-8 border-white"
            >
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture" />
                <div className="relative z-10">
                    <h3 className="text-3xl font-handwriting text-sepia mb-6">Memory Detail</h3>
                    
                    <div className="space-y-6">
                        <div className="relative aspect-video bg-sepia/5 rounded border-2 border-dashed border-sepia/20 flex items-center justify-center overflow-hidden">
                             {editImage ? (
                                <img src={editImage} className="w-full h-full object-cover" />
                             ) : (
                                <div className="text-center text-sepia/40">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                    <span className="font-journal">Tap to upload photo</span>
                                </div>
                             )}
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                             {isUploading && (
                                <div className="absolute inset-0 bg-cream/80 flex items-center justify-center">
                                    <Loader2 className="animate-spin w-8 h-8 text-sepia" />
                                </div>
                             )}
                        </div>

                        <div>
                            <label className="block font-journal text-sm opacity-60 mb-1">How should we remember this?</label>
                            <input 
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Caption..."
                                className="w-full bg-transparent border-b-2 border-sepia/20 py-2 font-handwriting text-2xl focus:outline-none focus:border-sepia transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button 
                                onClick={handleSave}
                                disabled={isUploading}
                                className="w-full bg-sepia text-cream py-3 font-handwriting text-2xl hover:bg-sepia/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Save Pin
                            </button>
                            
                            <div className="flex gap-3">
                                {memories.find(m => m.slotIndex === editingSlot) && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to unpin this memory? It will be gone forever.")) {
                                                handleDelete()
                                            }
                                        }}
                                        className="flex-1 px-6 py-3 bg-red-50 text-red-700 font-handwriting text-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                                    >
                                        <X className="w-4 h-4" /> Unpin Memory
                                    </button>
                                )}
                                <button 
                                    onClick={() => setEditingSlot(null)}
                                    className="px-6 py-3 bg-cream border border-sepia/10 text-sepia/40 font-handwriting text-xl hover:bg-sepia/5 transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

function PinIcon({ isHer }) {
  return (
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 transition-colors duration-1000 drop-shadow-sm ${isHer ? 'text-petal' : 'text-[#C4974E]'} z-20`}>
      <svg viewBox="0 0 24 24" fill="currentColor">
         <circle cx="12" cy="12" r="8" />
      </svg>
    </div>
  )
}

function RusticPlank({ isHer, onClick }) {
  return (
    <motion.div
        whileHover={{ scale: 1.05, rotate: 0 }}
        onClick={onClick}
        className="relative w-[150px] md:w-[220px] h-[200px] md:h-[280px] bg-[#3B2F23] cursor-pointer flex flex-col items-center justify-center group overflow-hidden shadow-xl border-b-4 border-black/40"
        style={{ rotate: Math.random() * 4 - 2 }}
    >
        {/* Wood Texture Mockup */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }} />
        
        {/* Grain Lines */}
        <div className="absolute inset-0 space-y-4 opacity-10 pointer-events-none p-4">
             {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="h-px bg-white w-full" style={{ opacity: Math.random() }} />
             ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 text-cream/30 group-hover:text-cream transition-colors duration-500">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 shadow-inner group-hover:bg-white/10 group-hover:scale-110 transition-all">
                <Plus className="w-12 h-12" />
            </div>
            <span className="font-handwriting text-3xl">add memory</span>
        </div>

        {/* Highlight edges */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10" />
        <div className="absolute inset-y-0 left-0 w-1 bg-white/5" />
    </motion.div>
  )
}
