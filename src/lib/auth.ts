import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, ENV } from '@/lib/firebase'
import { users } from '@/data/users'
import type { User } from '@/data/users'
import { fetchCurrentSqlUserProfile } from '@/features/auth/sqlUserProfile'

const AUTH_KEY = 'sosson_user'
export const isFirebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)
export const isLocalAuthFallbackEnabled =
  import.meta.env.DEV &&
  ENV !== 'production' &&
  import.meta.env.VITE_ENABLE_LOCAL_AUTH_FALLBACK === 'true'

function persistUser(profile: User) {
  const safeProfile = { ...profile, password: undefined }
  localStorage.setItem(AUTH_KEY, JSON.stringify(safeProfile))
  return safeProfile
}

export async function login(email: string, password: string): Promise<User | null> {
  if (isFirebaseConfigured) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(cred.user)
      if (profile) {
        return persistUser(profile)
      }
      return null
    } catch (error) {
      console.info('Connexion Firebase refusee.', error)
      if (!isLocalAuthFallbackEnabled) return null
    }
  }

  if (!isLocalAuthFallbackEnabled && isFirebaseConfigured) return null

  const user = users.find(u => u.email === email && u.password === password)
  if (user) {
    return persistUser(user)
  }
  return null
}

async function getUserProfile(fbUser: FirebaseUser): Promise<User | null> {
  try {
    const sqlProfile = await fetchCurrentSqlUserProfile()
    if (sqlProfile) return sqlProfile
  } catch (error) {
    console.info('Profil SQL Connect indisponible, fallback transitoire Firestore/dev.', error)
  }

  try {
    const snap = await getDoc(doc(db, 'users', fbUser.uid))
    if (snap.exists()) return snap.data() as User
  } catch {
    // Le profil Firestore est transitoire, mais l'auth seedee reste opt-in.
  }

  if (!isLocalAuthFallbackEnabled) return null
  return users.find(u => u.email === fbUser.email) ?? null
}

export async function logout(): Promise<void> {
  localStorage.removeItem(AUTH_KEY)
  if (isFirebaseConfigured) {
    try { await firebaseSignOut(auth) } catch { /* ignore */ }
  }
}

export function getCurrentUser(): User | null {
  if (isFirebaseConfigured && !isLocalAuthFallbackEnabled) return null

  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem(AUTH_KEY)
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
      if (profile) persistUser(profile)
      else localStorage.removeItem(AUTH_KEY)
      callback(profile)
    } else {
      localStorage.removeItem(AUTH_KEY)
      callback(null)
    }
  })
}
