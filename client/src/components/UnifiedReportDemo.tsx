import React from 'react';
import { useUnifiedReports } from '@/hooks/useUnifiedReports';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Play, TestTube } from 'lucide-react';

/**
 * Demo component for the new unified report system
 * This shows how to use the new approach without affecting existing functionality
 */
export const UnifiedReportDemo: React.FC = () => {
  const { currentUser, firebaseUser } = useAuth();
  const { isActive, isReady, activate, testReport, status } = useUnifiedReports();
  
  const handleActivate = async () => {
    const success = await activate();
    if (success) {
      console.log('✅ Sistema unificado ativado!');
    } else {
      console.error('❌ Falha ao ativar sistema unificado');
    }
  };
  
  const handleTestReport = async () => {
    if (!firebaseUser?.uid) return;
    
    // Example periods for testing
    const testPeriods = ['2025-08-15_2025-08-22'];
    const testPeriodsText = '15/08/2025 - 22/08/2025';
    
    try {
      const result = await testReport(firebaseUser.uid, testPeriods, testPeriodsText);
      console.log('🎉 Relatório teste gerado:', result);
      
      if (result.success && result.reportUrl) {
        window.open(result.reportUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🆕 Sistema de Relatórios Unificado
          {isActive && <Badge variant="default" className="bg-green-500">Ativo</Badge>}
          {!isActive && <Badge variant="secondary">Inativo</Badge>}
        </CardTitle>
        <CardDescription>
          Nova abordagem que funciona tanto no Replit quanto GitHub Pages,
          com dados reais do Firestore e armazenamento no Firebase Storage.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50">
          {isActive ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          )}
          <span className="font-medium">Status:</span>
          <span>{status}</span>
        </div>
        
        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold">Recursos do Sistema Unificado:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Dados reais do Firestore (não mock)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Upload direto para Firebase Storage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>URLs públicas permanentes (TTL: 7 dias)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Arquivo HTML único (CSS + JS inline)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Compatível com Replit e GitHub Pages</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Limpeza automática após 7 dias</span>
            </li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!isActive && (
            <Button 
              onClick={handleActivate}
              disabled={!isReady}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Ativar Sistema Unificado
            </Button>
          )}
          
          {isActive && firebaseUser?.uid && (
            <Button 
              onClick={handleTestReport}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Gerar Relatório de Teste
            </Button>
          )}
        </div>
        
        {/* Technical Info */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium mb-2">
            Informações Técnicas
          </summary>
          <div className="space-y-2 text-gray-600">
            <p><strong>Arquivos criados:</strong></p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• firestoreDataService.ts - Busca dados reais</li>
              <li>• htmlReportTemplate.ts - Template HTML completo</li>
              <li>• firebaseStorageService.ts - Upload para Storage</li>
              <li>• unifiedReportService.ts - Serviço principal</li>
              <li>• unifiedReportPatch.ts - Patch de interceptação</li>
            </ul>
            <p className="mt-3">
              <strong>Abordagem:</strong> O sistema intercepta chamadas para a API de relatórios
              e redireciona para a nova implementação client-side, mantendo total
              compatibilidade com o código existente.
            </p>
          </div>
        </details>
        
        {/* Warning */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium text-blue-800">ℹ️ Sistema Experimental</p>
          <p className="text-blue-700">
            Esta é uma implementação experimental do novo sistema unificado.
            O sistema atual continua funcionando normalmente até que validemos
            completamente a nova abordagem.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};