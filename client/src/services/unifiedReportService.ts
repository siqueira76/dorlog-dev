import { fetchUserReportData, ReportData } from './firestoreDataService';
import { generateCompleteReportHTML, ReportTemplateData } from './htmlReportTemplate';
import { uploadReportToStorage, generateReportId, generatePasswordHash } from './firebaseStorageService';

export interface UnifiedReportOptions {
  userId: string;
  periods: string[];
  periodsText: string;
  withPassword?: boolean;
  password?: string;
}

export interface UnifiedReportResult {
  success: boolean;
  reportUrl?: string;
  fileName?: string;
  reportId?: string;
  executionTime?: string;
  error?: string;
  message?: string;
}

/**
 * Unified report generation service - works in both Replit and GitHub Pages
 * Generates HTML with real Firestore data and uploads to Firebase Storage
 */
export class UnifiedReportService {
  
  /**
   * Generate report with real data and upload to Firebase Storage
   */
  static async generateReport(options: UnifiedReportOptions): Promise<UnifiedReportResult> {
    const startTime = Date.now();
    console.log(`🚀 Iniciando geração de relatório unificado para ${options.userId}...`);
    console.log(`📅 Períodos: ${options.periodsText} (${options.periods.length} período(s))`);
    
    try {
      // 1. Generate unique report ID
      const reportId = generateReportId(options.userId);
      console.log(`🆔 Report ID gerado: ${reportId}`);
      
      // 2. Fetch real data from Firestore
      console.log(`🔍 Buscando dados reais do Firestore...`);
      const reportData = await fetchUserReportData(options.userId, options.periods);
      console.log(`✅ Dados coletados:`, {
        totalDays: reportData.totalDays,
        crisisEpisodes: reportData.crisisEpisodes,
        medicationsCount: reportData.medications.length,
        doctorsCount: reportData.doctors.length
      });
      
      // 3. Prepare template data
      const templateData: ReportTemplateData = {
        userEmail: options.userId,
        periodsText: options.periodsText,
        reportData,
        reportId,
        withPassword: options.withPassword || false,
        passwordHash: options.password ? generatePasswordHash(options.password) : undefined
      };
      
      // 4. Generate complete HTML
      console.log(`📝 Gerando HTML completo...`);
      const htmlContent = generateCompleteReportHTML(templateData);
      console.log(`✅ HTML gerado: ${Math.round(htmlContent.length / 1024)}KB`);
      
      // 5. Upload to Firebase Storage
      console.log(`☁️ Fazendo upload para Firebase Storage...`);
      const uploadResult = await uploadReportToStorage(htmlContent, reportId);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Falha no upload');
      }
      
      // 6. Calculate execution time
      const executionTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
      
      console.log(`🎉 Relatório gerado com sucesso!`);
      console.log(`⏱️ Tempo total: ${executionTime}`);
      console.log(`🔗 URL: ${uploadResult.downloadUrl}`);
      
      return {
        success: true,
        reportUrl: uploadResult.downloadUrl,
        fileName: uploadResult.fileName,
        reportId,
        executionTime,
        message: 'Relatório gerado com dados reais do Firestore e armazenado no Firebase Storage'
      };
      
    } catch (error) {
      const executionTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
      
      console.error('❌ Erro na geração do relatório:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime
      };
    }
  }
  
  /**
   * Check if all required services are properly configured
   */
  static checkConfiguration(): { isReady: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      // Check Firebase configuration - check if imported modules are available
      if (!db || !storage) {
        issues.push('Firebase não está inicializado completamente');
      }
      
      // Check Firestore access
      if (!db) {
        issues.push('Firestore não está acessível');
      }
      
      // Check Firebase Storage
      if (!storage) {
        issues.push('Firebase Storage não está configurado');
      }
      
      return {
        isReady: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      return {
        isReady: false,
        issues
      };
    }
  }
  
  /**
   * Generate a simple report for testing (without upload)
   */
  static async generateTestReport(options: UnifiedReportOptions): Promise<string> {
    console.log(`🧪 Gerando relatório de teste...`);
    
    const reportId = generateReportId(options.userId);
    const reportData = await fetchUserReportData(options.userId, options.periods);
    
    const templateData: ReportTemplateData = {
      userEmail: options.userId,
      periodsText: options.periodsText,
      reportData,
      reportId
    };
    
    return generateCompleteReportHTML(templateData);
  }
}

// Import Firebase dependencies (they need to be available)
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase';