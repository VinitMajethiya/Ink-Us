import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Calendar, Sparkles, Plus, Image as ImageIcon, Check, Edit2, Sticker as StickerIcon, Loader2, RotateCcw } from 'lucide-react'
import { db, collection, doc, pb, updateDoc, onSnapshot } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import StickyNote from './StickyNote'
import SlambookPhoto from './SlambookPhoto'
import Sticker from './Sticker'
import StickerPicker from './StickerPicker'

export default function DeepDiveView({ milestone, perspective, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeLayout, setActiveLayout] = useState(milestone?.layout || 'slambook')
  const [detailedStory, setDetailedStory] = useState(milestone?.pageData?.content || '')
  const [photos, setPhotos] = useState(milestone?.pageData?.photos || [])
  const [stickyNotes, setStickyNotes] = useState(milestone?.stickyNotes || [])
  const [stickers, setStickers] = useState(milestone?.stickers || milestone?.pageData?.stickers || [])
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const isHer = perspective === 'her'
  const isAuthor = perspective === milestone?.perspective
  const partnerPerspective = milestone?.perspective === 'his' ? 'her' : 'his'

  // Sync data in real-time from PocketBase
  useEffect(() => {
    // Initial load + real-time subscription
    const fetchAndSet = async () => {
      try {
        const record = await pb.collection('milestones').getOne(milestone.id)
        setPhotos(record.pageData?.photos || [])
        setStickyNotes(record.stickyNotes || [])
        setStickers(record.stickers || record.pageData?.stickers || [])
        setDetailedStory(record.pageData?.content || '')
      } catch (e) {
        console.warn('[Supabase] DeepDive fetch failed:', e.message)
      }
    }

    if (!milestone?.id) return

    fetchAndSet()

    const unsubscribe = pb.collection('milestones').subscribe(milestone.id, (e) => {
      if (e.record) {
        setPhotos(e.record.pageData?.photos || [])
        setStickyNotes(e.record.stickyNotes || [])
        setStickers(e.record.stickers || e.record.pageData?.stickers || [])
        setDetailedStory(e.record.pageData?.content || '')
      }
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
      else if (milestone?.id) pb.collection('milestones').unsubscribe(milestone.id)
    }
  }, [milestone?.id])

  const handleSaveText = async () => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    await updateDoc(doc(db, 'milestones', milestone.id), {
      pageData: { ...current.pageData, content: detailedStory }
    })
    setIsEditing(false)
  }

  const handleAddPhoto = async () => {
    if (photos.length >= 10) {
      alert("Slam book full! (Maximum 10 photos per story)")
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        setIsUploading(true)
        try {
          const url = await uploadToCloudinary(file)
          const newPhoto = {
            id: Date.now(),
            url,
            // Place closer to center of viewport
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            rotate: Math.random() * 20 - 10,
            caption: ''
          }
          if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
          const updatedPhotos = [...(current.pageData?.photos || []), newPhoto]
          await pb.collection('milestones').update(milestone.id, {
            pageData: { ...current.pageData, photos: updatedPhotos }
          })
        } catch (err) {
          console.error(err)
          alert(`Photo upload failed: ${err.message}`)
        } finally {
          setIsUploading(false)
        }
      }
    }
    input.click()
  }

  const handleUpdatePhoto = async (updatedPhoto) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newPhotos = (current.pageData?.photos || []).map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
    await pb.collection('milestones').update(milestone.id, {
      pageData: { ...current.pageData, photos: newPhotos }
    })
  }

  const handleDeletePhoto = async (photoId) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newPhotos = (current.pageData?.photos || []).filter(p => p.id !== photoId)
    await pb.collection('milestones').update(milestone.id, {
      pageData: { ...current.pageData, photos: newPhotos }
    })
  }

  const handleAddStickyNote = async () => {
    const newNote = {
      id: Date.now(),
      text: '',
      author: perspective === 'his' ? 'Him' : 'Niyuu',
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      rotate: Math.random() * 20 - 10,
      color: ['yellow', 'blue', 'pink', 'green'][Math.floor(Math.random() * 4)]
    }
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const updatedNotes = [...(current.stickyNotes || []), newNote]
    await pb.collection('milestones').update(milestone.id, { stickyNotes: updatedNotes })
  }

  const handleUpdateNote = async (updatedNote) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newNotes = (current.stickyNotes || []).map(n => n.id === updatedNote.id ? updatedNote : n)
    await pb.collection('milestones').update(milestone.id, { stickyNotes: newNotes })
  }

  const handleDeleteNote = async (noteId) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newNotes = (current.stickyNotes || []).filter(n => n.id !== noteId)
    await pb.collection('milestones').update(milestone.id, { stickyNotes: newNotes })
  }

  const handleAddSticker = async (url) => {
    const newSticker = {
      id: Date.now(),
      url,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      rotate: Math.random() * 20 - 10
    }
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const updatedStickers = [...(current.pageData?.stickers || []), newSticker]
    if (!milestone?.id) return
    await pb.collection('milestones').update(milestone.id, { 
      pageData: { ...current.pageData, stickers: updatedStickers } 
    })
    setShowStickerPicker(false)
  }

  const handleUpdateSticker = async (updatedSticker) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newStickers = (current.pageData?.stickers || []).map(s => s.id === updatedSticker.id ? updatedSticker : s)
    if (!milestone?.id) return
    await pb.collection('milestones').update(milestone.id, { 
      pageData: { ...current.pageData, stickers: newStickers } 
    })
  }

  const handleDeleteSticker = async (stickerId) => {
    if (!milestone?.id) return
    const current = await pb.collection('milestones').getOne(milestone.id)
    const newStickers = (current.pageData?.stickers || []).filter(s => s.id !== stickerId)
    if (!milestone?.id) return
    await pb.collection('milestones').update(milestone.id, { 
      pageData: { ...current.pageData, stickers: newStickers } 
    })
  }

  if (!milestone) return null

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[150] transition-colors duration-1000 backdrop-blur-md flex items-center justify-center p-4 md:p-8 ${isHer ? 'bg-petal/80' : 'bg-sepia/80'}`}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        className="w-full max-w-[95vw] h-full max-h-[95vh] bg-[#FCFAF2] shadow-2xl relative overflow-hidden flex flex-col border-[16px] border-white"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture" />

        {/* Action Bar */}
        <div className={`absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-[200] flex flex-col md:flex-row gap-4 justify-between items-center bg-white/90 md:bg-white/60 backdrop-blur-md p-3 md:p-3 rounded-2xl md:rounded-full border shadow-sm ${isHer ? 'border-petal/10' : 'border-sepia/10'}`}>
            <div className="flex items-center gap-4 px-4 w-full md:w-auto">
                <button onClick={onClose} className={`md:hidden p-2 rounded-full ${isHer ? 'bg-petal/10 text-petal' : 'bg-sepia/10 text-sepia'}`}>
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 overflow-hidden">
                    <span className="font-stamp text-xs md:text-xl opacity-60 uppercase whitespace-nowrap">{milestone.date}</span>
                    <div className={`hidden md:block min-w-[4px] h-1 rounded-full ${isHer ? 'bg-petal/20' : 'bg-sepia/20'}`} />
                    <h2 className={`text-lg md:text-2xl font-handwriting truncate max-w-[150px] md:max-w-[200px] ${isHer ? 'text-petal' : 'text-sepia'}`}>{milestone.title}</h2>
                </div>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto px-2 md:px-0 no-scrollbar">
                <button 
                    onClick={() => setShowStickerPicker(true)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 text-white rounded-full font-handwriting text-lg md:text-xl hover:shadow-lg transition-all whitespace-nowrap ${isHer ? 'bg-petal' : 'bg-gold'}`}
                >
                    <StickerIcon className="w-4 md:w-5 h-4 md:h-5" /> Stickers
                </button>
                <button 
                    onClick={handleAddStickyNote}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 bg-rose text-white rounded-full font-handwriting text-lg md:text-xl hover:shadow-lg transition-all whitespace-nowrap"
                >
                    <Plus className="w-3 md:w-4 h-3 md:h-4" /> Note
                </button>

                <button 
                    onClick={handleAddPhoto}
                    disabled={isUploading}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 text-white rounded-full font-handwriting text-lg md:text-xl hover:shadow-lg transition-all disabled:opacity-50 whitespace-nowrap ${isHer ? 'bg-rose' : 'bg-gold'}`}
                >
                    {isUploading ? <Loader2 className="w-4 md:w-5 h-4 md:h-5 animate-spin" /> : <ImageIcon className="w-4 md:w-5 h-4 md:h-5" />}
                    {isUploading ? '...' : 'Photo'}
                </button>

                <button 
                    onClick={() => isEditing ? handleSaveText() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full font-handwriting text-lg md:text-xl transition-all whitespace-nowrap ${isEditing ? (isHer ? 'bg-petal text-white shadow-lg' : 'bg-sepia text-white shadow-lg') : (isHer ? 'bg-petal/5 text-petal hover:bg-petal/10' : 'bg-sepia/5 text-sepia hover:bg-sepia/10')}`}
                >
                    {isEditing ? <Check className="w-3 md:w-4 h-3 md:h-4" /> : <Edit2 className="w-3 md:w-4 h-3 md:h-4" />}
                </button>

                <button onClick={onClose} className={`hidden md:block p-2 rounded-full ml-2 ${isHer ? 'hover:bg-petal/5 text-petal' : 'hover:bg-sepia/5 text-sepia'}`}>
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Main SlamBook Stage */}
        <div className="flex-1 relative overflow-auto cursor-default bg-[#FCFAF2] p-12">
            {/* The Background Story (Fixed parchment area) */}
            <div className="max-w-4xl mx-auto pt-24 pb-48 relative z-10">
                 <div className={`bg-white/80 p-12 shadow-inner border-t-8 relative min-h-[600px] ${isHer ? 'border-petal/20' : 'border-gold/20'}`}>
                    <div className="lined-paper absolute inset-0 opacity-20 pointer-events-none" />
                    {isEditing ? (
                        <textarea 
                            autoFocus
                            value={detailedStory}
                            onChange={(e) => setDetailedStory(e.target.value)}
                            className={`w-full min-h-[500px] bg-transparent font-handwriting text-3xl leading-[3rem] focus:outline-none resize-none relative z-10 ${isHer ? 'text-plum' : 'text-sepia'}`}
                            placeholder="Pour your heart out here... every detail matters."
                        />
                    ) : (
                        <div className="relative z-10">
                            <h3 className={`text-4xl font-handwriting mb-8 opacity-60 ${isHer ? 'text-petal' : 'text-sepia'}`}>Dear Niyuu,</h3>
                            <p className={`font-handwriting text-3xl leading-[3.5rem] whitespace-pre-wrap selection:bg-rose/10 transition-all ${isHer ? 'text-plum/90' : 'text-sepia/90'}`}>
                                {detailedStory || "This page is waiting for your words... click 'Detailed Story' to begin our chronicle."}
                            </p>
                        </div>
                    )}
                 </div>
            </div>

            {/* Draggable Layer (Photos & Notes) */}
            <div className="absolute inset-0 pointer-events-none z-20">
                {/* Free-form Photos */}
                {photos.map(p => (
                    <div key={p.id} className="pointer-events-auto">
                        <SlambookPhoto 
                            photo={p}
                            isEditable={true}
                            onUpdate={handleUpdatePhoto}
                            onDelete={handleDeletePhoto}
                        />
                    </div>
                ))}

            {/* Free-form Notes */}
            {stickyNotes.map(n => {
                return (
                    <div key={n.id} className="pointer-events-auto">
                        <StickyNote 
                            note={n} 
                            isEditable={true} 
                            onUpdate={handleUpdateNote} 
                            onDelete={handleDeleteNote}
                            color={n.color}
                        />
                    </div>
                )
            })}

            {/* Free-form Stickers */}
            {stickers.map(s => (
                <div key={s.id} className="pointer-events-auto">
                    <Sticker 
                        sticker={s}
                        isEditable={true}
                        onUpdate={handleUpdateSticker}
                        onDelete={handleDeleteSticker}
                    />
                </div>
            ))}
            </div>
        </div>
        
        {/* SlamBook Branding */}
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 font-handwriting text-2xl pointer-events-none z-50 transition-colors ${isHer ? 'text-petal/30' : 'text-sepia/20'}`}>
             <Heart className={`w-5 h-5 ${isHer ? 'fill-petal/20' : 'fill-current'}`} />
             <span>Our Forever Slambook</span>
             <Heart className={`w-5 h-5 ${isHer ? 'fill-petal/20' : 'fill-current'}`} />
        </div>
      </motion.div>

      {/* Overlays */}
      <AnimatePresence>
        {showStickerPicker && (
            <StickerPicker 
                onSelect={handleAddSticker}
                onClose={() => setShowStickerPicker(false)}
            />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
