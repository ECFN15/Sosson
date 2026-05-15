import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function waitForFirebaseUser(timeoutMs = 1500): Promise<FirebaseUser | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise(resolve => {
    let unsubscribe = () => {}
    const timeout = window.setTimeout(() => {
      unsubscribe()
      resolve(auth.currentUser)
    }, timeoutMs)

    unsubscribe = onAuthStateChanged(auth, user => {
      window.clearTimeout(timeout)
      unsubscribe()
      resolve(user)
    })
  })
}
