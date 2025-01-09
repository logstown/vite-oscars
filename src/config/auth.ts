import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth'

export const doCreateUserWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const doSignInWithEmailAndPassword = (
  email: string,
  password: string,
) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  // add user to firestore
}

export const doSignOut = () => {
  return auth.signOut()
}

export const doPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email)
}

export const doPasswordChange = (user: User, password: string) => {
  return updatePassword(user, password)
}

export const doSendEmailVerification = (user: User) => {
  return sendEmailVerification(user, {
    url: `${window.location.origin}/home`,
  })
}
