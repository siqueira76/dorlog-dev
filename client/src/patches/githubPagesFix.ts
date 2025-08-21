// GitHub Pages Fix - Patch for API calls
export const patchApiCalls = () => {
  // Interceptar todas as chamadas fetch para APIs e redirecionar para funções locais
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Interceptar chamadas para generate-monthly-report
    if (url.includes('/api/generate-monthly-report') && init?.method === 'POST') {
      console.log('🔄 GitHub Pages: Interceptando chamada de API para geração local');
      
      try {
        const body = JSON.parse(init.body as string);
        const { userId, periods, periodsText } = body;
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gerar relatório local
        const reportData = { periodsText, userEmail: userId };
        const htmlContent = generateReportHTML(reportData);
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Abrir em nova aba
        window.open(url, '_blank');
        
        // Retornar resposta mockada
        return new Response(JSON.stringify({
          success: true,
          reportUrl: url,
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
};

const generateReportHTML = (reportData: any) => {
  const { periodsText, userEmail } = reportData;
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🩺 DorLog - Relatório de Saúde</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .logo {
            font-size: 2.5rem;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin: 0;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4rem;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
            display: block;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        .medication-list, .pain-list {
            list-style: none;
            padding: 0;
        }
        .medication-item, .pain-item {
            background: #f8f9fa;
            margin: 10px 0;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .item-name {
            font-weight: bold;
            color: #2c3e50;
        }
        .item-details {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        .demo-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            color: #856404;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🩺 DorLog</h1>
            <p class="subtitle">Relatório de Saúde</p>
            <p>📅 ${periodsText}</p>
            <p>👤 ${userEmail}</p>
        </div>
        
        <div class="content">
            <div class="demo-notice">
                <strong>📊 Relatório de Demonstração - GitHub Pages</strong><br>
                Este relatório foi gerado localmente com dados realistas para demonstração do layout profissional.
            </div>
            
            <div class="section">
                <h2 class="section-title">📊 Estatísticas Gerais</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">28</span>
                        <span class="stat-label">Dias Monitorados</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">12</span>
                        <span class="stat-label">Episódios de Dor</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">92%</span>
                        <span class="stat-label">Adesão Medicação</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">6.2</span>
                        <span class="stat-label">Dor Média (0-10)</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">💊 Medicamentos</h2>
                <ul class="medication-list">
                    <li class="medication-item">
                        <div class="item-name">Pregabalina</div>
                        <div class="item-details">150mg - 2x ao dia (Dr. Silva)</div>
                    </li>
                    <li class="medication-item">
                        <div class="item-name">Amitriptilina</div>
                        <div class="item-details">25mg - 1x ao dia (Dr. Silva)</div>
                    </li>
                    <li class="medication-item">
                        <div class="item-name">Gabapentina</div>
                        <div class="item-details">300mg - 3x ao dia (Dr. Santos)</div>
                    </li>
                </ul>
            </div>
            
            <div class="section">
                <h2 class="section-title">📍 Pontos de Dor Mais Frequentes</h2>
                <ul class="pain-list">
                    <li class="pain-item">
                        <div class="item-name">Região lombar</div>
                        <div class="item-details">(15 ocorrências)</div>
                    </li>
                    <li class="pain-item">
                        <div class="item-name">Pescoço</div>
                        <div class="item-details">(12 ocorrências)</div>
                    </li>
                    <li class="pain-item">
                        <div class="item-name">Ombros</div>
                        <div class="item-details">(10 ocorrências)</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>`;
};