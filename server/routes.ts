import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Endpoint para forçar reset de lembretes (para uso em cronjobs ou testes)
  app.post('/api/reset-reminders', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      // Esta funcionalidade seria implementada no frontend via ReminderService
      // Por segurança, retornar apenas confirmação de que o endpoint existe
      res.json({ 
        message: 'Reset deve ser executado via ReminderService no frontend',
        userId: userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro no endpoint reset-reminders:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Endpoint para geração de relatórios HTML
  app.post('/api/generate-report', async (req, res) => {
    try {
      const { userId, reportMonth, reportData } = req.body;
      
      if (!userId || !reportMonth) {
        return res.status(400).json({ 
          error: 'userId e reportMonth são obrigatórios',
          example: {
            userId: 'user@email.com',
            reportMonth: '2025-01' // ou 'Janeiro_2025'
          }
        });
      }

      console.log(`📊 Solicitação de geração de relatório para ${userId} - ${reportMonth}`);
      
      // Por enquanto, retornar informações sobre como usar o sistema de relatórios
      res.json({
        success: true,
        message: 'Sistema de relatórios configurado. Use o script node generate_and_send_report.js',
        userId,
        reportMonth,
        instructions: {
          manual: 'Execute: node generate_and_send_report.js',
          api: 'O sistema está configurado para geração automática de relatórios',
          firebaseUrl: `https://${process.env.VITE_FIREBASE_PROJECT_ID || 'dorlog-fibro-diario'}.web.app`
        }
      });
      
    } catch (error) {
      console.error('Erro no endpoint generate-report:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
