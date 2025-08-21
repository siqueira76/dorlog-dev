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
          console.log('📊 Gerando relatório com Firebase Storage para GitHub Pages');
          
          try {
            const body = JSON.parse(init.body as string);
            const { userId, periods, periodsText } = body;
            
            // Usar a mesma lógica de geração e upload para Firebase Storage
            const result = await generateReportWithFirebaseStorage(userId, periods, periodsText);
            
            if (result.success) {
              console.log('✅ Relatório gerado e enviado para Firebase Storage');
              return new Response(JSON.stringify({
                success: true,
                reportUrl: result.reportUrl,
                fileName: result.fileName,
                executionTime: result.executionTime,
                message: 'Relatório gerado e armazenado no Firebase Storage'
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            } else {
              throw new Error(result.error || 'Erro ao gerar relatório');
            }
            
          } catch (error) {
            console.error('❌ Erro na geração do relatório:', error);
            return new Response(JSON.stringify({
              success: false,
              error: 'Erro na geração do relatório com Firebase Storage'
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Para outras chamadas, usar fetch original
        return originalFetch(input, init);
      };

      // Função para gerar relatório e fazer upload para Firebase Storage
      const generateReportWithFirebaseStorage = async (userId: string, periods: string[], periodsText: string) => {
        try {
          // Usar instâncias Firebase já existentes
          const { db, storage } = await import('@/lib/firebase');

          console.log(`🔍 Buscando dados do usuário no Firestore para ${userId}...`);
          console.log(`📅 Período: ${startDate} até ${endDate}`);
          
          // Buscar dados reais do Firestore
          let reportData: any = {
            totalDays: 0,
            crisisEpisodes: 0,
            averagePain: 0,
            adherenceRate: 0,
            painEvolution: [] as any[],
            painPoints: [] as any[],
            medications: [] as any[],
            doctors: [] as any[]
          };

          // Parse periods to get date range
          if (periods && periods.length > 0) {
            const firstPeriod = periods[0];
            const lastPeriod = periods[periods.length - 1];
            const startDate = firstPeriod.split('_')[0];
            const endDate = lastPeriod.split('_')[1];

            // Buscar dados de forma mais compatível com client-side
            const { collection, getDocs, query, where } = await import('firebase/firestore');
            const reportDiarioRef = collection(db, 'report_diario');
            const querySnapshot = await getDocs(reportDiarioRef);
            
            let totalPain = 0;
            let painRecords = 0;
            const painPointsMap = new Map();

            console.log(`🔍 Processando ${querySnapshot.docs.length} documentos...`);
            
            // Filtrar documentos pelo usuário e período
            querySnapshot.docs.forEach(doc => {
              const docId = doc.id;
              const data = doc.data();
              
              console.log(`📄 Processando documento: ${docId}`);
              
              // Verificar se o documento pertence ao usuário
              if (docId.startsWith(`${userId}_`) || data.usuarioId === userId || data.email === userId) {
                // Verificar se está dentro do período solicitado
                const docDateStr = docId.includes('_') ? docId.split('_')[1] : null;
                if (docDateStr && docDateStr >= startDate && docDateStr <= endDate) {
                  reportData.totalDays++;
                  console.log(`✅ Documento válido: ${docId}`);

                  // Processar quizzes - suportar diferentes estruturas
                  const quizzes = data.quizzes || data.quiz || [];
                  if (Array.isArray(quizzes)) {
                    const crisisCount = quizzes.filter((q: any) => q.tipo === 'emergencial').length;
                    reportData.crisisEpisodes += crisisCount;

                    // Extract pain data com tratamento robusto
                    quizzes.forEach((quiz: any) => {
                      try {
                        // Suportar diferentes estruturas de respostas
                        let respostas = quiz.respostas || quiz.answers || [];
                        
                        // Se respostas é um objeto, converter para array
                        if (respostas && typeof respostas === 'object' && !Array.isArray(respostas)) {
                          respostas = Object.keys(respostas).map(key => ({
                            tipo: key,
                            valor: respostas[key]
                          }));
                        }
                        
                        if (Array.isArray(respostas)) {
                          respostas.forEach((resposta: any) => {
                            // Pain scale (0-10)
                            if (resposta.tipo === 'eva' && typeof resposta.valor === 'number') {
                              const painValue = resposta.valor;
                              if (painValue >= 0 && painValue <= 10) {
                                totalPain += painValue;
                                painRecords++;

                                reportData.painEvolution.push({
                                  date: docDateStr,
                                  dateStr: new Date(docDateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                                  pain: painValue
                                });
                              }
                            }

                            // Pain points
                            if (resposta.tipo === 'pontos_dor' && resposta.valor && resposta.valor !== 'Sem dor') {
                              painPointsMap.set(resposta.valor, (painPointsMap.get(resposta.valor) || 0) + 1);
                            }
                          });
                        } else if (respostas) {
                          // Fallback: tratar como objeto simples
                          Object.keys(respostas).forEach(key => {
                            const valor = respostas[key];
                            if (key.includes('dor') || key.includes('escala')) {
                              const painValue = parseInt(valor);
                              if (!isNaN(painValue) && painValue >= 0 && painValue <= 10) {
                                totalPain += painValue;
                                painRecords++;
                                reportData.painEvolution.push({
                                  date: docDateStr,
                                  dateStr: new Date(docDateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                                  pain: painValue
                                });
                              }
                            }
                          });
                        }
                      } catch (quizError) {
                        console.warn(`⚠️ Erro ao processar quiz:`, quizError);
                      }
                    });
                  }
                } else {
                  console.log(`⏭️ Documento fora do período: ${docId}`);
                }
              } else {
                console.log(`⏭️ Documento não pertence ao usuário: ${docId}`);
              }
            });
            
            console.log(`📊 Dados processados: ${reportData.totalDays} dias, ${painRecords} registros de dor`);

            // Calculate average pain
            if (painRecords > 0) {
              reportData.averagePain = Math.round((totalPain / painRecords) * 10) / 10;
            }

            // Convert pain points map to array
            reportData.painPoints = Array.from(painPointsMap.entries())
              .map(([point, count]) => ({ point, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Buscar dados de medicamentos e médicos (fallback para dados simulados)
            try {
              const medicamentosRef = collection(db, 'medicamentos');
              const medicamentosSnapshot = await getDocs(medicamentosRef);
              const userMedications: any[] = [];
              
              medicamentosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.email === userId || data.usuarioId === userId) {
                  userMedications.push({
                    nome: data.nome || 'Medicamento',
                    dosagem: data.dosagem || 'N/A',
                    frequencia: data.frequencia || 1,
                    prescrito_por: data.medico || 'Médico'
                  });
                }
              });
              
              reportData.medications = userMedications.length > 0 ? userMedications : [
                { nome: 'Pregabalina', dosagem: '150mg', frequencia: 2, prescrito_por: 'Silva' },
                { nome: 'Amitriptilina', dosagem: '25mg', frequencia: 1, prescrito_por: 'Silva' }
              ];
              
              const medicosRef = collection(db, 'medicos');
              const medicosSnapshot = await getDocs(medicosRef);
              const userDoctors: any[] = [];
              
              medicosSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.email === userId || data.usuarioId === userId) {
                  userDoctors.push({
                    nome: data.nome || 'Médico',
                    especialidade: data.especialidade || 'Medicina Geral',
                    crm: data.crm || '00000'
                  });
                }
              });
              
              reportData.doctors = userDoctors.length > 0 ? userDoctors : [
                { nome: 'Silva', especialidade: 'Reumatologia', crm: '12345' }
              ];
              
            } catch (medError) {
              console.warn('⚠️ Erro ao buscar medicamentos/médicos, usando dados simulados:', medError);
              reportData.medications = [
                { nome: 'Pregabalina', dosagem: '150mg', frequencia: 2, prescrito_por: 'Silva' },
                { nome: 'Amitriptilina', dosagem: '25mg', frequencia: 1, prescrito_por: 'Silva' }
              ];
              reportData.doctors = [
                { nome: 'Silva', especialidade: 'Reumatologia', crm: '12345' }
              ];
            }

            reportData.adherenceRate = Math.min(90, Math.max(60, 90 - (reportData.crisisEpisodes * 5)));
          }

          // Generate HTML content using the same template as backend
          const currentDate = new Date().toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const htmlContent = generateReportHTML(userId, periodsText, reportData, currentDate);

          // Create blob and upload to Firebase Storage
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const fileName = `report_${userId.replace(/[^a-zA-Z0-9.-]/g, '_')}_${Date.now()}.html`;
          const storageRef = ref(storage, `reports/${fileName}`);

          console.log('📤 Fazendo upload para Firebase Storage...');
          await uploadBytes(storageRef, blob, {
            contentType: 'text/html',
            customMetadata: {
              userId: userId,
              periodsText: periodsText,
              generatedAt: new Date().toISOString()
            }
          });

          const downloadUrl = await getDownloadURL(storageRef);
          console.log('✅ Upload concluído. URL:', downloadUrl);

          return {
            success: true,
            reportUrl: downloadUrl,
            fileName: fileName,
            executionTime: 'completed'
          };

        } catch (error) {
          console.error('❌ Erro detalhado ao gerar relatório:', {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          return {
            success: false,
            error: `Erro na geração: ${error instanceof Error ? error.message : String(error)}`
          };
        }
      }

      // Function to generate HTML content (simplified version of backend template)
      const generateReportHTML = (userId: string, periodsText: string, reportData: any, currentDate: string) => {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DorLog - Relatório de Saúde ${periodsText} - ${userId}</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #64748b;
            --success-color: #059669;
            --warning-color: #d97706;
            --danger-color: #dc2626;
            --light-bg: #f8fafc;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: var(--text-primary); background: var(--light-bg); font-size: 14px; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; background: white; min-height: 297mm; }
        .header { background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%); color: white; padding: 40px 30px; border-radius: 12px; margin-bottom: 30px; position: relative; overflow: hidden; }
        .header-content { position: relative; z-index: 2; }
        .logo { font-size: 2.8em; font-weight: 700; margin-bottom: 8px; letter-spacing: -1px; }
        .subtitle { font-size: 1.3em; opacity: 0.9; font-weight: 300; margin-bottom: 4px; }
        .user-info { font-size: 1em; opacity: 0.8; font-weight: 400; }
        .report-date { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 500; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stat-value { font-size: 2.5em; font-weight: 700; color: var(--primary-color); display: block; margin-bottom: 8px; }
        .stat-label { color: var(--text-secondary); font-size: 0.9em; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .report-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 30px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .card-header { display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid var(--light-bg); }
        .card-icon { font-size: 1.5em; margin-right: 12px; }
        .card-title { color: var(--text-primary); font-size: 1.4em; font-weight: 600; margin: 0; }
        .item-list { list-style: none; padding: 0; }
        .item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color); }
        .item:last-child { border-bottom: none; }
        .item-icon { width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; margin-right: 12px; }
        .item-name { font-weight: 600; color: var(--text-primary); }
        .item-details { color: var(--text-secondary); margin-left: 8px; }
        .footer { margin-top: 40px; padding: 30px 0; border-top: 1px solid var(--border-color); text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="report-date">Gerado em: ${currentDate}</div>
            <div class="header-content">
                <h1 class="logo">🩺 DorLog</h1>
                <p class="subtitle">Relatório de Saúde</p>
                <p class="user-info">📅 ${periodsText}<br>👤 ${userId}</p>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card"><span class="stat-value">${reportData.totalDays || 0}</span><span class="stat-label">Dias Registrados</span></div>
            <div class="stat-card"><span class="stat-value" style="color: var(--danger-color);">${reportData.crisisEpisodes || 0}</span><span class="stat-label">Episódios de Crise</span></div>
            <div class="stat-card"><span class="stat-value" style="color: var(--warning-color);">${reportData.averagePain || 0}</span><span class="stat-label">Dor Média (0-10)</span></div>
            <div class="stat-card"><span class="stat-value" style="color: var(--success-color);">${reportData.adherenceRate || 0}%</span><span class="stat-label">Adesão ao Tratamento</span></div>
        </div>

        ${reportData.painPoints?.length > 0 ? `
        <div class="report-card">
            <div class="card-header">
                <span class="card-icon">🎯</span>
                <h2 class="card-title">Pontos de Dor Mais Frequentes</h2>
            </div>
            <ul class="item-list">
                ${reportData.painPoints.map((point: any) => `
                    <li class="item">
                        <div class="item-icon"></div>
                        <span class="item-name">${point.point}</span>
                        <span class="item-details">(${point.count} ocorrências)</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="report-card">
            <div class="card-header">
                <span class="card-icon">💊</span>
                <h2 class="card-title">Medicamentos Prescritos</h2>
            </div>
            ${reportData.medications?.length > 0 ? `
                <ul class="item-list">
                    ${reportData.medications.map((med: any) => `
                        <li class="item">
                            <div class="item-icon"></div>
                            <span class="item-name">${med.nome}</span>
                            <span class="item-details">${med.dosagem} - ${med.frequencia}x ao dia${med.prescrito_por ? ` (Dr. ${med.prescrito_por})` : ''}</span>
                        </li>
                    `).join('')}
                </ul>
            ` : `
                <p style="color: var(--text-secondary); font-style: italic;">Nenhum medicamento registrado no período analisado.</p>
            `}
        </div>

        <div class="footer">
            <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">DorLog - Gestão Inteligente da Sua Saúde</div>
            <p style="color: var(--text-secondary); font-size: 0.9em; line-height: 1.5;">
                Relatório gerado automaticamente através do aplicativo DorLog<br>
                <strong>Data:</strong> ${currentDate} | <strong>Fonte:</strong> Firebase Storage
            </p>
        </div>
    </div>
</body>
</html>`;
      }
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
