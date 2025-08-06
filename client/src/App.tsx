import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Doctors from "@/pages/Doctors";
import Medications from "@/pages/Medications";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function AuthenticatedRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/doctors" component={Doctors} />
        <Route path="/medications" component={Medications} />
        <Route path="/reports" component={Reports} />
        <Route>
          <Redirect to="/home" />
        </Route>
      </Switch>
    </Layout>
  );
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();

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
      
      {/* Protected routes */}
      <Route path="/home">
        <ProtectedRoute>
          <AuthenticatedRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <AuthenticatedRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/doctors">
        <ProtectedRoute>
          <AuthenticatedRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/medications">
        <ProtectedRoute>
          <AuthenticatedRoutes />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <AuthenticatedRoutes />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
