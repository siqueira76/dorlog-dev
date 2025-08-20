#!/usr/bin/env node

/**
 * Script de Automação para Geração e Deploy de Relatórios HTML no Firebase Hosting
 * 
 * Este script automatiza o processo de:
 * 1. Gerar relatórios HTML para usuários
 * 2. Fazer deploy no Firebase Hosting
 * 3. Limpar arquivos locais após deploy bem-sucedido
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

// Promisify exec para usar async/await
const execAsync = util.promisify(exec);

// Configurações
const CONFIG = {
  REPORTS_DIR: './reports',
  USERS_DIR: './reports/usuarios',
  FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'dorlog-fibro-diario',
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 segundos
};

/**
 * Função para criar delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função para garantir que um diretório existe
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Diretório criado: ${dirPath}`);
  }
}

/**
 * Função para gerar template HTML de relatório
 */
function generateReportHTML(userId, reportMonth, reportData) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DorLog - Relatório Mensal ${reportMonth} - ${userId}</title>
    <link href="./assets/css/report.css" rel="stylesheet">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .report-card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #667eea;
        }
        .report-card h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 1.5em;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            display: block;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            opacity: 0.3;
            font-size: 0.8em;
            color: #999;
        }
        @media (max-width: 600px) {
            body { padding: 10px; }
            .header h1 { font-size: 2em; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DorLog</h1>
        <p>Relatório Mensal de Saúde - ${reportMonth}</p>
        <p>Usuário: ${userId}</p>
    </div>

    <div class="report-card">
        <h2>📊 Resumo Executivo</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-value">${reportData.totalDays || 0}</span>
                <span class="stat-label">Dias com Registro</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${reportData.crisisEpisodes || 0}</span>
                <span class="stat-label">Episódios de Crise</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${reportData.averagePain || 0}</span>
                <span class="stat-label">Dor Média (0-10)</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${reportData.medicationCompliance || 0}%</span>
                <span class="stat-label">Adesão Medicamentosa</span>
            </div>
        </div>
    </div>

    <div class="report-card">
        <h2>💊 Medicamentos Prescritos</h2>
        <p>Total de medicamentos em uso: <strong>${reportData.medications?.length || 0}</strong></p>
        ${reportData.medications?.map(med => 
            `<p>• <strong>${med.nome}</strong> - ${med.dosagem} (${med.frequencia}x ao dia)</p>`
        ).join('') || '<p>Nenhum medicamento registrado no período.</p>'}
    </div>

    <div class="report-card">
        <h2>👨‍⚕️ Equipe Médica</h2>
        <p>Profissionais acompanhando o caso: <strong>${reportData.doctors?.length || 0}</strong></p>
        ${reportData.doctors?.map(doc => 
            `<p>• <strong>Dr(a). ${doc.nome}</strong> - ${doc.especialidade} (CRM: ${doc.crm})</p>`
        ).join('') || '<p>Nenhum médico cadastrado.</p>'}
    </div>

    <div class="report-card">
        <h2>📈 Observações do Período</h2>
        <p>${reportData.observations || 'Este relatório foi gerado automaticamente com base nos dados coletados pelo aplicativo DorLog. Para informações mais detalhadas, consulte o aplicativo ou entre em contato com sua equipe médica.'}</p>
    </div>

    <div class="footer">
        <p>Relatório gerado automaticamente em ${currentDate}</p>
        <p><strong>DorLog</strong> - Gestão Inteligente da Sua Saúde</p>
        <p>Este documento contém informações de saúde confidenciais. Mantenha em local seguro.</p>
    </div>

    <div class="watermark">
        DorLog v1.0
    </div>

    <script src="./assets/js/report.js"></script>
</body>
</html>`;
}

/**
 * Função para executar comando com retry
 */
async function executeWithRetry(command, retries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Executando comando (tentativa ${attempt}/${retries}): ${command}`);
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('warn')) {
        console.warn(`⚠️  Warning: ${stderr}`);
      }
      
      console.log(`✅ Comando executado com sucesso:`);
      if (stdout) console.log(stdout);
      return { success: true, stdout, stderr };
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${attempt}: ${error.message}`);
      
      if (attempt === retries) {
        throw new Error(`Comando falhou após ${retries} tentativas: ${error.message}`);
      }
      
      console.log(`⏳ Aguardando ${CONFIG.RETRY_DELAY / 1000}s antes da próxima tentativa...`);
      await delay(CONFIG.RETRY_DELAY);
    }
  }
}

/**
 * Função principal para gerar e fazer deploy do relatório
 */
async function generateAndDeployReport(userId, reportMonth, reportData = {}) {
  const startTime = Date.now();
  console.log(`\n🚀 Iniciando geração de relatório para ${userId} - ${reportMonth}`);
  console.log(`⏰ Horário de início: ${new Date().toLocaleString('pt-BR')}`);
  
  try {
    // 1. Criar estrutura de diretórios
    ensureDirectoryExists(CONFIG.REPORTS_DIR);
    ensureDirectoryExists(CONFIG.USERS_DIR);
    
    // 2. Definir nome do arquivo e pasta do usuário
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9.-]/g, '_');
    const reportFileName = `report_${sanitizedUserId}_${reportMonth}.html`;
    const reportFilePath = path.join(CONFIG.USERS_DIR, reportFileName);
    
    console.log(`📄 Gerando relatório: ${reportFileName}`);
    
    // 3. Gerar conteúdo HTML
    const htmlContent = generateReportHTML(userId, reportMonth, reportData);
    
    // 4. Salvar arquivo (sobrescrever se existir)
    if (fs.existsSync(reportFilePath)) {
      console.log(`⚠️  Arquivo existente encontrado. Sobrescrevendo: ${reportFileName}`);
    }
    
    fs.writeFileSync(reportFilePath, htmlContent, 'utf8');
    console.log(`✅ Arquivo HTML salvo: ${reportFilePath}`);
    
    // 5. Fazer deploy no Firebase Hosting
    console.log(`\n🔥 Iniciando deploy no Firebase Hosting...`);
    
    const deployResult = await executeWithRetry(
      `npx firebase deploy --only hosting --project ${CONFIG.FIREBASE_PROJECT_ID}`
    );
    
    if (deployResult.success) {
      console.log(`✅ Deploy concluído com sucesso!`);
      
      // 6. Gerar URL do relatório
      const reportUrl = `https://${CONFIG.FIREBASE_PROJECT_ID}.web.app/usuarios/${reportFileName}`;
      console.log(`🔗 Relatório disponível em: ${reportUrl}`);
      
      // 7. Aguardar um pouco para garantir que o deploy foi propagado
      console.log(`⏳ Aguardando propagação do deploy...`);
      await delay(3000);
      
      // 8. Deletar arquivo local após deploy bem-sucedido
      try {
        fs.unlinkSync(reportFilePath);
        console.log(`🗑️  Arquivo local removido: ${reportFileName}`);
      } catch (deleteError) {
        console.warn(`⚠️  Aviso: Não foi possível remover o arquivo local: ${deleteError.message}`);
      }
      
      // 9. Calcular tempo total
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`\n🎉 Processo concluído com sucesso!`);
      console.log(`⏱️  Tempo total: ${totalTime}s`);
      console.log(`🔗 URL do relatório: ${reportUrl}`);
      
      return {
        success: true,
        reportUrl,
        fileName: reportFileName,
        executionTime: totalTime
      };
      
    } else {
      throw new Error('Deploy não foi concluído com sucesso');
    }
    
  } catch (error) {
    console.error(`\n💥 Erro durante o processo: ${error.message}`);
    
    // Cleanup em caso de erro
    const reportFilePath = path.join(CONFIG.USERS_DIR, `report_${userId.replace(/[^a-zA-Z0-9.-]/g, '_')}_${reportMonth}.html`);
    if (fs.existsSync(reportFilePath)) {
      try {
        fs.unlinkSync(reportFilePath);
        console.log(`🧹 Arquivo temporário removido devido ao erro`);
      } catch (cleanupError) {
        console.warn(`⚠️  Aviso: Não foi possível remover arquivo temporário: ${cleanupError.message}`);
      }
    }
    
    return {
      success: false,
      error: error.message,
      executionTime: ((Date.now() - startTime) / 1000).toFixed(2)
    };
  }
}

