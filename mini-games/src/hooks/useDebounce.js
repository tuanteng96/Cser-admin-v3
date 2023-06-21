import { useEffect, useRef } from 'react'

export const useDebounce = (callback, delay) => {
  const latestCallback = useRef()
  const latestTimeout = useRef()

  useEffect(() => {
    latestCallback.current = callback
  }, [callback])

  return () => {
    if (latestTimeout.current) {
      clearTimeout(latestTimeout.current)
    }

    latestTimeout.current = setTimeout(() => {
      latestCallback.current()
    }, delay)
  }
}
