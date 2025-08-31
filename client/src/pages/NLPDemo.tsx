/**
 * Página de Demonstração NLP - Isolada
 * 
 * Demonstra as funcionalidades de análise NLP, detecção de padrões
 * e geração de insights sem interferir nas funcionalidades existentes.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { nlpService, NLPAnalysisResult } from '@/services/nlpAnalysisService';
import { patternDetectionService, ReportData } from '@/services/patternDetectionService';
import { insightGenerationService, SmartSummary, HealthInsight } from '@/services/insightGenerationService';

const NLPDemo = () => {
  const [sampleText, setSampleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nlpResult, setNlpResult] = useState<NLPAnalysisResult | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [smartSummary, setSmartSummary] = useState<SmartSummary | null>(null);

  // Textos de exemplo para demonstração
  const sampleTexts = [
    "Hoje estou sentindo uma dor muito forte na cabeça, tipo latejante. Começou depois do trabalho e não melhora com dipirona. Estou preocupado porque tem acontecido mais vezes essa semana.",
    "Dormi muito mal ontem, acordei várias vezes. Hoje o humor está péssimo, irritado com tudo. A dor nas costas voltou e não sei se é por causa da postura ou do estresse.",
    "Tomei o remédio que o médico passou e melhorou bastante a dor. Consegui trabalhar normal hoje. Me sinto mais calmo e otimista.",
    "Crise de ansiedade hoje, coração disparado e falta de ar. A dor no peito é insuportável. Preciso de ajuda urgente, não consigo me concentrar em nada."
  ];

  const mockReportData: ReportData[] = [
    {
      date: '2025-08-29',
      quizzes: [
        {
          tipo: 'emergencial',
          timestamp: new Date('2025-08-29T15:30:00'),
          respostas: {
            '1': 8, // EVA
            '2': ['Cabeça', 'Pescoço'], // Local
            '3': ['Latejante', 'Pulsante'], // Tipo
            '4': '3-6h', // Duração
            '5': ['Estresse', 'Trabalho'], // Gatilhos
            '7': 'Sim, não fez efeito', // Medicação
            '8': 'Dor insuportável hoje, não aguento mais'
          }
        },
        {
          tipo: 'noturno',
          timestamp: new Date('2025-08-29T22:00:00'),
          respostas: {
            '2': 7, // EVA
            '4': 4, // Sono (slider 1-10)
            '9': 'Ansioso' // Humor
          }
        }
      ]
    },
    {
      date: '2025-08-28',
      quizzes: [
        {
          tipo: 'noturno',
          timestamp: new Date('2025-08-28T21:30:00'),
          respostas: {
            '2': 5,
            '4': 6,
            '9': 'Triste'
          }
        }
      ]
    },
    {
      date: '2025-08-27',
      quizzes: [
        {
          tipo: 'emergencial',
          timestamp: new Date('2025-08-27T10:15:00'),
          respostas: {
            '1': 6,
            '2': ['Costas'],
            '3': ['Peso'],
            '5': ['Postura'],
            '7': 'Sim, melhorou',
            '8': 'Melhor hoje, remédio funcionou'
          }
        },
        {
          tipo: 'noturno',
          timestamp: new Date('2025-08-27T22:15:00'),
          respostas: {
            '2': 3,
            '4': 8,
            '9': 'Calmo'
          }
        }
      ]
    }
  ];

  const analyzeText = async () => {
    if (!sampleText.trim()) return;

    setIsAnalyzing(true);
    setNlpResult(null);
    setInsights([]);
    setSmartSummary(null);

    try {
      console.log('🧠 Iniciando demonstração NLP...');
      
      // 1. Análise NLP do texto
      const nlpAnalysis = await nlpService.analyzeText(sampleText);
      setNlpResult(nlpAnalysis);

      // 2. Gerar insights a partir do texto
      const textInsights = await insightGenerationService.generateNLPInsights([sampleText]);
      setInsights(textInsights);

      // 3. Análise completa com dados mock
      const fullSummary = await insightGenerationService.generateSmartSummary(
        mockReportData,
        [sampleText, ...sampleTexts.slice(0, 2)]
      );
      setSmartSummary(fullSummary);

      console.log('✅ Demonstração NLP concluída');

    } catch (error) {
      console.error('❌ Erro na análise:', error);
      alert('Erro na análise. Verifique o console para detalhes.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'POSITIVE': return 'bg-green-100 text-green-800';
      case 'NEGATIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'POSITIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" data-testid="nlp-demo-page">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card data-testid="demo-header">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              Demonstração NLP - DorLog
            </CardTitle>
            <p className="text-gray-600">
              Sistema isolado de análise de linguagem natural para insights de saúde
            </p>
          </CardHeader>
        </Card>

        {/* Input Section */}
        <Card data-testid="input-section">
          <CardHeader>
            <CardTitle>Análise de Texto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Digite ou selecione um texto para análise:
              </label>
              <Textarea
                placeholder="Ex: Hoje estou com muita dor de cabeça, começou após o trabalho..."
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="min-h-[100px]"
                data-testid="text-input"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Exemplos:</span>
              {sampleTexts.map((text, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSampleText(text)}
                  data-testid={`sample-text-${index}`}
                >
                  Exemplo {index + 1}
                </Button>
              ))}
            </div>

            <Button 
              onClick={analyzeText}
              disabled={!sampleText.trim() || isAnalyzing}
              className="w-full"
              data-testid="analyze-button"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analisar com NLP
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {nlpResult && (
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* NLP Analysis Results */}
            <Card data-testid="nlp-results">
              <CardHeader>
                <CardTitle>Análise NLP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Sentiment */}
                <div>
                  <h4 className="font-medium mb-2">Sentimento</h4>
                  <Badge className={getSentimentColor(nlpResult.sentiment.label)}>
                    {nlpResult.sentiment.label} ({(nlpResult.sentiment.score * 100).toFixed(0)}%)
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    Confiança: {nlpResult.sentiment.confidence}
                  </p>
                </div>

                <Separator />

                {/* Urgency Level */}
                <div>
                  <h4 className="font-medium mb-2">Nível de Urgência</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${(nlpResult.urgencyLevel / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {nlpResult.urgencyLevel}/10
                    </span>
                  </div>
                </div>

                {/* Clinical Relevance */}
                <div>
                  <h4 className="font-medium mb-2">Relevância Clínica</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${(nlpResult.clinicalRelevance / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {nlpResult.clinicalRelevance}/10
                    </span>
                  </div>
                </div>

                {/* Entities */}
                {nlpResult.entities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Entidades Médicas</h4>
                    <div className="flex flex-wrap gap-1">
                      {nlpResult.entities.slice(0, 5).map((entity, index) => (
                        <Badge key={index} variant="secondary">
                          {entity.entity} ({entity.type})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {nlpResult.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Resumo</h4>
                    <p className="text-sm text-gray-700">{nlpResult.summary.summary}</p>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Insights */}
            <Card data-testid="insights-results">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Insights Gerados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">{insight.type}</Badge>
                          <Badge 
                            className={
                              insight.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="font-medium mt-1">{insight.insight}</p>
                        <p className="text-sm text-gray-600">
                          Confiança: {(insight.confidence * 100).toFixed(0)}%
                        </p>
                        {insight.evidence.length > 0 && (
                          <ul className="text-xs text-gray-500 mt-1">
                            {insight.evidence.slice(0, 2).map((evidence, i) => (
                              <li key={i}>• {evidence}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Execute a análise para ver os insights</p>
                )}
              </CardContent>
            </Card>

          </div>
        )}

        {/* Smart Summary */}
        {smartSummary && (
          <Card data-testid="smart-summary">
            <CardHeader>
              <CardTitle>Resumo Inteligente</CardTitle>
              <p className="text-sm text-gray-600">{smartSummary.period}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Overall Sentiment */}
              <div>
                <h4 className="font-medium mb-2">Sentimento Geral</h4>
                <Badge className={getSentimentColor(smartSummary.overallSentiment)}>
                  {smartSummary.overallSentiment}
                </Badge>
              </div>

              {/* Key Findings */}
              {smartSummary.keyFindings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Principais Achados</h4>
                  <ul className="space-y-1">
                    {smartSummary.keyFindings.map((finding, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Critical Insights */}
              {smartSummary.criticalInsights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Insights Críticos</h4>
                  <div className="space-y-2">
                    {smartSummary.criticalInsights.map((category, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {getInsightIcon(category.category)}
                          <span className="font-medium">{category.title}</span>
                          <Badge variant="outline">Prioridade {category.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                        {category.recommendations && (
                          <ul className="text-xs text-gray-600">
                            {category.recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i}>• {rec}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {smartSummary.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <div className="grid gap-2">
                    {smartSummary.recommendations.slice(0, 5).map((rec, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictive Alerts */}
              {smartSummary.predictiveAlerts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Alertas Preditivos</h4>
                  <div className="space-y-2">
                    {smartSummary.predictiveAlerts.map((alert, index) => (
                      <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card data-testid="demo-info">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p>🧠 <strong>Demonstração Isolada</strong> - Esta funcionalidade NLP não interfere com as demais funcionalidades do DorLog.</p>
              <p className="mt-2">
                Sistema baseado em <strong>Transformers.js</strong> para análise client-side de linguagem natural em português.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default NLPDemo;