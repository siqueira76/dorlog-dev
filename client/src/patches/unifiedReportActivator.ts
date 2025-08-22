import { patchApiCallsUnified, checkUnifiedReportReadiness } from './unifiedReportPatch';

/**
 * Activator for the unified report system
 * This file can be imported to enable the new unified approach
 * without affecting the existing system
 */
export class UnifiedReportActivator {
  private static isActivated = false;
  private static activationPromise: Promise<boolean> | null = null;
  
  /**
   * Activate the unified report system
   */
  static async activate(): Promise<boolean> {
    if (this.isActivated) {
      console.log('✅ Sistema unificado já está ativado');
      return true;
    }
    
    if (this.activationPromise) {
      console.log('⏳ Aguardando ativação em progresso...');
      return this.activationPromise;
    }
    
    this.activationPromise = this._performActivation();
    const result = await this.activationPromise;
    this.activationPromise = null;
    
    return result;
  }
  
  private static async _performActivation(): Promise<boolean> {
    console.log('🚀 Ativando sistema de relatório unificado...');
    
    try {
      // 1. Check configuration readiness
      const isReady = checkUnifiedReportReadiness();
      if (!isReady) {
        console.warn('⚠️ Sistema não está completamente configurado, mas continuando...');
      }
      
      // 2. Apply the unified patch
      patchApiCallsUnified();
      
      // 3. Mark as activated
      this.isActivated = true;
      
      console.log('✅ Sistema unificado ativado com sucesso!');
      console.log('📋 Recursos disponíveis:');
      console.log('   • Dados reais do Firestore');
      console.log('   • Upload direto para Firebase Storage');
      console.log('   • URLs públicas permanentes (7 dias)');
      console.log('   • Funciona no Replit e GitHub Pages');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao ativar sistema unificado:', error);
      this.isActivated = false;
      return false;
    }
  }
  
  /**
   * Check if unified system is active
   */
  static isActive(): boolean {
    return this.isActivated;
  }
  
  /**
   * Deactivate unified system (for testing/debugging)
   */
  static deactivate(): void {
    console.log('🔄 Desativando sistema unificado...');
    this.isActivated = false;
    // Note: Cannot easily restore original fetch, would need more complex setup
    console.log('⚠️ Recarregue a página para restaurar o sistema original');
  }
  
  /**
   * Get status information about the unified system
   */
  static getStatus(): {
    isActive: boolean;
    configurationIssues?: string[];
    activatedAt?: Date;
  } {
    const status = {
      isActive: this.isActivated
    };
    
    if (!this.isActivated) {
      const config = checkUnifiedReportReadiness();
      if (!config) {
        return { ...status, configurationIssues: ['Configuração não disponível'] };
      }
    }
    
    return status;
  }
}

/**
 * Convenience function to activate unified reports
 */
export const activateUnifiedReports = () => UnifiedReportActivator.activate();

/**
 * Convenience function to check if unified reports are active
 */
export const isUnifiedReportsActive = () => UnifiedReportActivator.isActive();