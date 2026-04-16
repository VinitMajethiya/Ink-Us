import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

export default function StickyNote({ note, isEditable, onUpdate, onDelete, color }) {
  const [isEditing, setIsEditing] = useState(!note.text && isEditable)
  const [text, setText] = useState(note.text || '')

  const colors = {
    yellow: 'bg-[#FEF3C7] border-[#FCD34D]',
    blue: 'bg-[#DBEAFE] border-[#93C5FD]',
    pink: 'bg-[#FCE7F3] border-[#F9A8D4]',
    green: 'bg-[#DCFCE7] border-[#86EFAC]'
  }

  const handleBlur = () => {
    if (isEditable) {
      onUpdate({ ...note, text })
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      drag={!isEditing}
      dragMomentum={false}
      initial={{ x: note.x || 0, y: note.y || 0, rotate: note.rotate || 0 }}
      onDragEnd={(event, info) => {
        onUpdate({ ...note, x: note.x + info.offset.x, y: note.y + info.offset.y })
      }}
      className={`absolute w-48 p-4 shadow-xl border-t-4 cursor-move z-30 font-handwriting text-lg leading-tight ${colors[color || 'yellow']}`}
      style={{ left: 0, top: 0 }}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent border-none focus:outline-none resize-none min-h-[100px]"
            placeholder="Write a note..."
          />
          <div className="flex justify-end gap-2">
            <button onClick={handleBlur} className="p-1 hover:bg-black/5 rounded">
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => isEditable && setIsEditing(true)}>
          <p className="whitespace-pre-wrap">{text}</p>
          <div className="mt-4 flex justify-between items-center opacity-40 text-xs italic">
            <span>- {note.author}</span>
            {isEditable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/40 rotate-[-2deg] backdrop-blur-sm shadow-sm" />
    </motion.div>
  )
}
