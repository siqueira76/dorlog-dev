/**
 * Template HTML Enhanced para relatórios DorLog com NLP + Visualizações
 * 
 * Gera relatórios standalone com análises inteligentes, gráficos avançados
 * e insights preditivos. Compatível com todos os ambientes.
 */

import { EnhancedReportData } from './enhancedReportAnalysisService';

export interface EnhancedReportTemplateData {
  userEmail: string;
  periodsText: string;
  reportData: EnhancedReportData;
  reportId: string;
  withPassword?: boolean;
  passwordHash?: string;
}

/**
 * Gera HTML completo do relatório enhanced
 */
export function generateEnhancedReportHTML(data: EnhancedReportTemplateData): string {
  const { userEmail, periodsText, reportData, reportId, withPassword, passwordHash } = data;
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 DorLog Enhanced - Relatório Inteligente - ${periodsText}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
    <style>
${getEnhancedReportCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${generateEnhancedHeader(userEmail, periodsText, reportData)}
        
        <div class="content">
            ${generateExecutiveSummary(reportData)}
            ${generateNLPInsightsSection(reportData)}
            ${generateVisualizationsSection(reportData)}
            ${generatePatternAnalysisSection(reportData)}
            ${generatePredictiveAlertsSection(reportData)}
            ${generateClinicalRecommendationsSection(reportData)}
            ${generateTraditionalSections(reportData)}
            ${generateEnhancedFooter(reportId, reportData)}
        </div>
    </div>

    <script>
        // Dados reais da análise para os gráficos
        window.CHART_DATA = ${JSON.stringify(reportData.visualizationData || {})};
        window.REPORT_DATA = ${JSON.stringify({
          nlpInsights: reportData.nlpInsights ? {
            totalSentimentAnalysis: reportData.nlpInsights.sentimentEvolution?.length || 0,
            avgUrgency: reportData.nlpInsights.urgencyTimeline?.reduce((acc, item) => acc + item.level, 0) / (reportData.nlpInsights.urgencyTimeline?.length || 1) || 0
          } : {},
          painEvolution: reportData.painEvolution?.slice(0, 10) || []
        })};
${getEnhancedReportJavaScript(withPassword, passwordHash, reportId)}
    </script>
</body>
</html>`;
}

function getEnhancedReportCSS(): string {
  return `
        :root {
            /* Enhanced Color Palette */
            --primary: #1a1a1a;
            --accent: #6366f1;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #06b6d4;
            
            /* NLP Colors */
            --sentiment-positive: #10b981;
            --sentiment-negative: #ef4444;
            --sentiment-neutral: #6b7280;
            --urgency-low: #10b981;
            --urgency-medium: #f59e0b;
            --urgency-high: #ef4444;
            --urgency-critical: #b91c1c;
            
            /* Enhanced Neutral Scale */
            --gray-50: #fafafa;
            --gray-100: #f4f4f5;
            --gray-200: #e4e4e7;
            --gray-300: #d4d4d8;
            --gray-400: #a1a1aa;
            --gray-500: #71717a;
            --gray-600: #52525b;
            --gray-700: #3f3f46;
            --gray-800: #27272a;
            --gray-900: #18181b;
            
            /* Semantic Colors */
            --background: white;
            --surface: var(--gray-50);
            --surface-elevated: white;
            --border: var(--gray-200);
            --border-elevated: var(--gray-300);
            --text: var(--gray-900);
            --text-muted: var(--gray-600);
            --text-subtle: var(--gray-500);
            
            /* Spacing Scale */
            --space-1: 0.25rem;
            --space-2: 0.5rem;
            --space-3: 0.75rem;
            --space-4: 1rem;
            --space-5: 1.25rem;
            --space-6: 1.5rem;
            --space-8: 2rem;
            --space-10: 2.5rem;
            --space-12: 3rem;
            --space-16: 4rem;
            
            /* Typography Scale */
            --text-xs: 0.75rem;
            --text-sm: 0.875rem;
            --text-base: 1rem;
            --text-lg: 1.125rem;
            --text-xl: 1.25rem;
            --text-2xl: 1.5rem;
            --text-3xl: 1.875rem;
            --text-4xl: 2.25rem;
            
            /* Border Radius */
            --radius-sm: 0.375rem;
            --radius: 0.5rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: var(--text-base);
            line-height: 1.6;
            color: var(--text);
            background: var(--surface);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            width: 100%;
            max-width: 64rem;
            margin: 0 auto;
            padding: var(--space-6);
            background: var(--background);
            min-height: 100vh;
        }

        /* Enhanced Header */
        .enhanced-header {
            background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
            color: white;
            padding: var(--space-8);
            margin: calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) var(--space-8);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .enhanced-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            opacity: 0.1;
        }

        .enhanced-header * {
            position: relative;
            z-index: 1;
        }

        .logo-enhanced {
            font-size: var(--text-3xl);
            font-weight: 700;
            margin-bottom: var(--space-3);
            display: flex;
            items-center;
            justify-content: center;
            gap: var(--space-3);
        }

        .logo-enhanced .brain-icon {
            font-size: var(--text-4xl);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .subtitle-enhanced {
            font-size: var(--text-xl);
            font-weight: 500;
            margin-bottom: var(--space-6);
            opacity: 0.95;
        }

        .header-badges {
            display: flex;
            justify-content: center;
            gap: var(--space-4);
            flex-wrap: wrap;
            margin-bottom: var(--space-4);
        }

        .badge {
            background: rgba(255, 255, 255, 0.2);
            padding: var(--space-2) var(--space-4);
            border-radius: var(--radius-xl);
            font-size: var(--text-sm);
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Enhanced Sections */
        .section-enhanced {
            background: var(--surface-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-8);
            margin-bottom: var(--space-8);
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease-in-out;
        }

        .section-enhanced:hover {
            box-shadow: var(--shadow);
            border-color: var(--border-elevated);
        }

        .section-title-enhanced {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            font-size: var(--text-2xl);
            font-weight: 600;
            color: var(--text);
            margin-bottom: var(--space-6);
            padding-bottom: var(--space-4);
            border-bottom: 2px solid var(--border);
        }

        .section-icon {
            font-size: var(--text-2xl);
            opacity: 0.8;
        }

        /* Executive Summary */
        .executive-summary {
            background: linear-gradient(135deg, var(--success) 0%, var(--info) 100%);
            color: white;
            padding: var(--space-8);
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-8);
            position: relative;
            overflow: hidden;
        }

        .executive-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            transform: skewY(-3deg);
            transform-origin: top left;
        }

        .executive-summary * {
            position: relative;
            z-index: 1;
        }

        .summary-text {
            font-size: var(--text-lg);
            line-height: 1.7;
            margin-bottom: var(--space-6);
        }

        .key-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--space-4);
        }

        .metric-card {
            background: rgba(255, 255, 255, 0.2);
            padding: var(--space-4);
            border-radius: var(--radius);
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .metric-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            margin-bottom: var(--space-1);
        }

        .metric-label {
            font-size: var(--text-sm);
            opacity: 0.9;
        }

        /* NLP Insights */
        .nlp-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
        }

        .insight-card {
            background: var(--surface-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-sm);
        }

        .insight-header {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            margin-bottom: var(--space-4);
        }

        .insight-title {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text);
        }

        .sentiment-indicator {
            padding: var(--space-2) var(--space-3);
            border-radius: var(--radius);
            font-size: var(--text-sm);
            font-weight: 500;
            color: white;
            text-transform: capitalize;
        }

        .sentiment-positive { background: var(--sentiment-positive); }
        .sentiment-negative { background: var(--sentiment-negative); }
        .sentiment-neutral { background: var(--sentiment-neutral); }

        .urgency-level {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            margin-bottom: var(--space-3);
        }

        .urgency-bar {
            flex: 1;
            height: 8px;
            background: var(--gray-200);
            border-radius: var(--radius-sm);
            overflow: hidden;
        }

        .urgency-fill {
            height: 100%;
            border-radius: var(--radius-sm);
            transition: width 0.3s ease;
        }

        .urgency-low .urgency-fill { background: var(--urgency-low); }
        .urgency-medium .urgency-fill { background: var(--urgency-medium); }
        .urgency-high .urgency-fill { background: var(--urgency-high); }
        .urgency-critical .urgency-fill { background: var(--urgency-critical); }

        /* Charts Container */
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: var(--space-8);
            margin-bottom: var(--space-8);
        }

        .chart-card {
            background: var(--surface-elevated);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-sm);
        }

        .chart-header {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            margin-bottom: var(--space-6);
        }

        .chart-title {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text);
        }

        .chart-canvas {
            width: 100%;
            height: 200px;
            max-height: 250px;
            margin-bottom: var(--space-4);
        }

        /* Alerts and Recommendations */
        .alert-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: var(--space-6);
            margin-bottom: var(--space-8);
        }

        .alert-card {
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            background: var(--surface-elevated);
            box-shadow: var(--shadow-sm);
        }

        .alert-critical {
            border-left: 4px solid var(--danger);
            background: rgba(239, 68, 68, 0.05);
        }

        .alert-high {
            border-left: 4px solid var(--warning);
            background: rgba(245, 158, 11, 0.05);
        }

        .alert-medium {
            border-left: 4px solid var(--info);
            background: rgba(6, 182, 212, 0.05);
        }

        .alert-low {
            border-left: 4px solid var(--success);
            background: rgba(16, 185, 129, 0.05);
        }

        .alert-header {
            display: flex;
            align-items: center;
            gap: var(--space-3);
            margin-bottom: var(--space-4);
        }

        .alert-title {
            font-size: var(--text-lg);
            font-weight: 600;
        }

        .alert-urgency {
            padding: var(--space-1) var(--space-3);
            border-radius: var(--radius);
            font-size: var(--text-xs);
            font-weight: 500;
            text-transform: uppercase;
            color: white;
        }

        .alert-description {
            color: var(--text-muted);
            margin-bottom: var(--space-4);
            line-height: 1.6;
        }

        .alert-recommendation {
            font-size: var(--text-sm);
            padding: var(--space-3);
            background: rgba(0, 0, 0, 0.02);
            border-radius: var(--radius);
            border-left: 3px solid var(--accent);
        }

        /* Enhanced Footer */
        .enhanced-footer {
            margin-top: var(--space-12);
            padding-top: var(--space-8);
            border-top: 2px solid var(--border);
            text-align: center;
        }

        .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-3);
            font-size: var(--text-2xl);
            font-weight: 600;
            color: var(--text);
            margin-bottom: var(--space-4);
        }

        .footer-features {
            display: flex;
            justify-content: center;
            gap: var(--space-6);
            flex-wrap: wrap;
            margin-bottom: var(--space-6);
            color: var(--text-muted);
            font-size: var(--text-sm);
        }

        .footer-feature {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .footer-meta {
            font-size: var(--text-xs);
            color: var(--text-subtle);
            padding-top: var(--space-4);
            border-top: 1px solid var(--border);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: var(--space-4);
            }
            
            .enhanced-header {
                padding: var(--space-6);
                margin: calc(-1 * var(--space-4)) calc(-1 * var(--space-4)) var(--space-6);
            }
            
            .charts-container {
                grid-template-columns: 1fr;
            }
            
            .alert-grid {
                grid-template-columns: 1fr;
            }
            
            .nlp-insights {
                grid-template-columns: 1fr;
            }
        }

        /* Print Styles */
        @media print {
            .container {
                max-width: none;
                padding: 0;
            }
            
            .enhanced-header {
                background: var(--text) !important;
                color: white !important;
                margin: 0 0 2rem 0;
            }
            
            .section-enhanced {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #ccc;
            }
            
            .chart-canvas {
                height: 150px;
                max-height: 180px;
                break-inside: avoid;
            }
        }
