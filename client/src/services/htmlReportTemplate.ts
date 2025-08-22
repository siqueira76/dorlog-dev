import { ReportData } from './firestoreDataService';

export interface ReportTemplateData {
  userEmail: string;
  periodsText: string;
  reportData: ReportData;
  reportId: string;
  withPassword?: boolean;
  passwordHash?: string;
}

/**
 * Gera HTML completo do relatório com CSS e JS inline
 */
export function generateCompleteReportHTML(data: ReportTemplateData): string {
  const { userEmail, periodsText, reportData, reportId, withPassword, passwordHash } = data;
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🩺 DorLog - Relatório de Saúde - ${periodsText}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
${getReportCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${generateReportHeader(userEmail, periodsText, reportData)}
        
        <div class="content">
            ${generateStatsSection(reportData)}
            ${generateMedicationsSection(reportData)}
            ${generateDoctorsSection(reportData)}
            ${generatePainPointsSection(reportData)}
            ${generatePainEvolutionSection(reportData)}
            ${generateObservationsSection(reportData)}
            ${generateFooterSection(reportId, reportData)}
        </div>
    </div>

    <script>
${getReportJavaScript(withPassword, passwordHash, reportId)}
    </script>
</body>
</html>`;
}

function getReportCSS(): string {
  return `
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
            --gradient-primary: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            --gradient-secondary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--light-bg);
            font-size: 14px;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
            min-height: 297mm;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        /* Header */
        .header {
            background: var(--gradient-primary);
            color: white;
            padding: 40px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
            text-align: center;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
            transform: translate(50px, -50px);
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }

        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 20px;
            position: relative;
            z-index: 2;
        }

        .header-info {
            position: relative;
            z-index: 2;
            font-size: 0.95rem;
        }

        .header-info p {
            margin: 5px 0;
        }

        /* Content */
        .content {
            padding: 0 10px;
        }

        .section {
            margin-bottom: 40px;
            break-inside: avoid;
        }

        .section-title {
            font-size: 1.5rem;
            color: var(--text-primary);
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid var(--primary-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: attr(data-icon);
            font-size: 1.2em;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px 24px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-color);
        }

        .stat-value {
            font-size: 2.8rem;
            font-weight: 700;
            color: var(--primary-color);
            display: block;
            margin-bottom: 8px;
            line-height: 1;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Lists */
        .item-list {
            list-style: none;
            padding: 0;
            display: grid;
            gap: 15px;
        }

        .item {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: box-shadow 0.2s ease;
        }

        .item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .item-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .item-name {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 1.1rem;
        }

        .item-badge {
            background: var(--primary-color);
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .item-details {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
        }

        /* Pain Evolution Chart */
        .pain-chart {
            background: var(--light-bg);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }

        .pain-level {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px;
            border-radius: 8px;
            background: white;
        }

        .date-label {
            width: 100px;
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 0.85rem;
        }

        .pain-bar {
            flex: 1;
            height: 28px;
            background: var(--border-color);
            border-radius: 14px;
            margin: 0 15px;
            position: relative;
            overflow: hidden;
        }

        .pain-fill {
            height: 100%;
            border-radius: 14px;
            background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
            transition: width 0.3s ease;
            position: relative;
        }

        .pain-value {
            font-weight: 600;
            width: 35px;
            text-align: center;
            font-size: 0.9rem;
        }

        /* Observations */
        .observations {
            background: var(--light-bg);
            border-left: 4px solid var(--primary-color);
            padding: 25px;
            border-radius: 8px;
            font-style: italic;
            line-height: 1.7;
        }

        /* Footer */
        .footer {
            margin-top: 50px;
            padding: 30px 0;
            border-top: 2px solid var(--border-color);
            text-align: center;
        }

        .footer-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 10px;
        }

        .footer-text {
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
        }

        .footer-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        /* Data Source Badge */
        .data-source {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--success-color);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 20px;
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
            }
            
            .container {
                margin: 0;
                padding: 15px;
                max-width: none;
                box-shadow: none;
                min-height: auto;
            }
            
            .stat-card:hover {
                transform: none;
            }
            
            .section {
                break-inside: avoid;
            }
            
            .header {
                break-inside: avoid;
            }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .stat-card {
                padding: 20px;
            }
            
            .stat-value {
                font-size: 2.2rem;
            }
        }
