/**
 * Serviço Unificado Enhanced para Relatórios DorLog
 * 
 * Integra análise NLP, visualizações avançadas e insights preditivos
 * com o sistema de relatórios existente. Mantém compatibilidade total.
 */

import { UnifiedReportService, UnifiedReportOptions, UnifiedReportResult } from './unifiedReportService';
import { fetchUserReportData } from './firestoreDataService';
import { EnhancedReportAnalysisService, EnhancedReportData } from './enhancedReportAnalysisService';
import { generateEnhancedReportHTML, EnhancedReportTemplateData } from './enhancedHtmlTemplate';
import { uploadReportToStorage, generateReportId, generatePasswordHash } from './firebaseStorageService';

export interface EnhancedReportOptions extends UnifiedReportOptions {
  useEnhancedAnalysis?: boolean;
  includeNLPInsights?: boolean;
  includeVisualizationCharts?: boolean;
  includePredictiveAlerts?: boolean;
  textResponses?: string[]; // Textos livres para análise NLP
}

export interface EnhancedReportResult extends UnifiedReportResult {
  analysisType?: 'standard' | 'enhanced';
  nlpProcessed?: boolean;
  chartsGenerated?: boolean;
  alertsGenerated?: number;
  enhancedFeatures?: {
    sentimentAnalysis: boolean;
    patternDetection: boolean;
    predictiveAlerts: boolean;
    visualizations: boolean;
  };
}

/**
 * Serviço Enhanced que estende o UnifiedReportService
 */
export class EnhancedUnifiedReportService {
  
