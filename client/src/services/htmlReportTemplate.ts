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
            ${generatePainPointsSection(reportData)}
            ${generatePainEvolutionSection(reportData)}
            ${generateMedicationsSection(reportData)}
            ${generateDoctorsSection(reportData)}
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
            /* Modern Color System */
            --primary: #1a1a1a;
            --accent: #6366f1;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            
            /* Neutral Scale */
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
            --border: var(--gray-200);
            --text: var(--gray-900);
            --text-muted: var(--gray-600);
            
            /* Spacing Scale (8px base) */
            --space-1: 0.25rem;  /* 4px */
            --space-2: 0.5rem;   /* 8px */
            --space-3: 0.75rem;  /* 12px */
            --space-4: 1rem;     /* 16px */
            --space-5: 1.25rem;  /* 20px */
            --space-6: 1.5rem;   /* 24px */
            --space-8: 2rem;     /* 32px */
            --space-10: 2.5rem;  /* 40px */
            --space-12: 3rem;    /* 48px */
            --space-16: 4rem;    /* 64px */
            
            /* Typography Scale */
            --text-xs: 0.75rem;   /* 12px */
            --text-sm: 0.875rem;  /* 14px */
            --text-base: 1rem;    /* 16px */
            --text-lg: 1.125rem;  /* 18px */
            --text-xl: 1.25rem;   /* 20px */
            --text-2xl: 1.5rem;   /* 24px */
            --text-3xl: 1.875rem; /* 30px */
            --text-4xl: 2.25rem;  /* 36px */
            
            /* Border Radius */
            --radius-sm: 0.375rem;  /* 6px */
            --radius: 0.5rem;       /* 8px */
            --radius-lg: 0.75rem;   /* 12px */
            --radius-xl: 1rem;      /* 16px */
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* MOBILE FIRST BASE STYLES */
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
            max-width: 45rem;
            margin: 0 auto;
            padding: var(--space-4);
            background: var(--background);
            min-height: 100vh;
        }

        /* HEADER - Mobile First */
        .header {
            background: var(--background);
            border-bottom: 1px solid var(--border);
            padding: var(--space-6);
            margin-bottom: var(--space-8);
            text-align: center;
        }

        .logo {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--primary);
            margin-bottom: var(--space-2);
        }

        .subtitle {
            font-size: var(--text-lg);
            color: var(--text-muted);
            margin-bottom: var(--space-5);
            font-weight: 500;
        }

        .header-info {
            font-size: var(--text-sm);
            color: var(--text-muted);
            line-height: 1.8;
        }

        .header-info p {
            margin: var(--space-2) 0;
        }

        .header-info strong {
            color: var(--text);
        }

        /* CONTENT LAYOUT */
        .content {
            padding: 0;
        }

        .section {
            margin-bottom: var(--space-8);
        }

        .section-title {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text);
            margin-bottom: var(--space-6);
            padding-bottom: var(--space-3);
            border-bottom: 2px solid var(--border);
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .section-title::before {
            content: attr(data-icon);
            font-size: 1.2em;
        }

        /* STATS GRID - Mobile First */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
            margin-bottom: var(--space-8);
        }

        .stat-card {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            text-align: center;
            position: relative;
            min-height: 44px;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--accent);
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .stat-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: var(--primary);
            display: block;
            margin-bottom: var(--space-2);
            line-height: 1.1;
        }

        .stat-label {
            font-size: var(--text-sm);
            color: var(--text-muted);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* LISTS */
        .item-list {
            list-style: none;
            display: grid;
            gap: var(--space-4);
        }

        .item {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: var(--space-5);
            min-height: 44px;
        }

        .item-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: var(--space-3);
            gap: var(--space-3);
        }

        .item-name {
            font-weight: 600;
            color: var(--text);
            font-size: var(--text-base);
            flex: 1;
        }

        .item-badge {
            background: var(--accent);
            color: white;
            padding: var(--space-1) var(--space-3);
            border-radius: var(--radius);
            font-size: var(--text-xs);
            font-weight: 500;
            flex-shrink: 0;
        }

        .item-details {
            color: var(--text-muted);
            font-size: var(--text-sm);
            line-height: 1.6;
        }

        /* PAIN CHART - Mobile First */
        .pain-chart {
            background: var(--surface);
            border-radius: var(--radius-lg);
            padding: var(--space-5);
            margin: var(--space-6) 0;
        }

        .pain-level {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
            margin-bottom: var(--space-4);
            padding: var(--space-3);
            border-radius: var(--radius);
            background: var(--background);
        }

        .date-label {
            font-weight: 500;
            color: var(--text-muted);
            font-size: var(--text-sm);
            text-align: center;
        }

        .pain-bar {
            height: 2rem;
            background: var(--gray-200);
            border-radius: var(--radius-lg);
            position: relative;
            overflow: hidden;
            min-height: 44px;
        }

        .pain-fill {
            height: 100%;
            background: var(--accent);
            border-radius: var(--radius-lg);
            transition: width 0.3s ease;
        }

        .pain-value {
            font-weight: 600;
            color: var(--text);
            font-size: var(--text-sm);
            text-align: center;
            padding: var(--space-1);
        }

        /* OBSERVATIONS */
        .observations {
            background: var(--surface);
            border-left: 4px solid var(--accent);
            padding: var(--space-6);
            border-radius: var(--radius);
            font-style: italic;
            line-height: 1.7;
            color: var(--text-muted);
        }

        /* FOOTER */
        .footer {
            margin-top: var(--space-12);
            padding-top: var(--space-8);
            border-top: 1px solid var(--border);
            text-align: center;
        }

        .footer-title {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text);
            margin-bottom: var(--space-4);
        }

        .footer-text {
            color: var(--text-muted);
            font-size: var(--text-sm);
            line-height: 1.6;
            max-width: 36rem;
            margin: 0 auto var(--space-6);
        }

        .footer-info {
            padding-top: var(--space-5);
            border-top: 1px solid var(--border);
            font-size: var(--text-xs);
            color: var(--text-muted);
            line-height: 1.8;
        }

        /* DATA SOURCE BADGE */
        .data-source {
            display: inline-flex;
            align-items: center;
            gap: var(--space-2);
            background: var(--success);
            color: white;
            padding: var(--space-2) var(--space-4);
            border-radius: var(--radius-xl);
            font-size: var(--text-xs);
            font-weight: 500;
            margin-bottom: var(--space-6);
        }

        /* RESPONSIVE BREAKPOINTS - Mobile First */
        
        /* Small tablets: 640px+ */
        @media (min-width: 640px) {
            .container {
                padding: var(--space-6);
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: var(--space-5);
            }
            
            .stat-card {
                padding: var(--space-6);
            }
            
            .stat-value {
                font-size: var(--text-3xl);
            }
            
            .pain-level {
                flex-direction: row;
                align-items: center;
            }
            
            .date-label {
                width: 6rem;
                text-align: left;
            }
            
            .pain-bar {
                margin: 0 var(--space-4);
            }
            
            .pain-value {
                width: 3rem;
                text-align: center;
            }
        }

        /* Medium tablets: 768px+ */
        @media (min-width: 768px) {
            .container {
                padding: var(--space-8);
            }
            
            .header {
                padding: var(--space-8);
            }
            
            .logo {
                font-size: var(--text-3xl);
            }
            
            .section-title {
                font-size: var(--text-2xl);
            }
            
            .item-header {
                flex-direction: row;
                align-items: center;
            }
        }

        /* Large screens: 1024px+ */
        @media (min-width: 1024px) {
            .container {
                max-width: 60rem;
                padding: var(--space-10);
            }
            
            .stats-grid {
                grid-template-columns: repeat(4, 1fr);
                gap: var(--space-6);
            }
            
            .header {
                padding: var(--space-10);
            }
            
            .logo {
                font-size: var(--text-4xl);
            }
        }

        /* Extra large: 1280px+ */
        @media (min-width: 1280px) {
            .container {
                max-width: 72rem;
            }
        }

        /* PRINT STYLES */
        @media print {
            :root {
                --background: white;
                --surface: white;
                --text: black;
                --text-muted: #666;
            }
            
            body {
                background: white;
                color: black;
            }
            
            .container {
                margin: 0;
                padding: 1rem;
                max-width: none;
                min-height: auto;
                box-shadow: none;
            }
            
            .section {
                break-inside: avoid;
            }
            
            .header {
                break-inside: avoid;
                border-bottom: 2px solid #000;
            }
            
            .stat-card {
                break-inside: avoid;
            }
        }

        /* ACCESSIBILITY */
        @media (prefers-reduced-motion: reduce) {
            * {
                transition: none !important;
                animation: none !important;
            }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
            :root {
                --border: #000;
                --text-muted: #000;
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
            <h2 class="section-title" data-icon="💊">Medicamentos Atuais</h2>
            <p class="item-details">Nenhum medicamento registrado no período.</p>
        </div>
    `;
  }

  // Agrupar medicamentos por médico
  const medicationsByDoctor = groupMedicationsByDoctor(reportData.medications);
  
  // Calcular estatísticas
  const stats = calculateMedicationStats(reportData.medications);
  
  return `
        <div class="section">
            <h2 class="section-title" data-icon="💊">Medicamentos Atuais</h2>
            ${generateMedicationStats(stats)}
            ${generateMedicationsByDoctor(medicationsByDoctor)}
            ${stats.alertaPolifarmacia ? generatePolifarmaciaWarning(stats.totalMedicamentos) : ''}
        </div>
  `;
}

function groupMedicationsByDoctor(medications: any[]) {
  const grouped: { [key: string]: any } = {};
  
  medications.forEach(med => {
    const doctorKey = med.medico || 'Médico não identificado';
    if (!grouped[doctorKey]) {
      grouped[doctorKey] = {
        medico: {
          nome: doctorKey,
          especialidade: doctorKey === 'Médico não identificado' ? 'Não informada' : ''
        },
        medicamentos: []
      };
    }
    grouped[doctorKey].medicamentos.push({
      nome: med.nome,
      posologia: med.posologia,
      frequencia: med.frequencia,
      categoria: inferMedicationCategory(med.nome)
    });
  });

  // Ordenar médicos alfabeticamente, mas "Médico não identificado" sempre por último
  return Object.entries(grouped).sort(([a], [b]) => {
    if (a === 'Médico não identificado') return 1;
    if (b === 'Médico não identificado') return -1;
    return a.localeCompare(b);
  });
}

function calculateMedicationStats(medications: any[]) {
  const categories: { [key: string]: number } = {};
  
  medications.forEach(med => {
    const category = inferMedicationCategory(med.nome);
    categories[category] = (categories[category] || 0) + 1;
  });

  const uniqueDoctors = new Set(medications.map(m => m.medico || 'Não identificado')).size;
  
  return {
    totalMedicamentos: medications.length,
    medicosEnvolvidos: uniqueDoctors,
    medicamentosPorCategoria: categories,
    alertaPolifarmacia: medications.length >= 6,
    categoriaPrincipal: Object.entries(categories).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Diversos'
  };
}

function inferMedicationCategory(nome: string): string {
  const nomeMinusculo = nome.toLowerCase();
  
  const categories: { [key: string]: string[] } = {
    'Analgésicos/Anti-inflamatórios': ['paracetamol', 'ibuprofeno', 'dipirona', 'diclofenaco', 'nimesulida', 'aspirina'],
    'Antibióticos': ['amoxicilina', 'azitromicina', 'cefalexina', 'ciprofloxacino', 'ampicilina'],
    'Cardiológicos': ['losartana', 'atenolol', 'captopril', 'enalapril', 'propranolol', 'sinvastatina'],
    'Neurológicos': ['gabapentina', 'pregabalina', 'amitriptilina', 'clonazepam', 'diazepam'],
    'Endócrinos': ['metformina', 'insulina', 'levotiroxina', 'glibenclamida'],
    'Gastroenterológicos': ['omeprazol', 'pantoprazol', 'ranitidina', 'domperidona']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => nomeMinusculo.includes(keyword))) {
      return category;
    }
  }
  
  return 'Outros';
}

function generateMedicationStats(stats: any): string {
  const statusColor = stats.alertaPolifarmacia ? 'border-red-200 bg-red-50/30' : 
                     stats.totalMedicamentos >= 4 ? 'border-yellow-200 bg-yellow-50/30' : 
                     'border-green-200 bg-green-50/30';
  
  const statusIcon = stats.alertaPolifarmacia ? '🔴' : 
                    stats.totalMedicamentos >= 4 ? '🟡' : '🟢';

  return `
        <div class="medication-overview ${statusColor}" style="border: 1px solid; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div class="overview-header" style="display: flex; align-items: center; justify-content: between; margin-bottom: 16px;">
                <h3 style="margin: 0; font-weight: 600; color: var(--text);">${statusIcon} Resumo dos Medicamentos</h3>
            </div>
            <div class="overview-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin-bottom: 16px;">
                <div class="stat-mini" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${stats.totalMedicamentos}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Total</div>
                </div>
                <div class="stat-mini" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${stats.medicosEnvolvidos}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Médicos</div>
                </div>
                <div class="stat-mini" style="text-align: center;">
                    <div style="font-size: 1rem; font-weight: 600; color: var(--text);">${stats.categoriaPrincipal}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Principal</div>
                </div>
            </div>
        </div>
  `;
}

function generateMedicationsByDoctor(medicationsByDoctor: any[]): string {
  return medicationsByDoctor.map(([doctorName, group]) => {
    const isUnidentified = doctorName === 'Médico não identificado';
    const cardStyle = isUnidentified ? 'border-dashed border-gray-300' : 'border-solid border-border';
    
    const medicationItems = group.medicamentos.map((med: any) => `
        <div class="medication-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface); border-radius: 8px; margin-bottom: 8px;">
            <div class="medication-info" style="flex: 1;">
                <div class="medication-name" style="font-weight: 600; color: var(--text); margin-bottom: 4px;">
                    ${med.nome} - ${med.posologia}
                </div>
                <div class="medication-frequency" style="font-size: 0.875rem; color: var(--text-muted);">
                    ${med.frequencia}
                </div>
            </div>
            <div class="medication-category" style="font-size: 0.75rem; padding: 4px 8px; background: var(--accent); color: white; border-radius: 12px; white-space: nowrap;">
                ${med.categoria}
            </div>
        </div>
    `).join('');

    return `
        <div class="doctor-card" style="border: 1px ${cardStyle}; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
            <div class="doctor-header" style="background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h4 style="margin: 0; font-weight: 600; color: var(--text);">
                            ${isUnidentified ? '❓' : '👨‍⚕️'} ${group.medico.nome}
                        </h4>
                        ${group.medico.especialidade ? `<p style="margin: 4px 0 0 0; font-size: 0.875rem; color: var(--text-muted);">${group.medico.especialidade}</p>` : ''}
                    </div>
                    <div class="medication-count" style="background: var(--primary); color: white; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 500;">
                        ${group.medicamentos.length} medicamento${group.medicamentos.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
            <div class="medications-list" style="padding: 16px;">
                ${medicationItems}
            </div>
        </div>
    `;
  }).join('');
}

function generatePolifarmaciaWarning(totalMedicamentos: number): string {
  return `
        <div class="polifarmacia-warning" style="border: 2px solid #ef4444; border-radius: 12px; padding: 20px; background: #fef2f2; margin-top: 24px;">
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 1.5rem;">⚠️</div>
                <div>
                    <h4 style="margin: 0 0 8px 0; color: #dc2626; font-weight: 600;">
                        Alerta: Polifarmácia Detectada
                    </h4>
                    <p style="margin: 0; font-size: 0.875rem; color: #7f1d1d; line-height: 1.5;">
                        Paciente utiliza ${totalMedicamentos} medicamentos simultaneamente. 
                        Recomenda-se revisão periódica para avaliar interações medicamentosas, 
                        adesão ao tratamento e possibilidade de simplificação do regime terapêutico.
                    </p>
                </div>
            </div>
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