`;
}

function generateReportHeader(userEmail: string, periodsText: string, reportData: ReportData): string {
  return `
        <div class="header">
            <h1 class="logo">🩺 DorLog</h1>
            <p class="subtitle">Relatório de Saúde Detalhado</p>
            <div class="header-info">
                <p><strong>📅 Período:</strong> ${periodsText}</p>
                <p><strong>👤 Paciente:</strong> ${userEmail}</p>
                <p><strong>📊 Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
            </div>
        </div>
        
        <div class="data-source">
            <span>✅</span>
            <span>Dados reais do Firestore</span>
        </div>
  `;
}

function generateStatsSection(reportData: ReportData): string {
  return `
        <div class="section">
            <h2 class="section-title" data-icon="📊">Estatísticas Gerais</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-value">${reportData.totalDays}</span>
                    <span class="stat-label">Dias Monitorados</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${reportData.crisisEpisodes}</span>
                    <span class="stat-label">Episódios de Crise</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${reportData.adherenceRate}%</span>
                    <span class="stat-label">Taxa de Adesão</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${reportData.averagePain}</span>
                    <span class="stat-label">Dor Média (0-10)</span>
                </div>
            </div>
        </div>
  `;
}

function generateMedicationsSection(reportData: ReportData): string {
  if (reportData.medications.length === 0) {
    return `
        <div class="section">
            <h2 class="section-title" data-icon="💊">Medicamentos</h2>
            <p class="item-details">Nenhum medicamento registrado no período.</p>
        </div>
    `;
  }

  const medicationItems = reportData.medications.map(med => `
        <li class="item">
            <div class="item-header">
                <div class="item-name">${med.nome}</div>
                <div class="item-badge">${med.frequencia}x/dia</div>
            </div>
            <div class="item-details">
                <strong>Dosagem:</strong> ${med.dosagem}<br>
                ${med.medico ? `<strong>Prescrito por:</strong> ${med.medico}` : ''}
            </div>
        </li>
  `).join('');

  return `
        <div class="section">
            <h2 class="section-title" data-icon="💊">Medicamentos</h2>
            <ul class="item-list">
                ${medicationItems}
            </ul>
        </div>
  `;
}

function generateDoctorsSection(reportData: ReportData): string {
  if (reportData.doctors.length === 0) {
    return `
        <div class="section">
            <h2 class="section-title" data-icon="👨‍⚕️">Equipe Médica</h2>
            <p class="item-details">Nenhum médico registrado.</p>
        </div>
    `;
  }

  const doctorItems = reportData.doctors.map(doctor => `
        <li class="item">
            <div class="item-header">
                <div class="item-name">Dr(a). ${doctor.nome}</div>
                <div class="item-badge">${doctor.especialidade}</div>
            </div>
            <div class="item-details">
                <strong>CRM:</strong> ${doctor.crm}<br>
                ${doctor.contato ? `<strong>Contato:</strong> ${doctor.contato}` : ''}
            </div>
        </li>
  `).join('');

  return `
        <div class="section">
            <h2 class="section-title" data-icon="👨‍⚕️">Equipe Médica</h2>
            <ul class="item-list">
                ${doctorItems}
            </ul>
        </div>
  `;
}

function generatePainPointsSection(reportData: ReportData): string {
  if (reportData.painPoints.length === 0) {
    return `
        <div class="section">
            <h2 class="section-title" data-icon="📍">Pontos de Dor</h2>
            <p class="item-details">Nenhum ponto de dor mapeado no período.</p>
        </div>
    `;
  }

  const painPointItems = reportData.painPoints.slice(0, 10).map(point => `
        <li class="item">
            <div class="item-header">
                <div class="item-name">${point.local}</div>
                <div class="item-badge">${point.occurrences} ocorrência${point.occurrences !== 1 ? 's' : ''}</div>
            </div>
        </li>
  `).join('');

  return `
        <div class="section">
            <h2 class="section-title" data-icon="📍">Pontos de Dor Mais Frequentes</h2>
            <ul class="item-list">
                ${painPointItems}
            </ul>
        </div>
  `;
}

function generatePainEvolutionSection(reportData: ReportData): string {
  if (reportData.painEvolution.length === 0) {
    return `
        <div class="section">
            <h2 class="section-title" data-icon="📈">Evolução da Dor</h2>
            <p class="item-details">Nenhum registro de evolução da dor no período.</p>
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
        <div class="pain-level">
            <div class="date-label">${formattedDate}</div>
            <div class="pain-bar">
                <div class="pain-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="pain-value">${average.toFixed(1)}</div>
        </div>
      `;
    }).join('');

  return `
        <div class="section">
            <h2 class="section-title" data-icon="📈">Evolução da Dor (Últimos 14 dias)</h2>
            <div class="pain-chart">
                ${chartItems}
            </div>
        </div>
  `;
}

function generateObservationsSection(reportData: ReportData): string {
  return `
        <div class="section">
            <h2 class="section-title" data-icon="📝">Observações</h2>
            <div class="observations">
                ${reportData.observations}
            </div>
        </div>
  `;
}

function generateFooterSection(reportId: string, reportData: ReportData): string {
  return `
        <div class="footer">
            <h3 class="footer-title">DorLog - Diário de Dor e Saúde</h3>
            <p class="footer-text">
                Este relatório foi gerado automaticamente com base nos dados registrados no aplicativo DorLog. 
                As informações contidas neste documento são de caráter informativo e não substituem 
                a consulta médica profissional.
            </p>
            <div class="footer-info">
                <p><strong>ID do Relatório:</strong> ${reportId}</p>
                <p><strong>Fonte dos Dados:</strong> ${reportData.dataSource}</p>
                <p><strong>Gerado em:</strong> <span id="generation-time">${new Date().toLocaleString('pt-BR')}</span></p>
                <p><strong>Acessado em:</strong> <span id="access-time"></span></p>
            </div>
        </div>
  `;
}

function getReportJavaScript(withPassword?: boolean, passwordHash?: string, reportId?: string): string {
  return `
        // Initialize report
        document.addEventListener('DOMContentLoaded', function() {
            // Set access time
            document.getElementById('access-time').textContent = new Date().toLocaleString('pt-BR');
            
            // Initialize print functionality
            initializePrint();
            
            ${withPassword && passwordHash ? `
            // Password protection
            checkReportAccess('${passwordHash}');
            ` : ''}
        });

        function initializePrint() {
            // Optimize for printing
            window.addEventListener('beforeprint', function() {
                document.body.classList.add('printing');
            });
            
            window.addEventListener('afterprint', function() {
                document.body.classList.remove('printing');
            });
            
            // Add print button functionality (if exists)
            const printBtn = document.getElementById('print-btn');
            if (printBtn) {
                printBtn.addEventListener('click', function() {
                    window.print();
                });
            }
        }

        ${withPassword && passwordHash ? `
        function checkReportAccess(expectedHash) {
            const stored = sessionStorage.getItem('dorlog_report_access_${reportId || 'unknown'}');
            if (stored === expectedHash) return true;
            
            const password = prompt('🔒 Este relatório está protegido.\\n\\nDigite a senha para continuar:');
            if (!password) {
                document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h2>🚫 Acesso Negado</h2><p>Senha necessária para visualizar este relatório.</p></div>';
                return false;
            }
            
            const hash = btoa(password);
            if (hash === expectedHash) {
                sessionStorage.setItem('dorlog_report_access_${reportId || 'unknown'}', hash);
                return true;
            } else {
                alert('❌ Senha incorreta!');
                setTimeout(() => {
                    window.close();
                }, 1000);
                return false;
            }
        }
        ` : ''}

        // Utility functions
        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('pt-BR');
        }

        // Analytics (if needed)
        console.log('📊 DorLog Report loaded successfully');
        console.log('📅 Report ID: ${reportId || 'unknown'}');
        console.log('⏰ Generated at: ${new Date().toISOString()}');
  `;
}