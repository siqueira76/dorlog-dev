import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  return signOut(auth);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirect = () => {
  return getRedirectResult(auth);
};