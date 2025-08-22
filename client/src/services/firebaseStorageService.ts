import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export interface UploadResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * Upload HTML report directly to Firebase Storage
 */
export async function uploadReportToStorage(
  htmlContent: string, 
  reportId: string
): Promise<UploadResult> {
  try {
    console.log(`☁️ Iniciando upload do relatório ${reportId} para Firebase Storage...`);
    
    // Create file reference
    const fileName = `report_${reportId}.html`;
    const storageRef = ref(storage, `reports/${fileName}`);
    
    console.log(`📤 Upload em progresso: ${fileName}`);
    
    // Upload HTML content as string
    await uploadString(storageRef, htmlContent, 'raw', {
      contentType: 'text/html; charset=utf-8',
      cacheControl: 'public, max-age=604800', // 7 days cache
      customMetadata: {
        generated_at: new Date().toISOString(),
        generator: 'dorlog-client-side',
        version: '2.0'
      }
    });
    
    console.log(`✅ Upload concluído: ${fileName}`);
    
    // Get public download URL
    const downloadUrl = await getDownloadURL(storageRef);
    
    console.log(`🔗 URL pública gerada: ${downloadUrl}`);
    
    return {
      success: true,
      downloadUrl,
      fileName
    };
    
  } catch (error) {
    console.error('❌ Erro no upload para Firebase Storage:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
    };
  }
}

/**
 * Generate unique report ID
 */
export function generateReportId(userId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 6);
  const userHash = btoa(userId).substr(0, 6);
  
  return `${userHash}_${timestamp}_${randomSuffix}`;
}

/**
 * Generate password hash for report protection (optional)
 */
export function generatePasswordHash(password: string): string {
  return btoa(password + '_dorlog_salt');
}

/**
 * Check if Firebase Storage is properly configured
 */
export function checkStorageConfiguration(): boolean {
  try {
    // Basic check if storage is initialized
    if (!storage) {
      console.error('❌ Firebase Storage não está inicializado');
      return false;
    }
    
    console.log('✅ Firebase Storage configurado corretamente');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração do Firebase Storage:', error);
    return false;
  }
}