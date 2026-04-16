import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'

export default function SlambookPhoto({ photo, isEditable, onUpdate, onDelete }) {
  const [isEnlarged, setIsEnlarged] = useState(false)

  // Handle drag end to update coordinates
  const handleDragEnd = (event, info) => {
    onUpdate({ 
      ...photo, 
      x: (photo.x || 0) + info.offset.x, 
      y: (photo.y || 0) + info.offset.y 
    })
  }

  return (
    <motion.div
      drag={isEditable && !isEnlarged}
      dragMomentum={false}
      animate={{
        x: photo.x || 0,
        y: photo.y || 0,
        rotate: isEnlarged ? 0 : (photo.rotate || 0),
        scale: isEnlarged ? 1.4 : 1,
        zIndex: isEnlarged ? 100 : 20,
      }}
      onDragEnd={handleDragEnd}
      className={`absolute group transition-shadow ${isEnlarged ? 'cursor-default' : 'cursor-move'}`}
    >
      <div className={`polaroid-frame p-3 bg-white shadow-2xl relative transition-transform ${!isEnlarged && 'hover:scale-[1.02]'} ${isEnlarged ? 'w-96' : 'w-64'}`}>
        {/* Photo Container */}
        <div className={`overflow-hidden bg-sepia/5 relative flex items-center justify-center ${isEnlarged ? 'h-96' : 'h-64'}`}>
          <img 
            src={photo.url} 
            alt="memory" 
            className={`transition-all duration-300 ${isEnlarged ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}`}
          />
        </div>
        
        {/* Caption Area */}
        <div className={`mt-4 font-handwriting ${isEnlarged ? 'text-2xl' : 'text-xl'} text-center text-sepia/80 min-h-[30px]`}>
          {photo.caption || ''}
        </div>

        {/* Action Buttons */}
        {isEditable && (
          <div className="absolute -top-2 -right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(photo.id)
              }}
              className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Delete"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onUpdate({ ...photo, rotate: (photo.rotate || 0) + 15 })
              }}
              className="p-1.5 bg-gold text-white rounded-full shadow-lg hover:rotate-45 transition-transform"
              title="Rotate"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setIsEnlarged(!isEnlarged)
              }}
              className={`p-1.5 ${isEnlarged ? 'bg-sepia' : 'bg-rose'} text-white rounded-full shadow-lg hover:scale-110 transition-transform`}
              title={isEnlarged ? "Minimize" : "See Full Image"}
            >
              {isEnlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Washi Tape (Visual enhancement) */}
        {!isEnlarged && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-5 bg-rose/30 rotate-[5deg] backdrop-blur-[1px] opacity-60" />
        )}
      </div>
    </motion.div>
  )
}
