import { UnifiedReportService, UnifiedReportOptions } from '@/services/unifiedReportService';

/**
 * New unified patch that replaces githubPagesFix.ts
 * Works in both Replit and GitHub Pages environments
 * Uses real Firestore data and Firebase Storage
 */
export const patchApiCallsUnified = () => {
  console.log('🔄 Aplicando patch unificado para geração de relatórios...');
  
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch globally
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Intercept generate-monthly-report API calls
    if (url.includes('/api/generate-monthly-report') && init?.method === 'POST') {
      console.log('🔄 Patch Unificado: Interceptando chamada para geração de relatório...');
      
      try {
        const body = JSON.parse(init.body as string);
        const { userId, periods, periodsText } = body;
        
        console.log(`📋 Gerando relatório unificado:`, { userId, periodsText, periodsCount: periods.length });
        
        // Use unified report service
        const options: UnifiedReportOptions = {
          userId,
          periods,
          periodsText
        };
        
        const result = await UnifiedReportService.generateReport(options);
        
        if (result.success) {
          // Open report in new tab
          if (result.reportUrl) {
            window.open(result.reportUrl, '_blank');
          }
          
          // Return success response (compatible with existing code)
          return new Response(JSON.stringify({
            success: true,
            reportUrl: result.reportUrl,
            fileName: result.fileName,
            executionTime: result.executionTime,
            message: result.message,
            dataSource: 'firestore',
            storageProvider: 'firebase_storage',
            environment: 'unified_client_side'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error(result.error || 'Falha na geração do relatório');
        }
        
      } catch (error) {
        console.error('❌ Erro no patch unificado:', error);
        
        return new Response(JSON.stringify({
          success: false,
          error: `Erro na geração do relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          environment: 'unified_client_side'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For all other requests, use original fetch
    return originalFetch(input, init);
  };
  
  console.log('✅ Patch unificado aplicado com sucesso');
};

/**
 * Check if unified report service is ready
 */
export const checkUnifiedReportReadiness = (): boolean => {
  const config = UnifiedReportService.checkConfiguration();
  
  if (config.isReady) {
    console.log('✅ Serviço de relatório unificado pronto');
    return true;
  } else {
    console.warn('⚠️ Problemas na configuração do serviço unificado:', config.issues);
    return false;
  }
};

/**
 * Test function for unified report generation
 */
export const testUnifiedReport = async (userId: string, periods: string[], periodsText: string) => {
  console.log('🧪 Testando geração de relatório unificado...');
  
  try {
    const result = await UnifiedReportService.generateReport({
      userId,
      periods,
      periodsText
    });
    
    if (result.success) {
      console.log('✅ Teste bem-sucedido:', result);
    } else {
      console.error('❌ Teste falhou:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
};