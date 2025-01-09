import React, { useState, useEffect } from 'react'
// import { GoogleAuthProvider } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { DbUser } from './models'

type AuthContextType = {
  createUser?: (email: string, password: string) => Promise<UserCredential>
  currentUser: DbUser | null
  setCurrentUser: (user: DbUser | null) => void
  loginUser?: (email: string, password: string) => Promise<UserCredential>
  logOut?: () => Promise<void>
  loading: boolean
}

export const AuthContext = React.createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [uid, setUid] = useState<string | undefined>()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async authUser => {
      setUid(authUser?.uid)

      if (authUser) {
        const { uid, displayName, photoURL } = authUser

        const ref = doc(db, 'users', uid)
        const dbUserSnap = await getDoc(ref)

        if (dbUserSnap.exists()) {
          updateDoc(ref, { photoURL, displayName })
        } else {
          await setDoc(ref, {
            uid,
            displayName,
            photoURL,
            picks: {},
            points: 0,
            gotLastAwardCorrect: true,
          })
        }
      }

      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (uid) {
      const unsub = onSnapshot(doc(db, 'users', uid), doc => {
        if (doc.exists()) {
          setCurrentUser(doc.data() as DbUser)
        }
      })

      return () => {
        unsub()
      }
    } else {
      setCurrentUser(null)
    }
  }, [uid])

  const createUser = (email: string, password: string) => {
    setLoading(true)
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const loginUser = (email: string, password: string) => {
    setLoading(true)
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logOut = () => {
    setLoading(true)
    return signOut(auth)
  }

  const authValue = {
    createUser,
    currentUser,
    setCurrentUser,
    loginUser,
    logOut,
    loading,
  }

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  )
}
