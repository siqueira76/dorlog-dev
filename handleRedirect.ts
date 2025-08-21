import { getAuth, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import "./firebase";

const auth = getAuth();

// Call this function on page load when the user is redirected back to your site
export function handleRedirect() {
  getRedirectResult(auth)
    .then((result) => {
      if (result) {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        // The signed-in user info.
        const user = result.user;
        console.log("User signed in:", user?.email);
        
        // IdP data available using getAdditionalUserInfo(result)
      } else {
        console.log("No redirect result available");
      }
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Auth error:", errorCode, errorMessage);
      
      // The email of the user's account used.
      const email = error.customData?.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      
      throw error;
    });
}