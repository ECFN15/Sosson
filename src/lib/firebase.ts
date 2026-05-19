import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export const ENV = import.meta.env.VITE_ENV ?? 'sandbox'

export const shouldUseAuthEmulator =
  import.meta.env.VITE_AUTH_USE_EMULATOR === 'true' ||
  (import.meta.env.DEV && ENV === 'sandbox' && import.meta.env.VITE_AUTH_USE_EMULATOR !== 'false')

if (shouldUseAuthEmulator) {
  const host = import.meta.env.VITE_AUTH_EMULATOR_HOST ?? '127.0.0.1'
  const port = Number(import.meta.env.VITE_AUTH_EMULATOR_PORT ?? 9099)
  try {
    connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true })
  } catch (error) {
    if (!String(error).includes('already been called')) throw error
  }
}
