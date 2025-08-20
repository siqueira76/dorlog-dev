import { useEffect } from "react";
import { Switch, Route, Redirect, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Doctors from "@/pages/Doctors";
import AddDoctor from "@/pages/AddDoctor";
import Medications from "@/pages/Medications";
import AddMedication from "@/pages/AddMedication";
import Reports from "@/pages/Reports";
import MonthlyReportGenerator from "@/pages/MonthlyReportGenerator";
import Quiz from "@/pages/Quiz";
import NotFound from "@/pages/not-found";

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  // Handle intended path from 404 redirect
  useEffect(() => {
    const intendedPath = sessionStorage.getItem('dorlog_intended_path');
    if (intendedPath) {
      sessionStorage.removeItem('dorlog_intended_path');
      // Navigate to the intended path after auth is loaded
      if (!loading) {
        window.history.replaceState(null, '', intendedPath);
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        {currentUser ? <Redirect to="/home" /> : <Login />}
      </Route>
      <Route path="/register">
        {currentUser ? <Redirect to="/home" /> : <Register />}
      </Route>
      
      {/* Protected routes - direct component rendering */}
      <Route path="/home">
        <ProtectedRoute>
          <Layout>
            <Home />
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
      <Route path="/reports/monthly-generator">
        <ProtectedRoute>
          <Layout>
            <MonthlyReportGenerator />
          </Layout>
        </ProtectedRoute>
      </Route>
      <Route path="/quiz/:quizId">
        <ProtectedRoute>
          <Layout>
            <Quiz />
          </Layout>
        </ProtectedRoute>
      </Route>
      
      {/* Default redirect */}
      <Route path="/">
        {currentUser ? <Redirect to="/home" /> : <Redirect to="/login" />}
      </Route>
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Configure base path for GitHub Pages deployment
  const basePath = import.meta.env.PROD ? '/dorlog' : '';
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router base={basePath}>
            <Toaster />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
