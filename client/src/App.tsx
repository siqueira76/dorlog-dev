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

  // GitHub Pages API Fix
  useEffect(() => {
    // Detectar se estamos no GitHub Pages
    const isGitHubPages = !window.location.hostname.includes('replit') && 
                          !window.location.hostname.includes('localhost') &&
                          !window.location.hostname.includes('127.0.0.1');
    
    if (isGitHubPages) {
      console.log('🔧 GitHub Pages detectado - Aplicando patch para APIs');
      
      // Interceptar fetch para APIs
      const originalFetch = window.fetch;
      
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();
        
        // Interceptar generate-monthly-report
        if (url.includes('/api/generate-monthly-report') && init?.method === 'POST') {
          console.log('📊 Gerando relatório local para GitHub Pages');
          
          try {
            const body = JSON.parse(init.body as string);
            const { userId, periodsText } = body;
            
            // Gerar HTML do relatório
            const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🩺 DorLog - Relatório de Saúde</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px; text-align: center; }
        .logo { font-size: 2.5rem; margin: 0 0 10px 0; font-weight: bold; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin: 0; }
        .content { padding: 40px; }
        .demo-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; color: #856404; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.4rem; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; border-left: 4px solid #3498db; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #2c3e50; display: block; }
        .stat-label { color: #7f8c8d; font-size: 0.9rem; }
        .medication-list, .pain-list { list-style: none; padding: 0; }
        .medication-item, .pain-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c; }
        .item-name { font-weight: bold; color: #2c3e50; }
        .item-details { color: #7f8c8d; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🩺 DorLog</h1>
            <p class="subtitle">Relatório de Saúde</p>
            <p>📅 ${periodsText}</p>
            <p>👤 ${userId}</p>
        </div>
        <div class="content">
            <div class="demo-notice">
                <strong>📊 Relatório de Demonstração - GitHub Pages</strong><br>
                Este relatório foi gerado localmente com dados realistas para demonstração.
            </div>
            <div class="section">
                <h2 class="section-title">📊 Estatísticas Gerais</h2>
                <div class="stats-grid">
                    <div class="stat-card"><span class="stat-value">28</span><span class="stat-label">Dias Monitorados</span></div>
                    <div class="stat-card"><span class="stat-value">12</span><span class="stat-label">Episódios de Dor</span></div>
                    <div class="stat-card"><span class="stat-value">92%</span><span class="stat-label">Adesão Medicação</span></div>
                    <div class="stat-card"><span class="stat-value">6.2</span><span class="stat-label">Dor Média</span></div>
                </div>
            </div>
            <div class="section">
                <h2 class="section-title">💊 Medicamentos</h2>
                <ul class="medication-list">
                    <li class="medication-item"><div class="item-name">Pregabalina</div><div class="item-details">150mg - 2x ao dia (Dr. Silva)</div></li>
                    <li class="medication-item"><div class="item-name">Amitriptilina</div><div class="item-details">25mg - 1x ao dia (Dr. Silva)</div></li>
                    <li class="medication-item"><div class="item-name">Gabapentina</div><div class="item-details">300mg - 3x ao dia (Dr. Santos)</div></li>
                </ul>
            </div>
            <div class="section">
                <h2 class="section-title">📍 Pontos de Dor Mais Frequentes</h2>
                <ul class="pain-list">
                    <li class="pain-item"><div class="item-name">Região lombar</div><div class="item-details">(15 ocorrências)</div></li>
                    <li class="pain-item"><div class="item-name">Pescoço</div><div class="item-details">(12 ocorrências)</div></li>
                    <li class="pain-item"><div class="item-name">Ombros</div><div class="item-details">(10 ocorrências)</div></li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const reportUrl = URL.createObjectURL(blob);
            
            // Abrir em nova aba
            window.open(reportUrl, '_blank');
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return new Response(JSON.stringify({
              success: true,
              reportUrl: reportUrl,
              fileName: `report_local_${Date.now()}.html`,
              executionTime: 'completed',
              message: 'Relatório gerado localmente para GitHub Pages'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
            
          } catch (error) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Erro na geração local do relatório'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Para outras chamadas, usar fetch original
        return originalFetch(input, init);
      };
    }
  }, []);

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
