/**
 * Página de demonstração para o componente de análise de medicamentos de resgate
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import RescueMedicationAnalysis from '../components/RescueMedicationAnalysis';
import { Brain, Pill, TestTube } from 'lucide-react';

// Dados de exemplo para teste
const mockEmergencyQuizData = [
  {
    id: "1",
    date: "2025-08-31",
    painLevel: 8,
    medicationText: "Tomei Dimorf para a dor nas pernas, ajudou muito",
    context: "Crise intensa de fibromialgia, dor nas pernas e braços"
  },
  {
    id: "2", 
    date: "2025-09-01",
    painLevel: 6,
    medicationText: "Paracetamol, dipirona",
    context: "Dor de cabeça forte, não conseguia trabalhar"
  },
  {
    id: "3",
    date: "2025-09-02", 
    painLevel: 7,
    medicationText: "Novalgina 500mg, tomei 2 comprimidos",
    context: "Dor muscular generalizada após atividade física"
  },
  {
    id: "4",
    date: "2025-09-03",
    painLevel: 5,
    medicationText: "Não tomei nada dessa vez",
    context: "Tentei aguentar a dor, mas foi difícil"
  },
  {
    id: "5",
    date: "2025-09-04",
    painLevel: 9,
    medicationText: "Tramadol 50mg + ibuprofeno, efeito colateral enjoo",
    context: "Crise severa, precisei sair do trabalho mais cedo"
  }
];

const emptyData: any[] = [];

export default function RescueMedicationDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Brain className="h-8 w-8" />
              <span>Demonstração: Análise IA de Medicamentos de Resgate</span>
            </CardTitle>
            <p className="text-blue-100">
              Interface moderna mobile-first com análise inteligente usando NLP e insights preditivos
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                <span className="text-sm">Análise NLP Local</span>
              </div>
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                <span className="text-sm">Classificação de Risco</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span className="text-sm">Insights Preditivos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre a demonstração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              Sobre esta Demonstração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">🧠 Recursos de IA Implementados</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Extração automática de medicamentos do texto livre</li>
                  <li>• Análise de sentimento dos relatos</li>
                  <li>• Classificação de risco baseada em padrões</li>
                  <li>• Correlação com níveis de dor</li>
                  <li>• Detecção de padrões temporais</li>
                  <li>• Recomendações clínicas personalizadas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">📱 Design Mobile-First</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Interface responsiva e moderna</li>
                  <li>• Cards interativos com expansão</li>
                  <li>• Visualizações de progresso animadas</li>
                  <li>• Sistema de badges e alertas visuais</li>
                  <li>• Navegação por tabs otimizada</li>
                  <li>• Métricas em tempo real</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Como Funciona</span>
              </div>
              <p className="text-sm text-blue-700">
                O sistema processa textos livres dos quizzes emergenciais usando análise NLP local (privacidade total). 
                Extrai medicamentos, analisa contexto, correlaciona com dor e gera insights clínicos automaticamente.
                Todos os dados são processados no navegador, garantindo privacidade completa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demonstrações */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Demonstração com dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  <Pill className="h-3 w-3 mr-1" />
                  Com Dados
                </Badge>
                Análise Completa com 5 Episódios
              </CardTitle>
              <p className="text-sm text-gray-600">
                Exemplo com dados reais de medicamentos de resgate mostrando análise completa de IA
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <RescueMedicationAnalysis 
                emergencyQuizData={mockEmergencyQuizData}
                className="border-0"
              />
            </CardContent>
          </Card>

          {/* Demonstração vazia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-400">
                  <TestTube className="h-3 w-3 mr-1" />
                  Sem Dados
                </Badge>
                Estado Inicial
              </CardTitle>
              <p className="text-sm text-gray-600">
                Como o componente aparece quando não há dados de medicamentos registrados
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <RescueMedicationAnalysis 
                emergencyQuizData={emptyData}
                className="border-0"
              />
            </CardContent>
          </Card>
        </div>

        {/* Dados de exemplo utilizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              Dados de Exemplo Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Os dados abaixo demonstram como o sistema processa diferentes tipos de entrada:
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockEmergencyQuizData.map((quiz, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Episódio {idx + 1}
                      </Badge>
                      <span className="text-xs text-gray-500">{quiz.date}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Dor:</span>
                        <Badge variant={quiz.painLevel > 7 ? 'destructive' : quiz.painLevel > 4 ? 'secondary' : 'default'}>
                          {quiz.painLevel}/10
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Medicamento:</span>
                        <div className="text-gray-700 italic mt-1">"{quiz.medicationText}"</div>
                      </div>
                      <div>
                        <span className="font-medium">Contexto:</span>
                        <div className="text-gray-600 text-xs mt-1">{quiz.context}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="h-5 w-5" />
              <span className="font-semibold">DorLog Enhanced</span>
            </div>
            <p className="text-gray-300 text-sm">
              Sistema de análise inteligente de medicamentos de resgate com IA local e privacidade total
            </p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
              <span>🧠 NLP Local</span>
              <span>📱 Mobile-First</span>
              <span>🔒 Privacy-First</span>
              <span>⚡ Real-time</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}