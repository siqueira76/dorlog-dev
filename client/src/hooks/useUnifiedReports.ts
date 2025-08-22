import { useState, useEffect } from 'react';
import { UnifiedReportActivator } from '@/patches/unifiedReportActivator';
import { testUnifiedReport } from '@/patches/unifiedReportPatch';

interface UnifiedReportHookReturn {
  isActive: boolean;
  isReady: boolean;
  activate: () => Promise<boolean>;
  testReport: (userId: string, periods: string[], periodsText: string) => Promise<any>;
  status: string;
}

/**
 * Hook for using the unified report system
 */
export const useUnifiedReports = (): UnifiedReportHookReturn => {
  const [isActive, setIsActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Não inicializado');
  
  useEffect(() => {
    // Check initial state
    setIsActive(UnifiedReportActivator.isActive());
    
    if (UnifiedReportActivator.isActive()) {
      setStatus('Sistema ativo');
      setIsReady(true);
    } else {
      setStatus('Sistema disponível - clique para ativar');
      setIsReady(true);
    }
  }, []);
  
  const activate = async (): Promise<boolean> => {
    setStatus('Ativando...');
    setIsReady(false);
    
    try {
      const success = await UnifiedReportActivator.activate();
      
      if (success) {
        setIsActive(true);
        setStatus('Sistema ativo');
        setIsReady(true);
        return true;
      } else {
        setStatus('Erro na ativação');
        setIsReady(true);
        return false;
      }
    } catch (error) {
      console.error('Erro ao ativar sistema unificado:', error);
      setStatus('Erro na ativação');
      setIsReady(true);
      return false;
    }
  };
  
  const testReport = async (userId: string, periods: string[], periodsText: string) => {
    if (!isActive) {
      throw new Error('Sistema unificado não está ativo');
    }
    
    setStatus('Testando geração...');
    
    try {
      const result = await testUnifiedReport(userId, periods, periodsText);
      setStatus('Teste concluído');
      return result;
    } catch (error) {
      setStatus('Erro no teste');
      throw error;
    }
  };
  
  return {
    isActive,
    isReady,
    activate,
    testReport,
    status
  };
};