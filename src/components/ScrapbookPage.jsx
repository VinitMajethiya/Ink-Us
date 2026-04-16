import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, Save, Image as ImageIcon } from 'lucide-react'

export default function ScrapbookPage({ page, onUpdate }) {
  const [content, setContent] = useState(page.content || '')
  const [title, setTitle] = useState(page.title || '')

  const layouts = {
    full: "grid-cols-1 md:grid-cols-2",
    collage: "flex flex-wrap items-center justify-center gap-8",
    letter: "max-w-2xl mx-auto"
  }

  const handleBlur = () => {
    onUpdate({ ...page, content, title })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      className="scrapbook-page min-h-[80vh] w-full"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Date Stamp */}
        <div className="mb-12 flex flex-col items-center">
            <div className="font-stamp text-xl border-2 border-sepia p-2 rotate-[-5deg] inline-block opacity-60">
                {page.date}
            </div>
            {page.isFavourite && <Heart className="text-rose fill-rose mt-2 w-5 h-5" />}
        </div>

        {/* Dynamic Layout Content */}
        <div className={`w-full ${layouts[page.layout] || ''} gap-12`}>
            {page.layout === 'full' && (
                <>
                    <div className="flex flex-col space-y-6">
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleBlur}
                            className="bg-transparent text-5xl text-sepia font-handwriting focus:outline-none focus:border-b-2 border-sepia/10 w-full"
                            placeholder="Title of this page..."
                        />
                        <div className="relative">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onBlur={handleBlur}
                                className="w-full lined-paper journal-text min-h-[300px] p-4 bg-white/40 border-none focus:outline-none resize-none"
                                placeholder="Write something here..."
                            />
                        </div>
                    </div>
                    <div className="relative pt-12 flex flex-col items-center">
                         <div className="polaroid-frame rotate-3 group">
                            {page.images?.[0] ? (
                                <img src={page.images[0]} alt="memory" className="w-[350px]" />
                            ) : (
                                <div className="w-[350px] aspect-square bg-sepia/5 flex flex-col items-center justify-center border-2 border-dashed border-sepia/10 font-journal cursor-pointer hover:bg-sepia/10 transition-colors">
                                    <ImageIcon className="w-12 h-12 mb-2 text-sepia/20" />
                                    <span>Pick a photo...</span>
                                </div>
                            )}
                            <div className="washi-tape -top-2 -left-4 rotate-[-15deg]" style={{'--tape-color': 'var(--accent)'}} />
                            <div className="w-[100%] mt-4 min-h-[40px] font-handwriting text-center text-xl bg-transparent border-none focus:outline-none">
                                {page.caption || 'Caption this moment...'}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {page.layout === 'collage' && (
                <div className="relative flex flex-wrap gap-12 justify-center py-12">
                     <div className="polaroid-frame -rotate-6 group">
                        {page.images?.[0] ? (
                            <img src={page.images[0]} className="w-[250px]" />
                        ) : (
                            <div className="w-[250px] aspect-square bg-sepia/5 flex flex-col items-center justify-center border-2 border-dashed border-sepia/10 font-journal">
                                <ImageIcon className="w-8 h-8 mb-2 text-sepia/20" />
                                <span>Add Photo</span>
                            </div>
                        )}
                        <input 
                            value={page.caption || ''} 
                            onChange={(e) => onUpdate({...page, caption: e.target.value})}
                            className="font-handwriting mt-2 text-center w-full bg-transparent border-none focus:outline-none"
                            placeholder="Snapshot caption..."
                        />
                    </div>
                    
                    <div className="polaroid-frame rotate-12 mt-8">
                         <div className="w-[200px] aspect-square bg-sepia/5 flex flex-col items-center justify-center border-2 border-dashed border-sepia/10 font-journal">
                            <Plus className="w-8 h-8 text-sepia/20" />
                         </div>
                         <div className="washi-tape -top-4 -right-4 rotate-[10deg]" style={{'--tape-color': 'var(--accent)'}} />
                    </div>

                    <div className="max-w-md bg-white/60 p-6 shadow-sm border border-sepia/10 font-journal text-lg rotate-[-2deg] min-h-[200px]">
                        <input 
                           value={title} 
                           onChange={(e) => setTitle(e.target.value)}
                           onBlur={handleBlur}
                           className="text-3xl mb-4 font-handwriting bg-transparent border-none focus:outline-none w-full"
                           placeholder="Untitled Moment"
                        />
                        <textarea 
                           value={content}
                           onChange={(e) => setContent(e.target.value)}
                           onBlur={handleBlur}
                           className="w-full bg-transparent border-none focus:outline-none resize-none lined-paper"
                           placeholder="What made this special?"
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  )
}