  /**
   * Gera relatório enhanced com todas as funcionalidades avançadas
   */
  static async generateEnhancedReport(options: EnhancedReportOptions): Promise<EnhancedReportResult> {
    const startTime = Date.now();
    console.log(`🧠 Iniciando geração de relatório enhanced para ${options.userId}...`);
    
    try {
      // 1. Validar se enhanced features estão habilitadas
      const useEnhanced = options.useEnhancedAnalysis !== false; // Default true
      
      if (!useEnhanced) {
        console.log('📄 Fallback para relatório padrão');
        return this.generateStandardReport(options);
      }
      
      // 2. Gerar ID único e buscar dados básicos
      const reportId = generateReportId(options.userId);
      console.log(`🆔 Report Enhanced ID: ${reportId}`);
      
      // 3. Buscar dados reais do Firestore
      console.log(`🔍 Coletando dados do Firestore...`);
      const baseReportData = await fetchUserReportData(options.userId, options.periods);
      
      // 4. Aplicar análise enhanced se houver textos para processar
      let enhancedData: EnhancedReportData = baseReportData;
      let nlpProcessed = false;
      
      if (options.includeNLPInsights !== false && options.textResponses && options.textResponses.length > 0) {
        console.log(`🧠 Processando análise NLP de ${options.textResponses.length} textos...`);
        try {
          enhancedData = await EnhancedReportAnalysisService.enhanceReportData(
            baseReportData, 
            options.textResponses
          );
          nlpProcessed = true;
          console.log(`✅ Análise NLP concluída`);
        } catch (error) {
          console.warn('⚠️ Falha na análise NLP, continuando com dados básicos:', error);
        }
      }
      
      // 5. Preparar dados do template enhanced
      const templateData: EnhancedReportTemplateData = {
        userEmail: options.userId,
        periodsText: options.periodsText,
        reportData: enhancedData,
        reportId,
        withPassword: options.withPassword || false,
        passwordHash: options.password ? generatePasswordHash(options.password) : undefined
      };
      
      // 6. Gerar HTML enhanced
      console.log(`🎨 Gerando template HTML enhanced...`);
      const htmlContent = generateEnhancedReportHTML(templateData);
      console.log(`✅ HTML enhanced gerado: ${Math.round(htmlContent.length / 1024)}KB`);
      
      // 7. Upload para Firebase Storage
      console.log(`☁️ Fazendo upload para Firebase Storage...`);
      const uploadResult = await uploadReportToStorage(htmlContent, reportId);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Falha no upload');
      }
      
      // 8. Calcular métricas de execução
      const executionTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
      const alertsCount = enhancedData.smartSummary?.predictiveAlerts?.length || 0;
      
      console.log(`🎉 Relatório enhanced gerado com sucesso!`);
      console.log(`⏱️ Tempo total: ${executionTime}`);
      console.log(`🔗 URL: ${uploadResult.downloadUrl}`);
      console.log(`📊 Features: NLP=${nlpProcessed}, Alertas=${alertsCount}`);
      
      return {
        success: true,
        reportUrl: uploadResult.downloadUrl,
        fileName: uploadResult.fileName,
        reportId,
        executionTime,
        analysisType: 'enhanced',
        nlpProcessed,
        chartsGenerated: true,
        alertsGenerated: alertsCount,
        enhancedFeatures: {
          sentimentAnalysis: nlpProcessed,
          patternDetection: nlpProcessed,
          predictiveAlerts: alertsCount > 0,
          visualizations: true
        },
        message: `Relatório enhanced gerado com ${nlpProcessed ? 'análise NLP' : 'dados básicos'} e ${alertsCount} alertas preditivos`
      };
      
    } catch (error) {
      const executionTime = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
      
      console.error('❌ Erro na geração enhanced, tentando fallback:', error);
      
      // Fallback para relatório padrão em caso de erro
      try {
        return await this.generateStandardReportFallback(options, executionTime);
      } catch (fallbackError) {
        console.error('❌ Falha completa no fallback:', fallbackError);
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido na geração enhanced',
          executionTime,
          analysisType: 'enhanced'
        };
      }
    }
  }
  
  /**
   * Gera relatório padrão (fallback)
   */
  private static async generateStandardReport(options: EnhancedReportOptions): Promise<EnhancedReportResult> {
    const standardOptions: UnifiedReportOptions = {
      userId: options.userId,
      periods: options.periods,
      periodsText: options.periodsText,
      withPassword: options.withPassword,
      password: options.password
    };
    
    const result = await UnifiedReportService.generateReport(standardOptions);
    
    return {
      ...result,
      analysisType: 'standard',
      nlpProcessed: false,
      chartsGenerated: false,
      alertsGenerated: 0,
      enhancedFeatures: {
        sentimentAnalysis: false,
        patternDetection: false,
        predictiveAlerts: false,
        visualizations: false
      }
    };
  }
  
  /**
   * Fallback para relatório padrão em caso de erro no enhanced
   */
  private static async generateStandardReportFallback(
    options: EnhancedReportOptions, 
    executionTime: string
  ): Promise<EnhancedReportResult> {
    console.log('🔄 Executando fallback para relatório padrão...');
    
    const fallbackResult = await this.generateStandardReport(options);
    
    return {
      ...fallbackResult,
      executionTime,
      message: 'Relatório gerado em modo padrão (fallback do enhanced)'
    };
  }
  
  /**
   * Verifica se o sistema enhanced está pronto
   */
  static checkEnhancedConfiguration(): { 
    isReady: boolean; 
    issues: string[]; 
    features: {
      nlpAvailable: boolean;
      chartsAvailable: boolean;
      storageAvailable: boolean;
    };
  } {
    const issues: string[] = [];
    
    // Verificar sistema base
    const baseCheck = UnifiedReportService.checkConfiguration();
    if (!baseCheck.isReady) {
      issues.push(...baseCheck.issues);
    }
    
    // Verificar NLP
    let nlpAvailable = true;
    try {
      // Verificar se o serviço NLP pode ser importado
      import('./nlpAnalysisService').then(() => {
        console.log('✅ NLP Service disponível');
      }).catch(() => {
        nlpAvailable = false;
        issues.push('Serviço NLP não disponível');
      });
    } catch (error) {
      nlpAvailable = false;
      issues.push('Erro ao verificar NLP Service');
    }
    
    return {
      isReady: issues.length === 0,
      issues,
      features: {
        nlpAvailable,
        chartsAvailable: true, // Charts são sempre disponíveis (Chart.js via CDN)
        storageAvailable: baseCheck.isReady
      }
    };
  }
  
  /**
   * Gera relatório de teste enhanced (sem upload)
   */
  static async generateEnhancedTestReport(options: EnhancedReportOptions): Promise<string> {
    console.log(`🧪 Gerando relatório enhanced de teste...`);
    
    const reportId = generateReportId(options.userId);
    const baseData = await fetchUserReportData(options.userId, options.periods);
    
    // Aplicar análise enhanced se possível
    let enhancedData: EnhancedReportData = baseData;
    if (options.textResponses && options.textResponses.length > 0) {
      try {
        enhancedData = await EnhancedReportAnalysisService.enhanceReportData(
          baseData, 
          options.textResponses
        );
      } catch (error) {
        console.warn('Usando dados básicos para teste:', error);
      }
    }
    
    const templateData: EnhancedReportTemplateData = {
      userEmail: options.userId,
      periodsText: options.periodsText,
      reportData: enhancedData,
      reportId
    };
    
    return generateEnhancedReportHTML(templateData);
  }
  
  /**
   * Utilitário para extrair textos de respostas de quizzes
   */
  static extractTextResponsesFromReportData(reportData: any): string[] {
    const texts: string[] = [];
    
    try {
      // Extrair observações gerais
      if (reportData.observations && typeof reportData.observations === 'string') {
        texts.push(reportData.observations);
      }
      
      // Extrair textos de painEvolution se houver contexto
      if (reportData.painEvolution) {
        reportData.painEvolution.forEach((pain: any) => {
          if (pain.context && typeof pain.context === 'string') {
            texts.push(pain.context);
          }
        });
      }
      
      // Tentar extrair de outras fontes de texto livre
      if (reportData.textualResponses && Array.isArray(reportData.textualResponses)) {
        texts.push(...reportData.textualResponses.filter((t: any) => typeof t === 'string'));
      }
      
    } catch (error) {
      console.warn('Erro ao extrair textos:', error);
    }
    
    return texts.filter(text => text && text.trim().length > 5);
  }
  
  /**
   * Método de conveniência para gerar relatório com auto-detecção de features
   */
  static async generateIntelligentReport(options: UnifiedReportOptions): Promise<EnhancedReportResult> {
    console.log(`🤖 Gerando relatório inteligente com auto-detecção...`);
    
    try {
      // 1. Buscar dados básicos para análise
      const baseData = await fetchUserReportData(options.userId, options.periods);
      
      // 2. Auto-detectar textos disponíveis
      const extractedTexts = this.extractTextResponsesFromReportData(baseData);
      
      // 3. Determinar se usar enhanced baseado na disponibilidade de dados
      const useEnhanced = extractedTexts.length >= 2 || baseData.totalDays > 7;
      
      console.log(`📊 Auto-detecção: Enhanced=${useEnhanced}, Textos=${extractedTexts.length}, Dias=${baseData.totalDays}`);
      
      // 4. Configurar opções enhanced
      const enhancedOptions: EnhancedReportOptions = {
        ...options,
        useEnhancedAnalysis: useEnhanced,
        includeNLPInsights: extractedTexts.length > 0,
        includeVisualizationCharts: useEnhanced,
        includePredictiveAlerts: useEnhanced && baseData.totalDays > 5,
        textResponses: extractedTexts
      };
      
      // 5. Gerar relatório apropriado
      return await this.generateEnhancedReport(enhancedOptions);
      
    } catch (error) {
      console.error('❌ Erro no relatório inteligente:', error);
      
      // Fallback para relatório padrão
      const result = await UnifiedReportService.generateReport(options);
      return {
        ...result,
        analysisType: 'standard',
        nlpProcessed: false,
        chartsGenerated: false,
        alertsGenerated: 0
      };
    }
  }
}