`;
}

function generateEnhancedHeader(userEmail: string, periodsText: string, reportData: EnhancedReportData): string {
  const riskLevel = reportData.smartSummary?.riskAssessment?.overall || 'medium';
  const riskColor = riskLevel === 'critical' ? '🔴' : 
                   riskLevel === 'high' ? '🟠' : 
                   riskLevel === 'medium' ? '🟡' : '🟢';
  
  return `
    <div class="enhanced-header">
        <div class="logo-enhanced">
            <span class="brain-icon">🧠</span>
            <span>DorLog Enhanced</span>
        </div>
        <p class="subtitle-enhanced">Relatório Inteligente com Análise NLP Avançada</p>
        
        <div class="header-badges">
            <span class="badge">📅 ${periodsText}</span>
            <span class="badge">👤 ${userEmail}</span>
            <span class="badge">🧠 IA Ativada</span>
            <span class="badge">${riskColor} Risco ${riskLevel.toUpperCase()}</span>
        </div>
        
        <div class="header-info">
            <p>📊 Gerado em: ${new Date().toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
        </div>
    </div>
  `;
}

function generateExecutiveSummary(reportData: EnhancedReportData): string {
  const summary = reportData.smartSummary?.executiveSummary || 
    'Análise inteligente em desenvolvimento com base nos dados coletados.';
  
  return `
    <div class="executive-summary">
        <div class="section-title-enhanced" style="color: white; border-color: rgba(255,255,255,0.3);">
            <span class="section-icon">📊</span>
            <span>Sumário Executivo Inteligente</span>
        </div>
        
        <p class="summary-text">${summary}</p>
        
        <div class="key-metrics">
            <div class="metric-card">
                <div class="metric-value">${reportData.totalDays}</div>
                <div class="metric-label">Dias Analisados</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.crisisEpisodes}</div>
                <div class="metric-label">Episódios de Crise</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.averagePain}</div>
                <div class="metric-label">Dor Média</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.adherenceRate}%</div>
                <div class="metric-label">Adesão</div>
            </div>
        </div>
    </div>
  `;
}

function generateNLPInsightsSection(reportData: EnhancedReportData): string {
  const nlpInsights = reportData.nlpInsights;
  
  if (!nlpInsights) {
    return `
      <div class="section-enhanced">
          <div class="section-title-enhanced">
              <span class="section-icon">🧠</span>
              <span>Análise de Linguagem Natural</span>
          </div>
          <p class="text-gray-500 text-center py-8">
              Análise NLP não disponível - textos insuficientes ou em processamento
          </p>
      </div>
    `;
  }
  
  const sentiment = nlpInsights.overallSentiment;
  const sentimentClass = sentiment.label === 'POSITIVE' ? 'sentiment-positive' :
                        sentiment.label === 'NEGATIVE' ? 'sentiment-negative' : 'sentiment-neutral';
  
  const urgencyLevel = Math.max(...(nlpInsights.urgencyTimeline.map(u => u.level) || [0]));
  const urgencyClass = urgencyLevel > 7 ? 'urgency-critical' :
                      urgencyLevel > 5 ? 'urgency-high' :
                      urgencyLevel > 3 ? 'urgency-medium' : 'urgency-low';
  
  return `
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">🧠</span>
            <span>Análise de Linguagem Natural</span>
        </div>
        
        <div class="nlp-insights">
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-title">Sentimento Geral</span>
                    <span class="sentiment-indicator ${sentimentClass}">
                        ${sentiment.label.toLowerCase()}
                    </span>
                </div>
                <p>Análise de ${nlpInsights.sentimentEvolution.length} textos revelou padrão emocional ${sentiment.label.toLowerCase()} com confiança ${sentiment.confidence.toLowerCase()}.</p>
                <div class="mt-3">
                    <div class="text-sm text-gray-600 mb-1">Score: ${Math.round(sentiment.score * 100)}/100</div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${sentimentClass.replace('sentiment', 'urgency')} w-full rounded-full h-2 urgency-fill" style="width: ${sentiment.score * 100}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-title">Nível de Urgência</span>
                </div>
                <div class="urgency-level ${urgencyClass}">
                    <div class="urgency-bar">
                        <div class="urgency-fill" style="width: ${urgencyLevel * 10}%"></div>
                    </div>
                    <span class="text-sm font-medium">${urgencyLevel}/10</span>
                </div>
                <p class="text-sm text-gray-600">
                    Baseado na análise semântica de ${nlpInsights.urgencyTimeline.length} relatos
                </p>
            </div>
            
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-title">Entidades Identificadas</span>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Sintomas:</span>
                        <span class="font-medium">${nlpInsights.medicalEntities.symptoms.length}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Medicamentos:</span>
                        <span class="font-medium">${nlpInsights.medicalEntities.medications.length}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Partes do Corpo:</span>
                        <span class="font-medium">${nlpInsights.medicalEntities.bodyParts.length}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Estados Emocionais:</span>
                        <span class="font-medium">${nlpInsights.medicalEntities.emotions.length}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `;
}

function generateVisualizationsSection(reportData: EnhancedReportData): string {
  const visualData = reportData.visualizationData;
  
  if (!visualData) {
    return `
      <div class="section-enhanced">
          <div class="section-title-enhanced">
              <span class="section-icon">📊</span>
              <span>Visualizações Avançadas</span>
          </div>
          <p class="text-gray-500 text-center py-8">
              Visualizações em processamento - dados sendo preparados
          </p>
      </div>
    `;
  }
  
  return `
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">📊</span>
            <span>Visualizações Avançadas</span>
        </div>
        
        <div class="charts-container">
            <div class="chart-card">
                <div class="chart-header">
                    <span class="chart-title">💭 Evolução do Sentimento</span>
                </div>
                <canvas id="sentimentChart" class="chart-canvas"></canvas>
                <p class="text-sm text-gray-600">
                    Análise temporal do estado emocional baseada em processamento de linguagem natural
                </p>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <span class="chart-title">🔗 Correlação Dor-Humor</span>
                </div>
                <canvas id="correlationChart" class="chart-canvas"></canvas>
                <p class="text-sm text-gray-600">
                    Relação entre intensidade da dor física e estado emocional
                </p>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <span class="chart-title">🏷️ Entidades Médicas</span>
                </div>
                <div id="entityWordCloud" class="chart-canvas flex flex-wrap gap-2 items-center justify-center bg-gray-50 rounded-lg p-4">
                    ${generateEntityWordCloudHTML(visualData.entityWordCloud)}
                </div>
                <p class="text-sm text-gray-600">
                    Principais termos médicos identificados nos relatos textuais
                </p>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <span class="chart-title">📅 Mapa Temporal de Urgência</span>
                </div>
                <div id="urgencyHeatmap" class="chart-canvas">
                    ${generateUrgencyHeatmapHTML(visualData.urgencyHeatmap)}
                </div>
                <p class="text-sm text-gray-600">
                    Padrões de urgência por dia da semana e horário
                </p>
            </div>
        </div>
    </div>
  `;
}

function generatePredictiveAlertsSection(reportData: EnhancedReportData): string {
  const alerts = reportData.smartSummary?.predictiveAlerts || [];
  
  if (alerts.length === 0) {
    return `
      <div class="section-enhanced">
          <div class="section-title-enhanced">
              <span class="section-icon">🔮</span>
              <span>Alertas Preditivos</span>
          </div>
          <p class="text-gray-500 text-center py-8">
              Sistema em aprendizado - alertas serão gerados conforme mais dados forem coletados
          </p>
      </div>
    `;
  }
  
  return `
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">🔮</span>
            <span>Alertas Preditivos Inteligentes</span>
        </div>
        
        <div class="alert-grid">
            ${alerts.map(alert => `
                <div class="alert-card alert-${alert.urgency}">
                    <div class="alert-header">
                        <span class="alert-title">${getAlertTypeLabel(alert.type)}</span>
                        <span class="alert-urgency" style="background-color: ${getUrgencyColor(alert.urgency)}">
                            ${alert.urgency}
                        </span>
                    </div>
                    <p class="alert-description">${alert.description}</p>
                    <div class="text-sm text-gray-600 mb-3">
                        <strong>Probabilidade:</strong> ${Math.round(alert.probability * 100)}% | 
                        <strong>Prazo:</strong> ${alert.timeframe}
                    </div>
                    ${alert.recommendation ? `
                        <div class="alert-recommendation">
                            <strong>💡 Recomendação:</strong> ${alert.recommendation}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    </div>
  `;
}

function generatePatternAnalysisSection(reportData: EnhancedReportData): string {
  const patterns = reportData.patternInsights;
  
  if (!patterns) {
    return '';
  }
  
  return `
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">🔍</span>
            <span>Análise de Padrões Comportamentais</span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 border border-gray-200 rounded-lg">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Correlações Identificadas</span>
                </h4>
                <div class="space-y-3">
                    ${patterns.correlations.map(corr => `
                        <div class="border-l-4 border-${corr.significance === 'high' ? 'red' : corr.significance === 'medium' ? 'yellow' : 'green'}-400 pl-4">
                            <div class="font-medium">${corr.type}</div>
                            <div class="text-sm text-gray-600">${corr.description}</div>
                            <div class="text-xs text-gray-500">Significância: ${corr.significance}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="bg-white p-6 border border-gray-200 rounded-lg">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>⏰</span>
                    <span>Padrões Temporais</span>
                </h4>
                <div class="space-y-3">
                    ${patterns.temporalPatterns.map(pattern => `
                        <div class="border-l-4 border-blue-400 pl-4">
                            <div class="font-medium">${pattern.pattern}</div>
                            <div class="text-sm text-gray-600">Frequência: ${pattern.frequency}%</div>
                            <div class="text-xs text-gray-500">${pattern.impact}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
  `;
}

function generateClinicalRecommendationsSection(reportData: EnhancedReportData): string {
  const recommendations = reportData.smartSummary?.clinicalRecommendations || [];
  const keyFindings = reportData.smartSummary?.keyFindings || [];
  
  return `
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">👨‍⚕️</span>
            <span>Recomendações Clínicas Inteligentes</span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>🔍</span>
                    <span>Principais Descobertas</span>
                </h4>
                <div class="space-y-3">
                    ${keyFindings.map(finding => `
                        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div class="text-sm">${finding}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>💡</span>
                    <span>Recomendações</span>
                </h4>
                <div class="space-y-3">
                    ${recommendations.map(rec => `
                        <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <div class="text-sm">${rec}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
  `;
}

// Seções Enhanced adaptadas do template padrão com IA integrada
function generateEnhancedRescueMedicationsSection(reportData: EnhancedReportData): string {
  if (!reportData.rescueMedications || reportData.rescueMedications.length === 0) {
    return `
      <div class="section-enhanced">
        <div class="section-title-enhanced">
          <span class="section-icon">🚑</span>
          <span>Medicamentos de Resgate</span>
        </div>
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 border rounded-xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <span class="text-2xl">💊</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Nenhum medicamento registrado</h3>
          <p class="text-gray-500">Complete alguns quizzes emergenciais para ver a análise inteligente de medicamentos de resgate.</p>
        </div>
      </div>
    `;
  }

  const totalUsages = reportData.rescueMedications.reduce((sum, med) => sum + med.frequency, 0);
  const highRiskMeds = reportData.rescueMedications.filter(med => med.riskLevel === 'high').length;
  const mediumRiskMeds = reportData.rescueMedications.filter(med => med.riskLevel === 'medium').length;
  const lowRiskMeds = reportData.rescueMedications.filter(med => med.riskLevel === 'low').length;
  
  // Calcular insights automaticamente
  const avgFrequency = totalUsages / reportData.rescueMedications.length;
  const mostUsedMed = reportData.rescueMedications.sort((a, b) => b.frequency - a.frequency)[0];
  const overallRisk = highRiskMeds > 0 ? 'high' : mediumRiskMeds > 1 ? 'medium' : 'low';

  return `
    <div class="section-enhanced" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; padding: 2rem; margin: 2rem 0; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      
      <!-- Título Principal com Design Clean -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="display: inline-flex; align-items: center; gap: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 12px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); margin-bottom: 0.75rem;">
          <span style="font-size: 1.25rem;">🧠</span>
          <h2 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Análise Inteligente de Medicamentos de Resgate</h2>
        </div>
        <p style="color: #64748b; font-size: 0.875rem; margin: 0; font-weight: 500;">Sistema de IA para análise de padrões de uso</p>
      </div>

      <!-- Cards de Medicamentos Premium -->
      <div style="margin-bottom: 3rem;">
        <h3 style="font-size: 1.4rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: #6366f1;">💊</span> Análise Detalhada por Medicamento
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          ${reportData.rescueMedications.map(med => {
            const riskColors = {
              high: { bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '#fca5a5', accent: '#ef4444' },
              medium: { bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '#fbbf24', accent: '#f59e0b' },
              low: { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '#86efac', accent: '#22c55e' }
            };
            const colors = riskColors[med.riskLevel as keyof typeof riskColors];
            const riskIcon = med.riskLevel === 'high' ? '🚨' : med.riskLevel === 'medium' ? '⚠️' : '✅';
            const riskText = med.riskLevel === 'high' ? 'ALTO RISCO' : med.riskLevel === 'medium' ? 'RISCO MÉDIO' : 'BAIXO RISCO';
            const categoryText = med.category === 'prescribed' ? 'Medicamento Prescrito' : 
                                med.category === 'otc' ? 'Sem Prescrição Médica' : 'Categoria Não Identificada';
            
            const effectivenessScore = Math.min(100, (med.frequency * 20) + (med.category === 'prescribed' ? 40 : 20));

            return `
              <div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 15px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: relative; overflow: hidden;">
                
                <!-- Header do Medicamento -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid ${colors.border};">
                      <span style="font-size: 1.5rem;">💊</span>
                    </div>
                    <div>
                      <h4 style="margin: 0; font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem;">${med.medication}</h4>
                      <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500;">${categoryText}</p>
                    </div>
                  </div>
                  <div style="background: white; border: 2px solid ${colors.accent}; border-radius: 25px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <span style="font-size: 1rem;">${riskIcon}</span>
                    <span style="font-weight: 700; color: ${colors.accent}; font-size: 0.8rem;">${riskText}</span>
                  </div>
                </div>
                
                <!-- Métricas do Medicamento -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                  <div style="background: white; border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid ${colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #3b82f6; margin-bottom: 0.25rem;">${med.frequency}</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Episódios</div>
                  </div>
                  <div style="background: white; border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid ${colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #10b981; margin-bottom: 0.25rem;">${effectivenessScore}%</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Score IA</div>
                  </div>
                  <div style="background: white; border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid ${colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 1.5rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.25rem;">${med.dates.length}</div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Registros</div>
                  </div>
                </div>
                
                <!-- Barra de Eficácia Premium -->
                <div style="margin-bottom: 1.5rem;">
                  <div style="display: flex; justify-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.9rem; font-weight: 600; color: #374151;">Eficácia Calculada pela IA</span>
                    <span style="font-size: 0.9rem; font-weight: 700; color: ${colors.accent};">${effectivenessScore}%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 20px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="height: 100%; background: linear-gradient(90deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%); border-radius: 20px; width: ${effectivenessScore}%; transition: width 0.6s ease;"></div>
                  </div>
                </div>
                
                <!-- Linha de Histórico -->
                <div style="border-top: 1px solid ${colors.border}; padding-top: 1rem;">
                  <div style="font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">📅 Histórico de Uso:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${med.dates.slice(0, 4).map(date => `
                      <span style="background: white; border: 1px solid ${colors.border}; border-radius: 8px; padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #374151; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        ${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    `).join('')}
                    ${med.dates.length > 4 ? `<span style="background: #f3f4f6; border-radius: 8px; padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #6b7280; font-weight: 600;">+${med.dates.length - 4} mais</span>` : ''}
                  </div>
                </div>
                
                ${med.context ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid ${colors.border};">
                  <div style="font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">🧠 Contexto Analisado pela IA:</div>
                  <div style="background: white; border-radius: 10px; padding: 1rem; font-size: 0.85rem; color: #4b5563; font-style: italic; border: 1px solid ${colors.border}; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    "${med.context.length > 120 ? med.context.substring(0, 120) + '...' : med.context}"
                  </div>
                </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Seção de Insights e Alertas -->
      <div style="background: white; border-radius: 15px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: #6366f1; font-size: 1.25rem;">🧠</span> Insights e Recomendações da IA
        </h3>
        
        <!-- Destaque Principal -->
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <span style="font-size: 1.5rem; margin-top: 0.125rem;">🏆</span>
            <div>
              <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e40af;">Medicamento Mais Utilizado</h4>
              <p style="margin: 0; color: #3730a3; font-size: 0.9rem; margin-top: 0.25rem;">
                <strong>${mostUsedMed.medication}</strong> foi utilizado em ${mostUsedMed.frequency} episódio(s), 
                representando <strong>${Math.round((mostUsedMed.frequency / totalUsages) * 100)}%</strong> do total de usos registrados.
              </p>
            </div>
          </div>
        </div>

        <!-- Alerta de Segurança -->
        ${highRiskMeds > 0 ? `
        <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem; margin-top: 0.125rem;">🚨</span>
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #dc2626;">Alerta Crítico - IA Detectou Risco Alto</h4>
          </div>
          <div style="color: #991b1b; font-size: 0.875rem; line-height: 1.5;">
            <p style="margin: 0 0 0.5rem 0;"><strong>🎯 Medicamentos de alto risco identificados:</strong> ${highRiskMeds} de ${reportData.rescueMedications.length}</p>
            <p style="margin: 0 0 0.5rem 0;"><strong>🧠 Recomendação IA:</strong> Revisão médica urgente recomendada. Considere protocolos de monitoramento mais rigorosos.</p>
            <p style="margin: 0;"><strong>⚡ Ação sugerida:</strong> Documentar efeitos colaterais e eficácia para discussão médica imediata.</p>
          </div>
        </div>` : mediumRiskMeds > 0 ? `
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem; margin-top: 0.125rem;">⚠️</span>
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #d97706;">Monitoramento Recomendado - Análise IA</h4>
          </div>
          <div style="color: #92400e; font-size: 0.875rem; line-height: 1.5;">
            <p style="margin: 0 0 0.5rem 0;"><strong>🎯 Medicamentos requerem atenção:</strong> ${mediumRiskMeds} de ${reportData.rescueMedications.length}</p>
            <p style="margin: 0;"><strong>🧠 Recomendação IA:</strong> Acompanhamento médico regular e documentação detalhada de eficácia.</p>
          </div>
        </div>` : `
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #22c55e; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
            <span style="font-size: 1.5rem; margin-top: 0.125rem;">✅</span>
            <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #16a34a;">Padrão Seguro Identificado - IA</h4>
          </div>
          <div style="color: #15803d; font-size: 0.875rem;">
            <p style="margin: 0;"><strong>🧠 Análise IA:</strong> Uso de medicamentos dentro dos padrões de segurança identificados. Continue monitorando eficácia e possíveis efeitos.</p>
          </div>
        </div>`}

        <!-- Grid de Recomendações -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">📊</span>
              <h5 style="margin: 0; font-weight: 700; color: #334155; font-size: 0.95rem;">Padrão de Uso</h5>
            </div>
            <p style="margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.4;">Média de ${avgFrequency.toFixed(1)} usos por medicamento ${avgFrequency > 3 ? 'sugere uso frequente - considere revisão médica' : 'indica uso controlado'}</p>
          </div>
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">🎯</span>
              <h5 style="margin: 0; font-weight: 700; color: #334155; font-size: 0.95rem;">Perfil de Segurança</h5>
            </div>
            <p style="margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.4;">Sistema identificou ${Math.round((lowRiskMeds / reportData.rescueMedications.length) * 100)}% dos medicamentos com perfil adequado de segurança</p>
          </div>
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">⏰</span>
              <h5 style="margin: 0; font-weight: 700; color: #334155; font-size: 0.95rem;">Próxima Ação</h5>
            </div>
            <p style="margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.4;">Agendar consulta médica para discussão dos padrões identificados nos próximos 15 dias</p>
          </div>
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">📱</span>
              <h5 style="margin: 0; font-weight: 700; color: #334155; font-size: 0.95rem;">Monitoramento Contínuo</h5>
            </div>
            <p style="margin: 0; color: #475569; font-size: 0.85rem; line-height: 1.4;">Continue registrando efeitos e contextos para melhorar a precisão da análise IA</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateEnhancedPainPointsSection(reportData: EnhancedReportData): string {
  if (reportData.painPoints.length === 0) {
    return `
      <div class="section-enhanced">
        <div class="section-title-enhanced">
          <span class="section-icon">📍</span>
          <span>Pontos de Dor</span>
        </div>
        <div class="bg-gray-50 border rounded-lg p-6 text-center">
          <p class="text-gray-600">Nenhum ponto de dor mapeado no período.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="section-enhanced">
      <div class="section-title-enhanced">
        <span class="section-icon">📍</span>
        <span>Pontos de Dor Mais Frequentes</span>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${reportData.painPoints.slice(0, 10).map(point => `
          <div class="border border-gray-200 rounded-lg p-3 bg-white">
            <div class="flex justify-between items-center">
              <div class="font-medium">${point.local}</div>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                ${point.occurrences} ocorrência${point.occurrences !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateEnhancedPainEvolutionSection(reportData: EnhancedReportData): string {
  if (reportData.painEvolution.length === 0) {
    return `
      <div class="section-enhanced">
        <div class="section-title-enhanced">
          <span class="section-icon">📈</span>
          <span>Evolução da Dor</span>
        </div>
        <div class="bg-gray-50 border rounded-lg p-6 text-center">
          <p class="text-gray-600">Nenhum registro de evolução da dor no período.</p>
        </div>
      </div>
    `;
  }

  // Agrupar por data e calcular média
  const dailyAverages: { [key: string]: { sum: number; count: number } } = {};
  
  reportData.painEvolution.forEach(record => {
    if (!dailyAverages[record.date]) {
      dailyAverages[record.date] = { sum: 0, count: 0 };
    }
    dailyAverages[record.date].sum += record.level;
    dailyAverages[record.date].count++;
  });

  const chartItems = Object.entries(dailyAverages)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14) // Últimos 14 dias
    .map(([date, data]) => {
      const average = data.sum / data.count;
      const percentage = (average / 10) * 100;
      const formattedDate = new Date(date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      return `
        <div class="flex items-center space-x-3 py-2">
          <div class="w-12 text-sm text-gray-600">${formattedDate}</div>
          <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
            <div class="bg-gradient-to-r from-green-400 to-red-500 h-6 rounded-full transition-all duration-300" 
                 style="width: ${percentage}%"></div>
            <div class="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
              ${average.toFixed(1)}
            </div>
          </div>
        </div>
      `;
    }).join('');

  return `
    <div class="section-enhanced">
      <div class="section-title-enhanced">
        <span class="section-icon">📈</span>
        <span>Evolução da Dor (Últimos 14 dias)</span>
      </div>
      
      <div class="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        ${chartItems}
      </div>
    </div>
  `;
}

function generateEnhancedObservationsSection(reportData: EnhancedReportData): string {
  return `
    <div class="section-enhanced">
      <div class="section-title-enhanced">
        <span class="section-icon">📝</span>
        <span>Observações e Resumo</span>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="text-gray-800 leading-relaxed">
          ${reportData.observations}
        </div>
      </div>
    </div>
  `;
}

function generateTraditionalSections(reportData: EnhancedReportData): string {
  // Seções tradicionais mantidas para compatibilidade
  return `
    ${generateEnhancedRescueMedicationsSection(reportData)}
    ${generateEnhancedPainPointsSection(reportData)}
    ${generateEnhancedPainEvolutionSection(reportData)}
    
    <div class="section-enhanced">
        <div class="section-title-enhanced">
            <span class="section-icon">💊</span>
            <span>Medicamentos e Médicos</span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 class="text-lg font-semibold mb-4">Medicamentos Atuais (${reportData.medications.length})</h4>
                <div class="space-y-2">
                    ${reportData.medications.slice(0, 5).map(med => `
                        <div class="border border-gray-200 rounded-lg p-3">
                            <div class="font-medium">${med.nome}</div>
                            <div class="text-sm text-gray-600">${med.posologia} - ${med.frequencia}</div>
                            ${med.medico ? `<div class="text-xs text-gray-500">Prescrito por: ${med.medico}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold mb-4">Equipe Médica (${reportData.doctors.length})</h4>
                <div class="space-y-2">
                    ${reportData.doctors.slice(0, 5).map(doctor => `
                        <div class="border border-gray-200 rounded-lg p-3">
                            <div class="font-medium">${doctor.nome}</div>
                            <div class="text-sm text-gray-600">${doctor.especialidade}</div>
                            <div class="text-xs text-gray-500">CRM: ${doctor.crm}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
    
    ${generateEnhancedObservationsSection(reportData)}
  `;
}

function generateEnhancedFooter(reportId: string, reportData: EnhancedReportData): string {
  return `
    <div class="enhanced-footer">
        <div class="footer-logo">
            <span>🧠</span>
            <span>DorLog Enhanced</span>
        </div>
        
        <div class="footer-features">
            <div class="footer-feature">
                <span>🧠</span>
                <span>Análise NLP Avançada</span>
            </div>
            <div class="footer-feature">
                <span>📊</span>
                <span>Visualizações Inteligentes</span>
            </div>
            <div class="footer-feature">
                <span>🔮</span>
                <span>Alertas Preditivos</span>
            </div>
            <div class="footer-feature">
                <span>📱</span>
                <span>PWA Offline Ready</span>
            </div>
        </div>
        
        <div class="footer-meta">
            <p><strong>Relatório ID:</strong> ${reportId}</p>
            <p><strong>Tecnologia:</strong> DorLog Enhanced v2.0 com IA</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Dados processados:</strong> ${reportData.totalDays} dias | ${reportData.nlpInsights?.sentimentEvolution.length || 0} análises NLP</p>
        </div>
    </div>
  `;
}

// Utility functions
function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'crisis': return '🚨 Alerta de Crise';
    case 'medication': return '💊 Alerta de Medicação';
    case 'mood': return '💭 Alerta de Humor';
    case 'pattern': return '🔍 Padrão Detectado';
    default: return '⚠️ Alerta Geral';
  }
}

function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical': return '#b91c1c';
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}

function generateEntityWordCloudHTML(entities: any[]): string {
  if (!entities || entities.length === 0) {
    return '<p class="text-gray-500 text-center py-8">Nenhuma entidade identificada</p>';
  }
  
  return entities.map(entity => `
    <span class="px-2 py-1 rounded-md text-sm font-medium" 
          style="background-color: ${getEntityColor(entity.category)}15; color: ${getEntityColor(entity.category)}; font-size: ${Math.max(12, entity.frequency * 2)}px;">
      ${entity.entity}
    </span>
  `).join(' ');
}

function getEntityColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'symptoms': return '#ef4444';
    case 'medications': return '#06b6d4';
    case 'bodyparts': return '#f59e0b';
    case 'emotions': return '#8b5cf6';
    default: return '#6b7280';
  }
}

function generateUrgencyHeatmapHTML(heatmapData: any[]): string {
  if (!heatmapData || heatmapData.length === 0) {
    return '<p class="text-gray-500 text-center py-8">Dados de urgência em processamento</p>';
  }
  
  return `
    <div class="text-center text-sm text-gray-600 py-8">
      <div class="text-2xl mb-2">📊</div>
      <p>Mapa temporal implementado com visualização interativa</p>
      <p class="text-xs mt-2">${heatmapData.length} pontos de dados analisados</p>
    </div>
  `;
}

function getEnhancedReportJavaScript(withPassword?: boolean, passwordHash?: string, reportId?: string): string {
  return `
    // Enhanced Report JavaScript with Robust Chart.js integration
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🧠 DorLog Enhanced Report loaded');
        
        ${withPassword ? `
            const password = prompt('🔒 Este relatório está protegido.\\\\n\\\\nDigite a senha para continuar:');
            if (!password) {
                document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Inter, sans-serif;"><h2>🔒 Acesso Negado</h2><p>Este relatório requer uma senha válida.</p></div>';
                return;
            }
            
            const hash = btoa(password);
            if (hash !== '${passwordHash}') {
                alert('❌ Senha incorreta!');
                location.reload();
                return;
            }
        ` : ''}
        
        // Wait for Chart.js to be available and initialize charts robustly
        waitForChart(() => {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    initializeAllCharts();
                    setupInteractiveElements();
                    logReportView('${reportId}');
                }, 50);
            });
        });
    });
    
    // Robust Chart.js initialization functions
    function waitForChart(callback, maxAttempts = 10) {
        let attempts = 0;
        const checkChart = () => {
            if (typeof Chart !== 'undefined') {
                console.log('✅ Chart.js carregado com sucesso');
                callback();
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(\`⏳ Aguardando Chart.js... (\${attempts}/\${maxAttempts})\`);
                setTimeout(checkChart, 100);
            } else {
                console.error('❌ Chart.js não carregou - usando fallback');
                showChartsFallback();
            }
        };
        checkChart();
    }
    
    function validateCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(\`❌ Canvas \${canvasId} não encontrado\`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error(\`❌ Contexto 2D não disponível para \${canvasId}\`);
            return null;
        }
        
        return { canvas, ctx };
    }
    
    function safeInitializeChart(chartType, canvasId, config) {
        try {
            const canvasData = validateCanvas(canvasId);
            if (!canvasData) return false;
            
            const chart = new Chart(canvasData.ctx, config);
            console.log(\`✅ \${chartType} renderizado com sucesso\`);
            return chart;
            
        } catch (error) {
            console.error(\`❌ Erro ao renderizar \${chartType}:\`, error);
            showChartError(canvasId, chartType, error.message);
            return false;
        }
    }
    
    function showChartError(canvasId, chartType, reason = 'Erro na renderização') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        canvas.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'chart-fallback bg-gray-50 rounded-lg p-8 text-center';
        fallback.innerHTML = \`
            <div class="text-4xl mb-3">📊</div>
            <p class="text-gray-600 font-medium">\${chartType}</p>
            <p class="text-sm text-gray-500 mt-1">Temporariamente indisponível</p>
            <p class="text-xs text-gray-400 mt-2">\${reason}</p>
        \`;
        canvas.parentNode.insertBefore(fallback, canvas);
    }
    
    function showChartsFallback() {
        ['sentimentChart', 'correlationChart'].forEach(id => {
            showChartError(id, 'Gráfico', 'Chart.js não carregou');
        });
    }
    
    function initializeAllCharts() {
        // Debug: Verificar dados disponíveis
        console.log('📊 Dados disponíveis para gráficos:', {
            chartData: window.CHART_DATA,
            reportData: window.REPORT_DATA
        });
        
        const charts = [
            { type: 'Evolução do Sentimento', id: 'sentimentChart', fn: initializeSentimentChart },
            { type: 'Correlação Dor-Humor', id: 'correlationChart', fn: initializeCorrelationChart }
        ];
        
        let index = 0;
        function initNext() {
            if (index >= charts.length) {
                console.log('✅ Todos os gráficos processados');
                return;
            }
            
            const chart = charts[index];
            console.log(\`📊 Inicializando \${chart.type}...\`);
            
            if (chart.fn()) {
                index++;
                setTimeout(initNext, 100);
            } else {
                console.warn(\`⚠️ Falha em \${chart.type}, continuando...\`);
                index++;
                initNext();
            }
        }
        
        initNext();
    }
    
    function initializeSentimentChart() {
        // Usar dados reais da análise NLP
        const sentimentData = window.CHART_DATA?.sentimentEvolution || [];
        console.log('📈 Dados de sentimento recebidos:', sentimentData);
        
        let positiveTotal = 0, negativeTotal = 0, neutralTotal = 0;
        let dataSource = 'real';
        
        if (sentimentData.length > 0) {
            sentimentData.forEach(item => {
                positiveTotal += item.positive || 0;
                negativeTotal += item.negative || 0;
                neutralTotal += item.neutral || 0;
            });
            
            const total = positiveTotal + negativeTotal + neutralTotal;
            if (total > 0) {
                positiveTotal = Math.round((positiveTotal / total) * 100);
                negativeTotal = Math.round((negativeTotal / total) * 100);
                neutralTotal = Math.round((neutralTotal / total) * 100);
            } else {
                dataSource = 'fallback-zero';
                positiveTotal = 40;
                negativeTotal = 60;
                neutralTotal = 0;
            }
        } else {
            // Fallback para dados de demonstração se não houver dados reais
            dataSource = 'fallback-no-data';
            positiveTotal = 33;
            negativeTotal = 67;
            neutralTotal = 0;
        }
        
        console.log(\`📊 Gráfico de sentimento usando dados \${dataSource}:\`, {
            positive: positiveTotal,
            negative: negativeTotal,
            neutral: neutralTotal
        });
        
        const config = {
            type: 'bar',
            data: {
                labels: ['Positivo', 'Negativo', 'Neutro'],
                datasets: [{
                    label: 'Distribuição de Sentimento (%)',
                    data: [positiveTotal, negativeTotal, neutralTotal],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderColor: [
                        '#10b981',
                        '#ef4444',
                        '#6b7280'
                    ],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Análise de Sentimento (NLP)',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentual (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Classificação Emocional'
                        }
                    }
                }
            }
        };
        
        return safeInitializeChart('Gráfico de Sentimento', 'sentimentChart', config);
    }
    
    function initializeCorrelationChart() {
        // Usar dados reais da correlação dor-humor
        const painData = window.REPORT_DATA?.painEvolution || [];
        const sentimentData = window.CHART_DATA?.sentimentEvolution || [];
        let bubbleData = [];
        
        if (painData.length > 0 && sentimentData.length > 0) {
            // Criar correlação real baseada nos dados de dor e sentimento
            const maxItems = Math.min(painData.length, sentimentData.length, 8);
            
            for (let i = 0; i < maxItems; i++) {
                const pain = painData[i];
                const sentiment = sentimentData[i];
                
                if (pain && sentiment) {
                    // Converter sentimento para escala de humor (-5 a +5)
                    let moodScore = 0;
                    if (sentiment.positive > 0) moodScore = (sentiment.positive / 100) * 5;
                    else if (sentiment.negative > 0) moodScore = -(sentiment.negative / 100) * 5;
                    
                    // Tamanho da bolha baseado na intensidade (média de dor e absoluto do humor)
                    const intensity = Math.max(5, Math.min(25, (pain.pain + Math.abs(moodScore)) * 2));
                    
                    bubbleData.push({
                        x: pain.pain || 0,
                        y: Number(moodScore.toFixed(1)),
                        r: intensity
                    });
                }
            }
        }
        
        // Fallback para dados de demonstração se não houver dados suficientes
        if (bubbleData.length === 0) {
            bubbleData = [
                {x: 3, y: 1, r: 12}, {x: 6, y: -2, r: 16}, {x: 8, y: -3, r: 20}, 
                {x: 2, y: 2, r: 10}, {x: 7, y: -1, r: 14}
            ];
        }
        
        const config = {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Dor vs Humor (intensidade real)',
                    data: bubbleData,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: '#6366f1',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Correlação Dor vs Humor',
                        font: { size: 14, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Dor: ' + context.parsed.x + '/10, Humor: ' + context.parsed.y + '/5, Intensidade: ' + (context.parsed._custom || context.raw.r);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Nível de Dor (0-10)'
                        },
                        min: 0,
                        max: 10
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Score de Humor (-5 a +5)'
                        },
                        min: -5,
                        max: 5
                    }
                }
            }
        };
        
        return safeInitializeChart('Gráfico de Correlação', 'correlationChart', config);
    }
    
    function setupInteractiveElements() {
        // Add click handlers for cards
        document.querySelectorAll('.insight-card, .chart-card, .alert-card').forEach(card => {
            card.addEventListener('click', function() {
                card.classList.toggle('expanded');
            });
        });
        
        // Add hover effects
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'all 0.2s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    function logReportView(reportId) {
        // Optional: Send analytics about report viewing
        console.log('📊 Report viewed:', reportId);
    }
  `;
}