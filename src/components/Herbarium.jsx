import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Scissors, Microscope, PenTool, Plus, X, Image as ImageIcon, Check, Loader2, Edit2 } from 'lucide-react'
import { pb, db, collection, query, onSnapshot, orderBy, doc, addDoc, updateDoc, deleteDoc } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'

export default function Herbarium({ perspective }) {
  const isHer = perspective === 'her'
  const [specimens, setSpecimens] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Form State
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    text: '',
    image: ''
  })

  useEffect(() => {
    // Real-time sync from PocketBase
    const q = { collectionName: 'herbarium_items', sort: 'created_at' }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      setSpecimens(data)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenEdit = (item) => {
    if (item) {
      setEditingItem(item.id)
      setForm({
        name: item.name || '',
        date: item.date || '',
        location: item.location || '',
        text: item.text || '',
        image: item.image || ''
      })
    } else {
      setEditingItem('new')
      setForm({
        name: '',
        date: '',
        location: '',
        text: '',
        image: ''
      })
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      try {
        const url = await uploadToCloudinary(file)
        setForm(prev => ({ ...prev, image: url }))
      } catch (err) {
        alert("Upload failed")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSave = async () => {
    try {
      if (editingItem === 'new') {
        await addDoc(collection(db, 'herbarium_items'), form)
      } else {
        await updateDoc(doc(db, 'herbarium_items', editingItem), form)
      }
      setEditingItem(null)
    } catch (err) {
      console.error("Supabase Error:", err)
      alert("Failed to save specimen")
    }
  }

  const handleDelete = async () => {
    if (!editingItem || editingItem === 'new') return
    
    try {
      await deleteDoc(doc(db, 'herbarium_items', editingItem))
      setEditingItem(null)
    } catch (err) {
      console.error("Delete Error:", err)
      alert("Failed to discard specimen")
    }
  }

  return (
    <section className={`py-32 relative transition-colors duration-1000 ${isHer ? 'bg-[#F9F6F2]' : 'bg-[#F2EFE9]'}`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture" />
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-24 border-b-2 border-sepia/10 pb-12">
           <div className="mb-8 md:mb-0">
              <h2 className={`text-5xl md:text-7xl mb-4 transition-colors duration-1000 ${isHer ? 'text-petal' : 'text-sepia'}`}>Little Things</h2>
              <p className="font-journal text-xl md:text-2xl text-sepia/60 italic">Handcrafted tokens and treasures we've made for each other.</p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => handleOpenEdit(null)}
                className="flex items-center gap-2 px-6 py-3 bg-sepia text-cream font-handwriting text-2xl hover:bg-sepia/90 transition-all rounded-sm shadow-lg hover:-translate-y-1"
              >
                <Plus className="w-6 h-6" /> Press New Moment
              </button>
           </div>
        </div>

        <div className="space-y-24">
          {specimens.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center group`}
            >
              {/* Specimen Tag */}
              <div className="relative w-full max-w-sm">
                  <motion.div 
                    className="bg-cream p-12 shadow-xl relative border-[1px] border-sepia/5 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleOpenEdit(item)}
                  >
                      {/* String eyelet */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cream rounded-full border border-sepia/10 flex items-center justify-center">
                          <div className="w-3 h-3 bg-sepia/20 rounded-full shadow-inner" />
                      </div>

                      {/* Photo Specimen */}
                      <div className="aspect-[3/4] mb-8 border border-sepia/5 relative overflow-hidden flex items-center justify-center bg-white/50 group-hover:bg-white transition-colors">
                           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />
                           {item.image ? (
                               <img src={item.image} className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" alt={item.name} />
                           ) : (
                               <SpecimenVisual id={idx % 3 + 1} isHer={isHer} />
                           )}
                           <div className="absolute inset-0 bg-sepia/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <Edit2 className="text-cream w-12 h-12" />
                           </div>
                      </div>

                      <div className="font-journal text-[10px] uppercase tracking-[0.3em] text-sepia/30 mb-2 border-b border-sepia/5 pb-2">
                        Collectio Particula № {String(idx + 1).padStart(3, '0')}
                      </div>
                      <div className="font-serif italic text-2xl text-sepia/80 mb-1">{item.name}</div>
                      <div className="font-journal text-sm text-sepia/40">{item.date} — {item.location}</div>
                  </motion.div>
              </div>

              {/* Journal Entry Description */}
              <div className="flex-1 max-w-lg">
                  <div className="relative">
                      <div className="absolute -left-10 top-0 text-sepia/5 font-serif text-9xl select-none">“</div>
                      <p className="font-journal text-2xl leading-relaxed text-sepia/70 relative z-10 pt-8 pl-4 min-h-[100px]">
                         {item.text}
                      </p>
                      <div className="mt-8 flex items-center gap-4 text-sepia/30">
                         <div className="h-px flex-1 bg-sepia/10" />
                         <PenTool className="w-5 h-5 cursor-pointer hover:text-sepia/60 transition-colors" onClick={() => handleOpenEdit(item)} />
                         <div className="h-px w-8 bg-sepia/10" />
                      </div>
                  </div>
              </div>
            </motion.div>
          ))}
          
          {specimens.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-sepia/10 rounded-lg">
                 <p className="font-journal text-2xl text-sepia/40 italic mb-8">No specimens collected yet.</p>
                 <button 
                  onClick={() => handleOpenEdit(null)}
                  className="px-10 py-4 bg-sepia text-cream font-handwriting text-3xl hover:bg-sepia/90 transition-all shadow-xl"
                 >
                   Press Our First Memory
                 </button>
            </div>
          )}
        </div>

        {specimens.length > 0 && (
          <div className="mt-32 text-center">
              <button 
                onClick={() => handleOpenEdit(null)}
                className="inline-block p-12 border-2 border-dashed border-sepia/10 text-sepia/30 font-journal italic hover:text-sepia/60 hover:bg-sepia/5 transition-all text-2xl"
              >
                  + Add another small treasure to our logbook +
              </button>
          </div>
        )}
      </div>

      {/* Editing Modal */}
      <AnimatePresence>
        {editingItem !== null && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setEditingItem(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
               className="bg-cream p-10 rounded-sm shadow-2xl relative z-10 w-full max-w-2xl border-x-8 border-sepia/5"
            >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-paper-texture" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="relative aspect-[3/4] bg-sepia/5 border-2 border-dashed border-sepia/10 flex items-center justify-center overflow-hidden group">
                           {form.image ? (
                               <img src={form.image} className="w-full h-full object-cover" />
                           ) : (
                               <div className="text-center text-sepia/40">
                                   <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                   <span className="font-journal">Add Specimen Photo</span>
                               </div>
                           )}
                           <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                           {isUploading && (
                               <div className="absolute inset-0 bg-cream/80 flex items-center justify-center"><Loader2 className="animate-spin text-sepia w-8 h-8" /></div>
                           )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-4xl font-handwriting text-sepia">Log Entry</h3>
                        
                        <input 
                            type="text" placeholder="Title (e.g., A Dried Rose)" value={form.name}
                            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-transparent border-b border-sepia/20 py-2 font-serif italic text-2xl focus:outline-none focus:border-sepia"
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="text" placeholder="Date" value={form.date}
                                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-transparent border-b border-sepia/20 py-2 font-journal text-sm focus:outline-none focus:border-sepia"
                            />
                            <input 
                                type="text" placeholder="Location" value={form.location}
                                onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full bg-transparent border-b border-sepia/20 py-2 font-journal text-sm focus:outline-none focus:border-sepia"
                            />
                        </div>

                        <textarea 
                            rows={4} placeholder="The story behind this little thing..." value={form.text}
                            onChange={(e) => setForm(prev => ({ ...prev, text: e.target.value }))}
                            className="w-full bg-sepia/5 border-l-2 border-sepia/20 p-4 font-journal text-lg focus:outline-none focus:border-sepia/40 resize-none"
                        />

                        <div className="flex flex-col gap-4 pt-6">
                           <button onClick={handleSave} className="w-full bg-sepia text-cream py-4 font-handwriting text-3xl hover:bg-sepia/90 transition-all flex items-center justify-center gap-2 shadow-lg">
                               <Check className="w-6 h-6" /> Save Entry
                           </button>
                           
                           <div className="flex gap-4">
                               {editingItem !== 'new' && (
                                   <button 
                                        onClick={() => {
                                            if (window.confirm("Do you really want to discard this little treasure?")) {
                                                handleDelete()
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-red-50 text-red-700 font-handwriting text-2xl hover:bg-red-100 transition-colors border border-red-200"
                                   >
                                        Discard
                                   </button>
                               )}
                               <button 
                                    onClick={() => setEditingItem(null)} 
                                    className="px-4 py-3 text-sepia/40 hover:text-sepia transition-colors font-handwriting text-2xl flex-1 border border-sepia/5"
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

function SpecimenVisual({ id, isHer }) {
    if (id === 1) return (
        <svg viewBox="0 0 100 150" className={`w-3/4 h-3/4 ${isHer ? 'text-petal' : 'text-sage'} opacity-60`}>
             <path d="M50 140 C50 100 30 80 50 20" stroke="currentColor" fill="none" strokeWidth="1.5" />
             <path d="M50 80 Q80 70 60 40 Q40 50 50 80" fill="currentColor" opacity="0.3" />
             <path d="M50 100 Q20 90 40 60 Q60 70 50 100" fill="currentColor" opacity="0.3" />
        </svg>
    )
    if (id === 2) return (
        <svg viewBox="0 0 100 150" className={`w-3/4 h-3/4 ${isHer ? 'text-plum' : 'text-gold'} opacity-60`}>
             <path d="M50 140 L50 40" stroke="currentColor" fill="none" strokeWidth="1" strokeDasharray="4 2" />
             <rect x="30" y="50" width="40" height="60" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="0.5" />
             <circle cx="50" cy="80" r="15" fill="currentColor" opacity="0.2" />
        </svg>
    )
    return (
        <svg viewBox="0 0 100 150" className={`w-3/4 h-3/4 ${isHer ? 'text-rose' : 'text-sepia'} opacity-60`}>
             <path d="M50 140 Q60 100 50 60 T50 10" stroke="currentColor" fill="none" strokeWidth="1" />
             <ellipse cx="50" cy="35" rx="20" ry="25" fill="currentColor" opacity="0.2" />
             <path d="M50 60 L70 80" stroke="currentColor" strokeWidth="0.5" />
             <path d="M50 90 L30 110" stroke="currentColor" strokeWidth="0.5" />
        </svg>
    )
}
