import React, { createContext, useContext, useState, useEffect } from 'react'
import useQuery from 'src/hooks/useQuery'

const SplashScreenContext = createContext()

export function SplashScreenProvider({ children }) {
  const [count, setCount] = useState(0)
  let visible = count > 0

  useEffect(() => {
    const splashScreen = document.getElementById('splash-screen')

    // Show SplashScreen
    if (splashScreen && visible) {
      splashScreen.classList.remove('hidden')

      return () => {
        splashScreen.classList.add('hidden')
      }
    }

    // Hide SplashScreen
    let timeout
    if (splashScreen && !visible) {
      timeout = setTimeout(() => {
        splashScreen.classList.add('hidden')
      }, 3000)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [visible])

  return (
    <SplashScreenContext.Provider value={setCount}>
      {children}
    </SplashScreenContext.Provider>
  )
}

export const TypeScreenContext = createContext()

export function TypeScreenProvider({ children }) {
  const query = useQuery()

  return (
    <TypeScreenContext.Provider value={query}>
      {children}
    </TypeScreenContext.Provider>
  )
}

export function LayoutSplashScreen({ visible = true }) {
  // Everything are ready - remove splashscreen
  const setCount = useContext(SplashScreenContext)

  useEffect(() => {
    if (!visible) {
      return
    }

    setCount(prev => {
      return prev + 1
    })

    return () => {
      setCount(prev => {
        return prev - 1
      })
    }
  }, [setCount, visible])

  return null
}
