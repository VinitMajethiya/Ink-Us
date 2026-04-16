import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Sparkles, Loader2, Check } from 'lucide-react'
import { uploadToCloudinary } from '../lib/cloudinary'

const BUILTIN_STICKERS = [
  { id: 'flower_bouquet', url: '/stickers/flower_bouquet.png', label: 'Floral' },
  { id: 'red_ribbon', url: '/stickers/red_ribbon.png', label: 'Ribbon' },
  { id: 'heart_bandaid', url: '/stickers/heart_bandaid.png', label: 'Heal' },
  { id: 'memories_stamp', url: '/stickers/memories_stamp.png', label: 'Stamp' },
  { id: 'love_scrap', url: '/stickers/love_scrap.png', label: 'Love' },
  { id: 'vintage_corner', url: '/stickers/vintage_corner.png', label: 'Corner' },
]

export default function StickerPicker({ onSelect, onClose }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleCustomUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      try {
        const url = await uploadToCloudinary(file)
        onSelect(url)
      } catch (err) {
        alert("Upload failed: " + err.message)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-cream p-6 rounded-lg shadow-2xl relative z-10 w-full max-w-lg border-4 border-white"
      >
        <div className="flex justify-between items-center mb-6 border-b border-sepia/10 pb-4">
            <h3 className="text-3xl font-handwriting text-sepia flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gold" /> Sticker Library
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-sepia/5 rounded-full text-sepia">
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {BUILTIN_STICKERS.map(s => (
                <button 
                  key={s.id}
                  onClick={() => onSelect(s.url)}
                  className="group relative aspect-square bg-white rounded-lg border border-sepia/5 flex items-center justify-center p-4 hover:border-gold/30 hover:shadow-md transition-all"
                >
                    <img src={s.url} alt={s.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-journal opacity-0 group-hover:opacity-40 transition-opacity uppercase tracking-widest">{s.label}</span>
                </button>
            ))}

            {/* Custom Upload Slot */}
            <div className="relative aspect-square bg-sepia/5 rounded-lg border-2 border-dashed border-sepia/20 flex flex-col items-center justify-center p-4 group cursor-pointer hover:bg-sepia/10 transition-all overflow-hidden">
                {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-sepia/40" />
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-sepia/20 group-hover:text-sepia/40 transition-colors" />
                        <span className="text-[10px] font-journal text-center text-sepia/40 mt-2 uppercase tracking-widest">Custom Sticker</span>
                    </>
                )}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCustomUpload} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    disabled={isUploading}
                />
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="font-journal text-xs text-sepia/30 italic">Tip: You can drag, rotate, and resize stickers once they're on the page!</p>
        </div>
      </motion.div>
    </div>
  )
}