/**
 * Função para validar dados do relatório
 */
function validateReportData(userId, reportMonth) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('ID do usuário é obrigatório e deve ser uma string');
  }
  
  if (!reportMonth || typeof reportMonth !== 'string') {
    throw new Error('Mês do relatório é obrigatório e deve ser uma string');
  }
  
  // Validar formato do mês (deve ser algo como "2025-01" ou "Janeiro_2025")
  if (!reportMonth.match(/^\d{4}-\d{2}$/) && !reportMonth.match(/^[A-Za-z]+_\d{4}$/)) {
    console.warn(`⚠️  Formato do mês pode não ser ideal: ${reportMonth}`);
  }
}

// Função de exemplo para testar o script
async function exemploUso() {
  const dadosRelatorioDemostracao = {
    totalDays: 28,
    crisisEpisodes: 3,
    averagePain: 4.2,
    medicationCompliance: 85,
    medications: [
      { nome: 'Paracetamol', dosagem: '500mg', frequencia: 3 },
      { nome: 'Ibuprofeno', dosagem: '400mg', frequencia: 2 }
    ],
    doctors: [
      { nome: 'Maria Silva', especialidade: 'Reumatologia', crm: '12345' },
      { nome: 'João Santos', especialidade: 'Clínico Geral', crm: '67890' }
    ],
    observations: 'Período com melhora significativa da dor. Paciente apresentou boa adesão ao tratamento medicamentoso.'
  };
  
  const resultado = await generateAndDeployReport(
    'josecarlos.siqueira76@gmail.com',
    '2025-01',
    dadosRelatorioDemostracao
  );
  
  console.log('\n📋 Resultado final:', resultado);
}

// Exportar funções para uso em outros módulos
module.exports = {
  generateAndDeployReport,
  validateReportData,
  generateReportHTML,
  exemploUso
};

// Se o script for executado diretamente, rodar exemplo ou usar dados de environment
if (require.main === module) {
  const userId = process.env.REPORT_USER_ID;
  const reportMonth = process.env.REPORT_MONTH;
  const reportData = process.env.REPORT_DATA ? JSON.parse(process.env.REPORT_DATA) : null;
  
  if (userId && reportMonth) {
    console.log(`🔧 Gerando relatório para ${userId} - ${reportMonth}...\n`);
    
    const dadosRelatorio = reportData || {
      totalDays: 30,
      crisisEpisodes: 2,
      averagePain: 3.5,
      medicationCompliance: 90,
      medications: [
        { nome: 'Medicamento Exemplo', dosagem: '500mg', frequencia: 2 }
      ],
      doctors: [
        { nome: 'Dr. Exemplo', especialidade: 'Especialidade', crm: 'CRM/00000' }
      ],
      observations: 'Relatório gerado automaticamente pelo sistema DorLog.'
    };
    
    generateAndDeployReport(userId, reportMonth, dadosRelatorio).catch(console.error);
  } else {
    console.log('🔧 Executando exemplo de uso...\n');
    exemploUso().catch(console.error);
  }
}