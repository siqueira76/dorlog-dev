import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply GitHub Pages patches before app initialization
const isGitHubPages = !window.location.hostname.includes('replit') && 
                      !window.location.hostname.includes('localhost') &&
                      !window.location.hostname.includes('127.0.0.1');

if (isGitHubPages) {
  console.log('🔧 GitHub Pages detected - Applying patches');
  
  // Import and apply GitHub Pages fix
  import('./patches/githubPagesFix').then(({ patchApiCalls }) => {
    patchApiCalls();
    console.log('✅ GitHub Pages API patches applied');
  }).catch(error => {
    console.warn('⚠️ Could not load GitHub Pages patches:', error);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
