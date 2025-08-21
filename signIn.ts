import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import "./firebase";

const provider = new GoogleAuthProvider();
const auth = getAuth();

// Call this function when the user clicks on the "Login" button
export function login() {
  signInWithRedirect(auth, provider);
}