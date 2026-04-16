import React from 'react'
import { motion } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'

export default function Sticker({ sticker, isEditable, onUpdate, onDelete }) {
  // Handle drag end to update coordinates
  const handleDragEnd = (event, info) => {
    onUpdate({ 
      ...sticker, 
      x: (sticker.x || 0) + info.offset.x, 
      y: (sticker.y || 0) + info.offset.y 
    })
  }

  return (
    <motion.div
      drag={isEditable}
      dragMomentum={false}
      animate={{
        x: sticker.x || 0,
        y: sticker.y || 0,
        rotate: sticker.rotate || 0,
        scale: 1,
        zIndex: 40,
      }}
      onDragEnd={handleDragEnd}
      className={`absolute group transition-shadow ${isEditable ? 'cursor-move' : 'cursor-default'}`}
    >
      <div className="relative group/sticker">
        {/* Sticker Image */}
        <img 
          src={sticker.url} 
          alt="sticker" 
          className="w-32 md:w-40 h-auto drop-shadow-md hover:drop-shadow-xl transition-all"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        />
        
        {/* Action Buttons */}
        {isEditable && (
          <div className="absolute -top-4 -right-4 flex gap-1 opacity-0 group-hover/sticker:opacity-100 transition-opacity z-50">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onUpdate({ ...sticker, rotate: (sticker.rotate || 0) + 15 })
              }}
              className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-full text-sepia hover:bg-white transition-all border border-sepia/10"
              title="Rotate"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(sticker.id)
              }}
              className="p-1.5 bg-red-500/90 backdrop-blur shadow-sm rounded-full text-white hover:bg-red-500 transition-all"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
