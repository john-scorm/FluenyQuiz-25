import { onAuthStateChanged, User } from 'firebase/auth'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { auth } from 'config/firebase'

const AuthContext = createContext<{
  isLoading: boolean
  user: User | null
}>({ isLoading: false, user: null })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      setUser(user)
    })
  }, [])

  const value = useMemo(() => ({ isLoading, user }), [isLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
