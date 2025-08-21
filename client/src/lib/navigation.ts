// Utility for consistent navigation that handles GitHub Pages base path

/**
 * Detect if we're running on GitHub Pages
 */
export function isGitHubPages(): boolean {
  return !window.location.hostname.includes('replit') && 
         !window.location.hostname.includes('localhost') &&
         !window.location.hostname.includes('127.0.0.1');
}

/**
 * Get the correct base path for the current environment
 */
export function getBasePath(): string {
  return isGitHubPages() ? '/dorlog' : '';
}

/**
 * Navigate to a path considering the current environment's base path
 * Use this instead of direct window.location.href or navigate() calls
 */
export function navigateToPath(path: string): void {
  const basePath = getBasePath();
  const fullPath = `${basePath}${path}`;
  
  console.log('🧭 Navigation:', {
    requestedPath: path,
    basePath,
    fullPath,
    isGitHubPages: isGitHubPages()
  });
  
  window.location.href = fullPath;
}

/**
 * Get the full URL for a path in the current environment
 */
export function getFullPath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}

/**
 * Create a navigation helper for wouter's navigate function
 * This returns a navigate function that automatically applies base path
 */
export function createNavigate(routerNavigate: (path: string) => void) {
  return (path: string) => {
    // Com basename configurado no Router, wouter já trata o path base automaticamente
    console.log('🧭 Router Navigation:', {
      requestedPath: path,
      isGitHubPages: isGitHubPages(),
      basePath: getBasePath(),
      note: 'Router handles basename automatically'
    });
    
    routerNavigate(path);
  };
}