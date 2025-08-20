#!/usr/bin/env node

/**
 * Test Script for Firebase Hosting Report Generation
 * Este script testa a geração de relatório sem fazer deploy
 */

const { generateReportHTML } = require('./generate_and_send_report.cjs');
const fs = require('fs');
const path = require('path');

// Dados de teste
const testReportData = {
  totalDays: 25,
  crisisEpisodes: 2,
  averagePain: 3.8,
  medicationCompliance: 88,
  medications: [
    { nome: 'Paracetamol', dosagem: '500mg', frequencia: 3 },
    { nome: 'Ibuprofeno', dosagem: '400mg', frequencia: 2 },
    { nome: 'Tramadol', dosagem: '50mg', frequencia: 1 }
  ],
  doctors: [
    { nome: 'Dra. Ana Silva', especialidade: 'Reumatologia', crm: '12345-SP' },
    { nome: 'Dr. Carlos Santos', especialidade: 'Clínica Geral', crm: '67890-SP' }
  ],
  observations: 'Período com boa adesão ao tratamento. Paciente relata melhora significativa da dor matinal. Recomenda-se continuidade do tratamento atual e acompanhamento quinzenal.'
};

function testReportGeneration() {
  console.log('🧪 Testando geração de relatório HTML...\n');
  
  try {
    // Gerar HTML
    const htmlContent = generateReportHTML(
      'teste@dorlog.com.br',
      'Janeiro_2025',
      testReportData
    );
    
    // Salvar arquivo de teste
    const testFile = path.join(__dirname, 'reports', 'usuarios', 'test-report.html');
    fs.writeFileSync(testFile, htmlContent, 'utf8');
    
    console.log('✅ Relatório HTML gerado com sucesso!');
    console.log('📄 Arquivo salvo em:', testFile);
    console.log('📊 Dados incluídos:');
    console.log(`   • ${testReportData.totalDays} dias de registro`);
    console.log(`   • ${testReportData.crisisEpisodes} episódios de crise`);
    console.log(`   • ${testReportData.medications.length} medicamentos`);
    console.log(`   • ${testReportData.doctors.length} médicos`);
    console.log(`   • Dor média: ${testReportData.averagePain}`);
    console.log(`   • Adesão: ${testReportData.medicationCompliance}%`);
    
    console.log('\n🔗 Para visualizar:');
    console.log(`   • Abra o arquivo: ${testFile}`);
    console.log(`   • Ou use um servidor HTTP local`);
    
    console.log('\n📋 Estrutura de arquivos:');
    const reportsDir = path.join(__dirname, 'reports');
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir, { withFileTypes: true });
      files.forEach(file => {
        if (file.isDirectory()) {
          console.log(`   📁 ${file.name}/`);
          const subFiles = fs.readdirSync(path.join(reportsDir, file.name));
          subFiles.forEach(subFile => {
            if (subFile !== '.gitkeep') {
              console.log(`      📄 ${subFile}`);
            }
          });
        } else {
          console.log(`   📄 ${file.name}`);
        }
      });
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar teste
testReportGeneration();