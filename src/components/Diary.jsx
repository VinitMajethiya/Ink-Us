import React, { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { PenTool, Moon, Sun, Plus, Sparkles } from 'lucide-react'
import ScrapbookPage from './ScrapbookPage'
import Timeline from './Timeline'
import PolaroidWall from './PolaroidWall'
import Herbarium from './Herbarium'
import LayoutPicker from './LayoutPicker'
import RandomMemory from './RandomMemory'
import { pb, db, collection, addDoc, onSnapshot, query, orderBy } from '../lib/supabase'


export default function Diary({ user, perspective, setPerspective }) {
  const [showRandom, setShowRandom] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    document.body.classList.remove('his-perspective', 'her-perspective')
    document.body.classList.add(`${perspective}-perspective`)
    return () => document.body.classList.remove('his-perspective', 'her-perspective')
  }, [perspective])

  return (
    <div className={`relative ${perspective}-perspective min-h-screen transition-colors duration-1000`}>
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-[var(--accent)] z-[60] origin-left shadow-sm"
        style={{ scaleX }}
      />

      {/* Persistence Toggle (Washi Tape Style) */}
      <div className="fixed top-4 md:top-8 right-4 md:right-8 left-4 md:left-auto flex justify-center md:justify-end z-50">
        <div className="relative flex items-center gap-0 scale-75 md:scale-100">
            <button 
              onClick={() => setPerspective('his')}
              className={`relative px-6 md:px-8 py-2 md:py-3 font-handwriting text-xl md:text-2xl transition-all z-20 ${perspective === 'his' ? 'text-cream -rotate-3 translate-x-1' : 'text-sepia/30 hover:text-sepia/50'}`}
            >
              <div className={`absolute inset-0 bg-sepia shadow-md transform -skew-x-12 transition-opacity ${perspective === 'his' ? 'opacity-100' : 'opacity-0'}`} />
              <span className="relative z-10">His Side</span>
            </button>
            <button 
              onClick={() => setPerspective('her')}
              className={`relative px-6 md:px-8 py-2 md:py-3 font-handwriting text-xl md:text-2xl transition-all z-10 -ml-4 ${perspective === 'her' ? 'text-cream rotate-2 -translate-x-1' : 'text-petal/30 hover:text-petal/60'}`}
            >
              <div className={`absolute inset-0 bg-petal shadow-md transform skew-x-12 transition-opacity ${perspective === 'her' ? 'opacity-100' : 'opacity-0'}`} />
              <span className="relative z-10">Her Side</span>
            </button>
        </div>
      </div>

      <main className="w-full flex flex-col pt-12">
        {/* The Story of Us Timeline */}
        <Timeline perspective={perspective} />

        {/* Polaroid Memory Wall */}
        <PolaroidWall perspective={perspective} />

        {/* Herbarium Section */}
        <Herbarium perspective={perspective} />
      </main>

      {/* Random Memory Note */}
      <div 
        onClick={() => setShowRandom(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-cream/90 shadow-lg border border-gold/20 rounded-t-lg font-journal cursor-pointer hover:bg-white transition-colors z-[65]"
      >
        <Sparkles className="inline-block w-4 h-4 mr-2 text-gold" />
        take me somewhere
      </div>
      
      {showRandom && <RandomMemory onClose={() => setShowRandom(false)} />}
    </div>
  )
}
