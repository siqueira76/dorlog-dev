import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

// Simplified component for initial redirect - GitHub Pages compatible
function InitialRedirect() {
  const { currentUser, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      console.log('🔄 InitialRedirect: User status:', { 
        currentUser: !!currentUser, 
        loading,
        pathname: window.location.pathname
      });
      
      // Handle intended path from 404 redirect using history API instead of location.href
      const intendedPath = sessionStorage.getItem('dorlog_intended_path');
      if (intendedPath) {
        sessionStorage.removeItem('dorlog_intended_path');
        console.log('🔄 Restoring intended path via history:', intendedPath);
        window.history.replaceState(null, '', intendedPath);
        return;
      }
      
      // Only redirect if we're truly at root, avoid redirect loops
      const currentPath = window.location.pathname;
      const isAtRoot = currentPath === '/' || currentPath === '/dorlog/' || currentPath === '/dorlog';
      
      if (isAtRoot) {
        const targetPath = currentUser ? '/home' : '/login';
        console.log('🔄 Redirecting from root to:', targetPath);
        window.history.replaceState(null, '', targetPath);
      }
    }
  }, [currentUser, loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return null;
}

// Import pages with correct names
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Doctors from '@/pages/Doctors';
import Medications from '@/pages/Medications';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import MonthlyReportGenerator from '@/pages/MonthlyReportGenerator';
import AddDoctor from '@/pages/AddDoctor';
import AddMedication from '@/pages/AddMedication';
import Quiz from '@/pages/Quiz';
import Register from '@/pages/Register';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    console.log('🔧 App initialized:', {
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      currentUrl: window.location.href
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/" component={InitialRedirect} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            
            <Route path="/home">
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/doctors">
              <ProtectedRoute>
                <Layout>
                  <Doctors />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/doctors/add">
              <ProtectedRoute>
                <Layout>
                  <AddDoctor />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/medications">
              <ProtectedRoute>
                <Layout>
                  <Medications />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/medications/add">
              <ProtectedRoute>
                <Layout>
                  <AddMedication />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/reports">
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/reports/monthly">
              <ProtectedRoute>
                <Layout>
                  <MonthlyReportGenerator />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/profile">
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            </Route>
            
            <Route path="/quiz/:type">
              <ProtectedRoute>
                <Layout>
                  <Quiz />
                </Layout>
              </ProtectedRoute>
            </Route>

            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;