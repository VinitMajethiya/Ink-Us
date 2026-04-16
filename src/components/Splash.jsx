import React from 'react'
import { motion } from 'framer-motion'
import { Key } from 'lucide-react'

export default function Splash({ onComplete }) {
  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-[#1A0F0A] z-50 cursor-pointer overflow-hidden"
      onClick={onComplete}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0, transition: { duration: 1 } }}
    >
      {/* Leather Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }} />

      {/* Book Cover */}
      <motion.div 
        className="relative w-[90vw] max-w-[500px] h-[70vh] bg-[#3D2517] rounded-r-3xl shadow-2xl border-l-[20px] border-[#2A180E] flex flex-col items-center justify-center p-8 text-[#D4917A]"
        initial={{ rotateY: -10, x: -50 }}
        animate={{ rotateY: 0, x: 0 }}
        transition={{ type: 'spring', stiffness: 50 }}
      >
        {/* Decorative Borders */}
        <div className="absolute inset-4 border border-[#D4917A]/20 rounded-lg pointer-events-none" />
        
        {/* Title */}
        <h1 className="text-6xl md:text-8xl mb-8 select-none">
          Dear Niyuu
        </h1>

        <div className="w-16 h-px bg-[#D4917A]/30 mb-8" />

        {/* Latch & Keyhole */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-16 h-24 bg-[#C4974E] rounded-l-lg shadow-lg flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#2A180E] flex items-center justify-center">
                <Key className="w-4 h-4 text-[#C4974E]" />
            </div>
        </div>

        <motion.p 
          className="font-journal text-xl opacity-60 absolute bottom-12"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          - touch the cover to open -
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
