import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

export interface Reminder {
  hora: string;
  status: boolean;
}

export interface Medication {
  id: string;
  nome: string;
  posologia: string;
  frequencia: string;
  medicoId: string;
  lembrete: Reminder[];
  usuarioId: string;
  lastReset?: string; // Data do último reset (formato YYYY-MM-DD)
}

export class ReminderService {
  /**
   * Verifica se é necessário resetar os lembretes para o usuário
   * Retorna true se é um novo dia e os lembretes precisam ser resetados
   */
  static shouldResetReminders(lastReset?: string): boolean {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return !lastReset || lastReset !== today;
  }

  /**
   * Reseta todos os lembretes de medicamentos para false
   * Este método deve ser chamado diariamente às 0h ou quando o usuário acessa pela primeira vez no dia
   */
  static async resetAllReminders(userId: string): Promise<void> {
    try {
      console.log('🔄 Iniciando reset diário dos lembretes para usuário:', userId);
      
      // Buscar todos os medicamentos do usuário
      const medicationsCollection = collection(db, 'medicamentos');
      const q = query(
        medicationsCollection,
        where('usuarioId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('ℹ️ Nenhum medicamento encontrado para reset');
        return;
      }

      // Usar batch para operações atômicas
      const batch = writeBatch(db);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      let updatedCount = 0;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Medication;
        
        // Verificar se precisa resetar
        if (this.shouldResetReminders(data.lastReset)) {
          // Resetar todos os status dos lembretes para false
          const resetReminders = data.lembrete?.map(lembrete => ({
            ...lembrete,
            status: false
          })) || [];

          // Atualizar documento
          const medicationRef = doc(db, 'medicamentos', docSnapshot.id);
          batch.update(medicationRef, {
            lembrete: resetReminders,
            lastReset: today
          });

          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        await batch.commit();
        console.log(`✅ Reset concluído: ${updatedCount} medicamentos atualizados`);
      } else {
        console.log('ℹ️ Nenhum medicamento precisava ser resetado');
      }

    } catch (error) {
      console.error('❌ Erro ao resetar lembretes:', error);
      throw error;
    }
  }

  /**
   * Verifica e executa o reset se necessário
   * Método principal que deve ser chamado quando o usuário acessa a aplicação
   */
  static async checkAndResetIfNeeded(userId: string): Promise<boolean> {
    try {
      // Buscar um medicamento qualquer para verificar a data do último reset
      const medicationsCollection = collection(db, 'medicamentos');
      const q = query(
        medicationsCollection,
        where('usuarioId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false; // Não há medicamentos, não precisa resetar
      }

      // Verificar se algum medicamento precisa de reset
      let needsReset = false;
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Medication;
        if (this.shouldResetReminders(data.lastReset)) {
          needsReset = true;
        }
      });

      if (needsReset) {
        await this.resetAllReminders(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar necessidade de reset:', error);
      return false;
    }
  }

  /**
   * Obtém a hora atual no formato HH:MM para comparação com lembretes
   */
  static getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Verifica se um lembrete está dentro do horário (com margem de tolerância)
   */
  static isReminderTime(reminderTime: string, toleranceMinutes: number = 30): boolean {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    const diffMs = Math.abs(now.getTime() - reminderDate.getTime());
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes <= toleranceMinutes;
  }
}

export default ReminderService;