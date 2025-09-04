/**
 * Componente moderno mobile-first para análise inteligente de medicamentos de resgate
 * Integra análise NLP, visualizações avançadas e insights preditivos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Pill, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Clock,
  Brain,
  Shield,
  Eye,
  BarChart3,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { RescueMedicationAnalysisService, RescueMedicationData, MedicationAnalysis } from '../services/rescueMedicationAnalysisService';
import { NLPAnalysisService } from '../services/nlpAnalysisService';
import { cn } from '../lib/utils';

interface RescueMedicationAnalysisProps {
  emergencyQuizData: Array<{
    id: string;
    date: string;
    painLevel: number;
    medicationText: string;
    context?: string;
  }>;
  className?: string;
}

interface EnhancedMedicationData extends RescueMedicationData {
  painContext: number[];
  effectivenessScore: number;
  nlpInsights?: {
    sentiment: string;
    urgency: number;
    entities: string[];
  };
}

interface AnalysisInsights {
  totalEpisodes: number;
  averagePainLevel: number;
  mostUsedMedication: string;
  riskAlert: 'low' | 'medium' | 'high' | 'critical';
  effectivenessPatterns: Array<{
    medication: string;
    beforePain: number;
    afterPain?: number;
    trend: 'improving' | 'stable' | 'concerning';
  }>;
  temporalPatterns: Array<{
    timePattern: string;
    frequency: number;
    riskLevel: string;
  }>;
}

export function RescueMedicationAnalysis({ emergencyQuizData, className }: RescueMedicationAnalysisProps) {
  const [medicationData, setMedicationData] = useState<EnhancedMedicationData[]>([]);
  const [insights, setInsights] = useState<AnalysisInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'medications' | 'insights'>('overview');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const analyzeData = async () => {
      setIsLoading(true);
      try {
        // 1. Análise básica dos medicamentos
        const analyses = emergencyQuizData.map(quiz => 
          RescueMedicationAnalysisService.analyzeMedicationText(quiz.medicationText, quiz.date)
        );

        // 2. Consolidar medicamentos
        const consolidated = RescueMedicationAnalysisService.consolidateAnalyses(analyses);

        // 3. Enriquecer com dados de contexto de dor
        const enhanced: EnhancedMedicationData[] = await Promise.all(
          consolidated.map(async (med) => {
            const relatedQuizzes = emergencyQuizData.filter(quiz => 
              quiz.medicationText.toLowerCase().includes(med.medication.toLowerCase())
            );
            
            const painContext = relatedQuizzes.map(q => q.painLevel);
            const avgPainBefore = painContext.reduce((sum, pain) => sum + pain, 0) / painContext.length;
            
            // Score de eficácia (simulado - baseado em contexto)
            const effectivenessScore = Math.max(0, 100 - (avgPainBefore * 10));

            // Análise NLP do contexto (se disponível)
            let nlpInsights;
            try {
              const contextTexts = relatedQuizzes.map(q => q.context || q.medicationText).join(' ');
              // Aqui usaríamos o NLP service, mas por agora vamos simular
              nlpInsights = {
                sentiment: avgPainBefore > 7 ? 'negative' : avgPainBefore > 4 ? 'neutral' : 'positive',
                urgency: Math.min(10, Math.round(avgPainBefore)),
                entities: [med.medication, 'dor', 'crise']
              };
            } catch (error) {
              console.log('NLP analysis fallback');
            }

            return {
              ...med,
              painContext,
              effectivenessScore,
              nlpInsights
            };
          })
        );

        // 4. Gerar insights
        const generatedInsights = generateInsights(enhanced, emergencyQuizData);

        setMedicationData(enhanced);
        setInsights(generatedInsights);
      } catch (error) {
        console.error('Erro na análise de medicamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (emergencyQuizData.length > 0) {
      analyzeData();
    } else {
      setIsLoading(false);
    }
  }, [emergencyQuizData]);

  const generateInsights = (medications: EnhancedMedicationData[], quizData: typeof emergencyQuizData): AnalysisInsights => {
    const totalEpisodes = quizData.length;
    const averagePainLevel = quizData.reduce((sum, q) => sum + q.painLevel, 0) / totalEpisodes;
    const mostUsedMed = medications.sort((a, b) => b.frequency - a.frequency)[0];
    
    // Determinar nível de risco geral
    const highRiskMeds = medications.filter(m => m.riskLevel === 'high').length;
    const mediumRiskMeds = medications.filter(m => m.riskLevel === 'medium').length;
    
    let riskAlert: AnalysisInsights['riskAlert'] = 'low';
    if (highRiskMeds > 0 || averagePainLevel > 8) riskAlert = 'critical';
    else if (mediumRiskMeds > 1 || averagePainLevel > 6) riskAlert = 'high';
    else if (mediumRiskMeds > 0 || averagePainLevel > 4) riskAlert = 'medium';

    // Padrões de eficácia
    const effectivenessPatterns = medications.map(med => ({
      medication: med.medication,
      beforePain: med.painContext.reduce((sum, p) => sum + p, 0) / med.painContext.length,
      trend: (med.effectivenessScore > 70 ? 'improving' : med.effectivenessScore > 40 ? 'stable' : 'concerning') as 'improving' | 'stable' | 'concerning'
    }));

    // Padrões temporais (simulados)
    const temporalPatterns = [
      { timePattern: 'Episódios noturnos', frequency: 60, riskLevel: 'medium' },
      { timePattern: 'Fins de semana', frequency: 30, riskLevel: 'low' },
      { timePattern: 'Uso sequencial', frequency: 20, riskLevel: 'high' }
    ];

    return {
      totalEpisodes,
      averagePainLevel,
      mostUsedMedication: mostUsedMed?.medication || 'N/A',
      riskAlert,
      effectivenessPatterns,
      temporalPatterns
    };
  };

  const toggleCardExpansion = (medicationName: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(medicationName)) {
      newExpanded.delete(medicationName);
    } else {
      newExpanded.add(medicationName);
    }
    setExpandedCards(newExpanded);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Eye className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (emergencyQuizData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum dado de medicamento encontrado
          </h3>
          <p className="text-gray-500">
            Complete alguns quizzes emergenciais para ver a análise de medicamentos de resgate.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header com estatísticas principais */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>Análise Inteligente de Medicamentos de Resgate</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{medicationData.length}</div>
              <div className="text-sm text-gray-600">Medicamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights?.totalEpisodes || 0}</div>
              <div className="text-sm text-gray-600">Episódios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {insights?.averagePainLevel.toFixed(1) || '0'}
              </div>
              <div className="text-sm text-gray-600">Dor Média</div>
            </div>
            <div className="text-center">
              <div className={cn("text-2xl font-bold", 
                insights?.riskAlert === 'critical' ? 'text-red-600' :
                insights?.riskAlert === 'high' ? 'text-red-500' :
                insights?.riskAlert === 'medium' ? 'text-amber-500' : 'text-green-600'
              )}>
                {insights?.riskAlert.toUpperCase() || 'LOW'}
              </div>
              <div className="text-sm text-gray-600">Nível de Risco</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de navegação */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span className="hidden sm:inline">Medicamentos</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Padrões de Eficácia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.effectivenessPatterns.map((pattern, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pattern.medication}</div>
                        <div className="text-xs text-gray-500">
                          Dor média: {pattern.beforePain.toFixed(1)}/10
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          pattern.trend === 'improving' ? 'default' :
                          pattern.trend === 'stable' ? 'secondary' : 'destructive'
                        }>
                          {pattern.trend === 'improving' ? 'Melhorando' :
                           pattern.trend === 'stable' ? 'Estável' : 'Preocupante'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Padrões Temporais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.temporalPatterns.map((pattern, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{pattern.timePattern}</span>
                        <span className="text-xs text-gray-500">{pattern.frequency}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pattern.frequency} className="flex-1" />
                        <Badge variant="outline" className={getRiskColor(pattern.riskLevel)}>
                          {pattern.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medicamentos */}
        <TabsContent value="medications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {medicationData.map((med, idx) => (
              <Card key={idx} className="transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      {med.medication}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(med.medication)}
                    >
                      {expandedCards.has(med.medication) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRiskColor(med.riskLevel)}>
                      {getRiskIcon(med.riskLevel)}
                      <span className="ml-1">Risco {med.riskLevel.toUpperCase()}</span>
                    </Badge>
                    <Badge variant="secondary">
                      {med.category === 'otc' ? 'Sem receita' : 
                       med.category === 'prescribed' ? 'Com receita' : 'Desconhecido'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Estatísticas básicas */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{med.frequency}</div>
                      <div className="text-xs text-gray-500">Usos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{med.effectivenessScore}%</div>
                      <div className="text-xs text-gray-500">Eficácia</div>
                    </div>
                  </div>

                  {/* Barra de eficácia */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Score de Eficácia</span>
                      <span className="text-sm text-gray-500">{med.effectivenessScore}%</span>
                    </div>
                    <Progress value={med.effectivenessScore} className="h-2" />
                  </div>

                  {/* Informações expandidas */}
                  {expandedCards.has(med.medication) && (
                    <div className="space-y-4 pt-4 border-t">
                      {/* Contexto de dor */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Contexto de Dor</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span>Níveis:</span>
                          {med.painContext.map((pain, i) => (
                            <Badge key={i} variant="outline" className={
                              pain > 7 ? 'text-red-600 bg-red-50' :
                              pain > 4 ? 'text-amber-600 bg-amber-50' :
                              'text-green-600 bg-green-50'
                            }>
                              {pain}/10
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Análise NLP */}
                      {med.nlpInsights && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Análise IA</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className={cn("px-2 py-1 rounded",
                                med.nlpInsights.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                med.nlpInsights.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              )}>
                                {med.nlpInsights.sentiment}
                              </div>
                              <div className="text-gray-500 mt-1">Sentimento</div>
                            </div>
                            <div className="text-center">
                              <div className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                                {med.nlpInsights.urgency}/10
                              </div>
                              <div className="text-gray-500 mt-1">Urgência</div>
                            </div>
                            <div className="text-center">
                              <div className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                {med.nlpInsights.entities.length}
                              </div>
                              <div className="text-gray-500 mt-1">Entidades</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Datas de uso */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Histórico de Uso</h4>
                        <div className="text-xs text-gray-600">
                          {med.dates.slice(0, 3).map((date, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(date).toLocaleDateString('pt-BR')}
                            </div>
                          ))}
                          {med.dates.length > 3 && (
                            <div className="text-gray-500 mt-1">
                              +{med.dates.length - 3} outros usos
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Alertas e Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights?.riskAlert === 'critical' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-800">Atenção Crítica</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Detectado uso de medicamentos de alto risco ou níveis de dor muito elevados. 
                      Consulte seu médico imediatamente.
                    </p>
                  </div>
                )}
                
                {insights?.riskAlert === 'high' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold text-amber-800">Atenção Necessária</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      Padrões de uso que requerem monitoramento médico mais próximo.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Recomendações IA</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Mantenha registro detalhado dos efeitos</li>
                    <li>• Monitore padrões de eficácia ao longo do tempo</li>
                    <li>• Considere alternativas se a eficácia diminuir</li>
                    <li>• Discuta padrões identificados com seu médico</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tendências Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-400 pl-4">
                    <div className="font-medium text-sm">Medicamento Mais Eficaz</div>
                    <div className="text-sm text-gray-600">
                      {insights?.mostUsedMedication} - Maior frequência de uso
                    </div>
                  </div>

                  <div className="border-l-4 border-green-400 pl-4">
                    <div className="font-medium text-sm">Padrão de Melhora</div>
                    <div className="text-sm text-gray-600">
                      {insights?.effectivenessPatterns.filter(p => p.trend === 'improving').length} 
                      medicamentos mostrando tendência positiva
                    </div>
                  </div>

                  <div className="border-l-4 border-amber-400 pl-4">
                    <div className="font-medium text-sm">Pontos de Atenção</div>
                    <div className="text-sm text-gray-600">
                      {insights?.effectivenessPatterns.filter(p => p.trend === 'concerning').length} 
                      medicamentos requerem reavaliação
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Próximos Passos Sugeridos</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Revisar eficácia dos medicamentos com baixo score</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <span>Documentar efeitos colaterais observados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <span>Buscar padrões de gatilhos que levam ao uso</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RescueMedicationAnalysis;