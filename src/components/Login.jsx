import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Heart } from 'lucide-react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Credentials as per user request
    if (password === 'love') {
      if (username === 'Him') {
        onLogin({ username: 'Him', persona: 'his' })
      } else if (username === 'Her') {
        onLogin({ username: 'Her', persona: 'her' })
      } else {
        setError('That doesn\'t seem right...')
        setTimeout(() => setError(''), 2000)
      }
    } else {
      setError('That doesn\'t seem right...')
      setTimeout(() => setError(''), 2000)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-[#F5EDD8]">
      <motion.div 
        className="w-full max-w-[400px] relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Folded Note Aesthetic */}
        <div className="bg-white p-8 md:p-12 shadow-xl border border-sepia/10 relative transform -rotate-1">
          {/* Paper Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture" />
          
          {/* Crease line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-sepia/5 pointer-events-none" />

          <h2 className="text-3xl font-handwriting mb-8 text-center text-sepia">
            A small note...
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Who are you?"
                className="w-full bg-transparent border-b border-sepia/20 py-2 font-journal text-xl focus:outline-none focus:border-rose transition-colors placeholder:text-sepia/30"
                required
              />
              <Heart className="absolute right-0 top-2 w-4 h-4 text-rose/30" />
            </div>

            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your secret word"
                className="w-full bg-transparent border-b border-sepia/20 py-2 font-journal text-xl focus:outline-none focus:border-rose transition-colors placeholder:text-sepia/30"
                required
              />
              <Lock className="absolute right-0 top-2 w-4 h-4 text-sepia/20" />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-rose font-journal text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-sepia text-cream font-handwriting text-2xl hover:bg-rose transition-colors shadow-lg"
            >
              Open the Diary
            </button>
          </form>

          {/* Decorative Stamps */}
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-rose/20 rounded-full flex items-center justify-center border-2 border-dashed border-rose/30 transform rotate-12">
            <Heart className="w-6 h-6 text-rose/40" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
