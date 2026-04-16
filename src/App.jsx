import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Splash from './components/Splash'
import Login from './components/Login'
import Diary from './components/Diary'

export default function App() {
  const [stage, setStage] = useState('splash') // splash | login | diary
  const [user, setUser] = useState(null)
  const [perspective, setPerspective] = useState('his') // 'his' | 'her'

  useEffect(() => {
    const savedUser = localStorage.getItem('ink-and-us-user')
    const savedPerspective = localStorage.getItem('ink-and-us-perspective')
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setStage('diary')
      if (savedPerspective) {
        setPerspective(savedPerspective)
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    const persona = userData.persona || 'his'
    setPerspective(persona)
    
    localStorage.setItem('ink-and-us-user', JSON.stringify(userData))
    localStorage.setItem('ink-and-us-perspective', persona)
    setStage('diary')
  }

  const handleSetPerspective = (p) => {
    setPerspective(p)
    localStorage.setItem('ink-and-us-perspective', p)
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${perspective === 'her' ? 'her-perspective' : 'his-perspective'}`}>
      <AnimatePresence mode="wait">
        {stage === 'splash' && (
          <Splash key="splash" onComplete={() => setStage('login')} />
        )}
        
        {stage === 'login' && (
          <Login key="login" onLogin={handleLogin} />
        )}
        
        {stage === 'diary' && (
          <Diary 
            key="diary" 
            user={user} 
            perspective={perspective} 
            setPerspective={handleSetPerspective} 
          />
        )}
      </AnimatePresence>

      <div id="custom-cursor" />
    </div>
  )
}
