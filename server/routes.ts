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

  const httpServer = createServer(app);

  return httpServer;
}
