import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { users } from '@/data/users'
import type { User } from '@/data/users'

const AUTH_KEY = 'sosson_user'
const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

export async function login(email: string, password: string): Promise<User | null> {
  if (isFirebaseConfigured) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(cred.user)
      if (profile) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(profile))
        return profile
      }
      return null
    } catch {
      // Fallback local auth (mode démo) si Firebase échoue
    }
  }
  const user = users.find(u => u.email === email && u.password === password)
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    return user
  }
  return null
}

async function getUserProfile(fbUser: FirebaseUser): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', fbUser.uid))
    if (snap.exists()) return snap.data() as User
  } catch {
    // fallback to seed
  }
  return users.find(u => u.email === fbUser.email) ?? null
}

export async function logout(): Promise<void> {
  localStorage.removeItem(AUTH_KEY)
  if (isFirebaseConfigured) {
    try { await firebaseSignOut(auth) } catch { /* ignore */ }
  }
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured) return () => {}
  return onAuthStateChanged(auth, async fbUser => {
    if (fbUser) {
      const profile = await getUserProfile(fbUser)
      callback(profile)
    } else {
      callback(null)
    }
  })
}
