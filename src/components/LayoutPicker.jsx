import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function LayoutPicker({ isOpen, onClose, onSelect }) {
  const layouts = [
    { id: 'full', name: 'Full Spread', description: 'One large photo & text' },
    { id: 'polaroid', name: 'Polaroid Wall', description: 'Collection of 4 photos' },
    { id: 'letter', name: 'Letter Page', description: 'Lined paper for long stories' },
    { id: 'collage', name: 'Collage', description: 'Asymmetric mix of memories' },
    { id: 'timeline', name: 'Timeline Entry', description: 'A dated milestone' },
    { id: 'blank', name: 'Blank Canvas', description: 'Free-form creation' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-sepia/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-cream rounded-t-3xl shadow-2xl z-[90] p-8 md:p-12 max-h-[90vh] overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto">
              {/* Header with Close and optional Back */}
              <div className="flex justify-between items-start mb-12 sticky top-0 bg-cream/90 backdrop-blur-sm z-10 py-2">
                <div className="flex flex-col">
                    <h2 className="text-4xl text-sepia">New Page Layout</h2>
                    <p className="font-journal text-lg opacity-60 italic">Pick a foundation for your story...</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-4 bg-sepia/5 hover:bg-sepia/10 rounded-full transition-colors group"
                    title="Close Drawer"
                >
                  <X className="w-8 h-8 text-sepia group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {layouts.map((layout) => (
                  <motion.div
                    key={layout.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer group"
                    onClick={() => {
                        onSelect(layout.id)
                    }}
                  >
                    <div className="aspect-[3/4] bg-white border-2 border-dashed border-sepia/20 p-4 mb-4 flex flex-col items-center justify-center group-hover:border-rose/40 transition-colors relative overflow-hidden">
                        {/* Sketchy wireframe mockup */}
                        <div className="w-full h-full border border-sepia/10 rounded flex flex-col p-2 space-y-2">
                             <div className="w-1/2 h-2 bg-sepia/5 rounded" />
                             <div className="w-full h-1/2 bg-sepia/5 rounded" />
                             <div className="w-full h-4 bg-sepia/5 rounded" />
                        </div>
                    </div>
                    <h3 className="text-2xl text-center group-hover:text-rose transition-colors">{layout.name}</h3>
                    <p className="font-journal text-center opacity-60">{layout.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
