import { useEffect, useRef, useState } from 'react'

const useUserData = <T extends {}>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue)

  const defaultValueRef = useRef(defaultValue)
  defaultValueRef.current = defaultValue

  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    try {
      const fromLS = localStorage.getItem(key)
      if (!fromLS) {
        setState(defaultValueRef.current)
        return
      }
      try {
        const value = JSON.parse(fromLS)
        setState(value)
      } catch (err) {
        setState(defaultValueRef.current)
      }
    } catch (err) {}
  }, [key])

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(state))
    } catch (err) {}
  }, [state])

  return [state, setState] as const
}

export default useUserData
