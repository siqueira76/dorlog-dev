/**
 * Serviço de Análise Enhanced para Relatórios DorLog
 * 
 * Integra análise NLP avançada com visualizações para relatórios inteligentes.
 * Trabalha junto com o sistema existente sem impactar funcionalidades atuais.
 */

import { ReportData } from './firestoreDataService';
import { nlpService, type NLPAnalysisResult } from './nlpAnalysisService';
import type { 
  SentimentResult,
  MedicalEntity,
  EmotionalState
} from './nlpAnalysisService';

// Tipos específicos para análise enhanced
export interface PainMoodCorrelation {
  date: string;
  painLevel: number;
  moodScore: number;
  sentiment: string;
  context?: string;
}

export interface BehavioralPattern {
  id: string;
  type: 'temporal' | 'correlation' | 'sequence' | 'trigger';
  description: string;
  frequency: number;
  confidence: number;
  examples: string[];
}

export interface PredictiveAlert {
  type: 'crisis' | 'medication' | 'mood' | 'pattern';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  description: string;
  recommendation?: string;
  timeframe: string;
}

export interface NLPInsights {
  overallSentiment: SentimentResult;
  sentimentEvolution: Array<{
    date: string;
    sentiment: SentimentResult;
    context?: string;
  }>;
  medicalEntities: {
    symptoms: MedicalEntity[];
    medications: MedicalEntity[];
    bodyParts: MedicalEntity[];
    emotions: MedicalEntity[];
  };
  urgencyTimeline: Array<{
    date: string;
    level: number;
    triggers: string[];
  }>;
  clinicalAlerts: string[];
  textualPatterns: {
    frequentPhrases: Array<{ phrase: string; count: number }>;
    emotionalProgression: string;
    languageEvolution: string;
  };
}

export interface PatternInsights {
  correlations: Array<{
    type: string;
    correlation: number;
    significance: 'low' | 'medium' | 'high';
    description: string;
  }>;
  temporalPatterns: Array<{
    pattern: string;
    frequency: number;
    timeframe: string;
    impact: string;
  }>;
  behavioralChains: Array<{
    sequence: string[];
    probability: number;
    outcomes: string[];
  }>;
}

export interface SmartSummary {
  executiveSummary: string;
  keyFindings: string[];
  clinicalRecommendations: string[];
  predictiveAlerts: PredictiveAlert[];
  riskAssessment: {
    overall: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    score: number;
  };
  progressIndicators: {
    improvement: string[];
    concerning: string[];
    stable: string[];
  };
}

export interface EnhancedReportData extends ReportData {
  nlpInsights?: NLPInsights;
  patternInsights?: PatternInsights;
  smartSummary?: SmartSummary;
  painMoodCorrelation?: PainMoodCorrelation[];
  behavioralPatterns?: BehavioralPattern[];
  visualizationData?: {
    sentimentEvolution: Array<{ date: string; positive: number; negative: number; neutral: number }>;
    urgencyHeatmap: Array<{ day: string; hour: number; intensity: number }>;
    entityWordCloud: Array<{ entity: string; frequency: number; category: string }>;
    correlationMatrix: Array<{ x: string; y: string; correlation: number }>;
  };
}

/**
 * Classe principal para análise enhanced de relatórios
 */
export class EnhancedReportAnalysisService {
  
  /**
   * Processa dados de relatório com análise NLP avançada
   */
  static async enhanceReportData(reportData: ReportData, textResponses: string[]): Promise<EnhancedReportData> {
    console.log('🧠 Iniciando análise enhanced do relatório...');
    
    try {
      const enhanced: EnhancedReportData = { ...reportData };
      
      // 1. Análise NLP dos textos livres
      if (textResponses.length > 0) {
        console.log('📝 Processando análise NLP...');
        enhanced.nlpInsights = await this.generateNLPInsights(textResponses);
      }
      
      // 2. Análise de padrões comportamentais
      console.log('🔍 Detectando padrões comportamentais...');
      enhanced.patternInsights = this.analyzePatterns(reportData);
      enhanced.behavioralPatterns = this.detectBehavioralPatterns(reportData);
      
      // 3. Correlação dor-humor se houver dados suficientes
      if (reportData.painEvolution.length > 5) {
        console.log('💭 Analisando correlação dor-humor...');
        enhanced.painMoodCorrelation = this.analyzePainMoodCorrelation(
          reportData.painEvolution, 
          enhanced.nlpInsights
        );
      }
      
      // 4. Geração de sumário inteligente
      console.log('💡 Gerando sumário inteligente...');
      enhanced.smartSummary = this.generateSmartSummary(
        enhanced.nlpInsights,
        enhanced.patternInsights,
        reportData
      );
      
      // 5. Preparar dados para visualizações
      console.log('📊 Preparando dados de visualização...');
      enhanced.visualizationData = this.prepareVisualizationData(enhanced);
      
      console.log('✅ Análise enhanced concluída');
      return enhanced;
      
    } catch (error) {
      console.error('❌ Erro na análise enhanced:', error);
      // Retornar dados originais em caso de erro
      return reportData;
    }
  }
  
  /**
   * Gera insights NLP a partir de textos livres
   */
  private static async generateNLPInsights(textResponses: string[]): Promise<NLPInsights> {
    const nlpResults: NLPAnalysisResult[] = [];
    const sentimentEvolution: NLPInsights['sentimentEvolution'] = [];
    const urgencyTimeline: NLPInsights['urgencyTimeline'] = [];
    
    // Processar cada resposta textual
    for (let i = 0; i < textResponses.length; i++) {
      const text = textResponses[i];
      if (!text || text.trim().length < 5) continue;
      
      try {
        const analysis = await nlpService.analyzeText(text);
        nlpResults.push(analysis);
        
        // Registrar evolução do sentimento
        sentimentEvolution.push({
          date: new Date(Date.now() - (textResponses.length - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sentiment: analysis.sentiment,
          context: text.substring(0, 50) + '...'
        });
        
        // Registrar timeline de urgência
        urgencyTimeline.push({
          date: new Date(Date.now() - (textResponses.length - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          level: analysis.urgencyLevel,
          triggers: analysis.entities.map(e => e.entity)
        });
        
      } catch (error) {
        console.error('Erro no processamento NLP do texto:', error);
      }
    }
    
    if (nlpResults.length === 0) {
      // Retornar estrutura vazia se não houver análises
      return {
        overallSentiment: { label: 'NEUTRAL', score: 0.5, confidence: 'LOW' },
        sentimentEvolution: [],
        medicalEntities: { symptoms: [], medications: [], bodyParts: [], emotions: [] },
        urgencyTimeline: [],
        clinicalAlerts: [],
        textualPatterns: {
          frequentPhrases: [],
          emotionalProgression: 'Sem dados suficientes para análise',
          languageEvolution: 'Sem dados suficientes para análise'
        }
      };
    }
    
    // Calcular sentimento geral
    const avgSentimentScore = nlpResults.reduce((sum, r) => sum + r.sentiment.score, 0) / nlpResults.length;
    const dominantSentiment = nlpResults.reduce((acc, r) => {
      acc[r.sentiment.label] = (acc[r.sentiment.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overallLabel = Object.entries(dominantSentiment).reduce((a, b) => 
      dominantSentiment[a[0]] > dominantSentiment[b[0]] ? a : b
    )[0] as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    
    // Agrupar entidades médicas
    const allEntities = nlpResults.flatMap(r => r.entities);
    const medicalEntities = {
      symptoms: allEntities.filter(e => e.type === 'SYMPTOM'),
      medications: allEntities.filter(e => e.type === 'MEDICATION'),
      bodyParts: allEntities.filter(e => e.type === 'BODY_PART'),
      emotions: allEntities.filter(e => e.type === 'EMOTION')
    };
    
    // Gerar alertas clínicos
    const clinicalAlerts = this.generateClinicalAlerts(nlpResults);
    
    // Análise de padrões textuais
    const textualPatterns = this.analyzeTextualPatterns(textResponses);
    
    return {
      overallSentiment: {
        label: overallLabel,
        score: avgSentimentScore,
        confidence: avgSentimentScore > 0.8 ? 'HIGH' : avgSentimentScore > 0.6 ? 'MEDIUM' : 'LOW'
      },
      sentimentEvolution,
      medicalEntities,
      urgencyTimeline,
      clinicalAlerts,
      textualPatterns
    };
  }
  
  /**
   * Analisa padrões comportamentais nos dados
   */
  private static analyzePatterns(reportData: ReportData): PatternInsights {
    const correlations = this.calculateCorrelations(reportData);
    const temporalPatterns = this.detectTemporalPatterns(reportData);
    const behavioralChains = this.identifyBehavioralChains(reportData);
    
    return {
      correlations,
      temporalPatterns,
      behavioralChains
    };
  }
  
  /**
   * Detecta padrões comportamentais específicos
   */
  private static detectBehavioralPatterns(reportData: ReportData): BehavioralPattern[] {
    const patterns: BehavioralPattern[] = [];
    
    // Padrão temporal de crises
    if (reportData.crisisEpisodes > 0) {
      patterns.push({
        id: 'crisis-temporal',
        type: 'temporal',
        description: 'Padrão temporal de episódios de crise identificado',
        frequency: reportData.crisisEpisodes,
        confidence: reportData.crisisEpisodes >= 3 ? 0.8 : 0.5,
        examples: [`${reportData.crisisEpisodes} episódios registrados no período`]
      });
    }
    
    // Padrão de evolução da dor
    if (reportData.painEvolution.length >= 7) {
      const trend = this.calculatePainTrend(reportData.painEvolution);
      patterns.push({
        id: 'pain-evolution',
        type: 'correlation',
        description: trend > 0 ? 'Tendência de piora da dor detectada' : 'Tendência de melhora da dor detectada',
        frequency: Math.abs(trend),
        confidence: 0.7,
        examples: [`Variação média: ${trend.toFixed(2)} pontos por período`]
      });
    }
    
    return patterns;
  }
  
  /**
   * Analiza correlação dor-humor
   */
  private static analyzePainMoodCorrelation(
    painEvolution: ReportData['painEvolution'],
    nlpInsights?: NLPInsights
  ): PainMoodCorrelation[] {
    return painEvolution.map((pain, index) => {
      // Mapear sentimento para score numérico
      let moodScore = 0;
      const sentimentData = nlpInsights?.sentimentEvolution[index];
      
      if (sentimentData) {
        switch(sentimentData.sentiment.label) {
          case 'POSITIVE': moodScore = sentimentData.sentiment.score * 5; break;
          case 'NEGATIVE': moodScore = -sentimentData.sentiment.score * 5; break;
          default: moodScore = 0;
        }
      }
      
      return {
        date: pain.date,
        painLevel: pain.level,
        moodScore,
        sentiment: sentimentData?.sentiment.label || 'NEUTRAL',
        context: sentimentData?.context
      };
    });
  }
  
  /**
   * Gera sumário inteligente do relatório
   */
  private static generateSmartSummary(
    nlpInsights?: NLPInsights,
    patternInsights?: PatternInsights,
    reportData?: ReportData
  ): SmartSummary {
    // Sumário executivo baseado nos dados
    const executiveSummary = this.generateExecutiveSummary(reportData, nlpInsights);
    
    // Principais descobertas
    const keyFindings = this.extractKeyFindings(nlpInsights, patternInsights, reportData);
    
    // Recomendações clínicas
    const clinicalRecommendations = this.generateClinicalRecommendations(nlpInsights, reportData);
    
    // Alertas preditivos
    const predictiveAlerts = this.generatePredictiveAlerts(nlpInsights, patternInsights, reportData);
    
    // Avaliação de risco
    const riskAssessment = this.assessOverallRisk(nlpInsights, reportData);
    
    // Indicadores de progresso
    const progressIndicators = this.analyzeProgressIndicators(nlpInsights, reportData);
    
    return {
      executiveSummary,
      keyFindings,
      clinicalRecommendations,
      predictiveAlerts,
      riskAssessment,
      progressIndicators
    };
  }
  
  /**
   * Prepara dados para visualizações
   */
  private static prepareVisualizationData(enhanced: EnhancedReportData) {
    return {
      sentimentEvolution: this.prepareSentimentEvolutionChart(enhanced.nlpInsights),
      urgencyHeatmap: this.prepareUrgencyHeatmap(enhanced.nlpInsights),
      entityWordCloud: this.prepareEntityWordCloud(enhanced.nlpInsights),
      correlationMatrix: this.prepareCorrelationMatrix(enhanced)
    };
  }
  
  // === Métodos auxiliares ===
  
  private static generateClinicalAlerts(nlpResults: NLPAnalysisResult[]): string[] {
    const alerts: string[] = [];
    
    const avgUrgency = nlpResults.reduce((sum, r) => sum + r.urgencyLevel, 0) / nlpResults.length;
    if (avgUrgency > 7) {
      alerts.push('Nível de urgência elevado detectado - considere reavaliação médica');
    }
    
    const negativeCount = nlpResults.filter(r => r.sentiment.label === 'NEGATIVE').length;
    if (negativeCount / nlpResults.length > 0.7) {
      alerts.push('Padrão emocional preocupante - suporte psicológico recomendado');
    }
    
    return alerts;
  }
  
  private static analyzeTextualPatterns(texts: string[]) {
    // Extrair frases frequentes (implementação simplificada)
    const allWords = texts.join(' ').toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};
    
    allWords.forEach(word => {
      if (word.length > 3 && !/^\d+$/.test(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    const frequentPhrases = Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));
    
    return {
      frequentPhrases,
      emotionalProgression: 'Análise de progressão emocional em desenvolvimento',
      languageEvolution: 'Análise de evolução linguística em desenvolvimento'
    };
  }
  
  private static calculateCorrelations(reportData: ReportData) {
    return [
      {
        type: 'Dor vs Crises',
        correlation: reportData.averagePain > 6 && reportData.crisisEpisodes > 2 ? 0.8 : 0.3,
        significance: reportData.averagePain > 6 ? 'high' as const : 'low' as const,
        description: `Correlação entre nível de dor (${reportData.averagePain}) e episódios de crise (${reportData.crisisEpisodes})`
      }
    ];
  }
  
  private static detectTemporalPatterns(reportData: ReportData) {
    return [
      {
        pattern: 'Consistência de registros',
        frequency: reportData.adherenceRate,
        timeframe: 'Período analisado',
        impact: reportData.adherenceRate > 80 ? 'Positivo - boa adesão' : 'Necessita melhorar adesão'
      }
    ];
  }
  
  private static identifyBehavioralChains(reportData: ReportData) {
    return [
      {
        sequence: ['Dor elevada', 'Medicação', 'Monitoramento'],
        probability: reportData.averagePain > 6 ? 0.8 : 0.4,
        outcomes: ['Gestão da dor', 'Busca por alívio']
      }
    ];
  }
  
  private static calculatePainTrend(painEvolution: ReportData['painEvolution']): number {
    if (painEvolution.length < 2) return 0;
    
    const first = painEvolution.slice(0, Math.floor(painEvolution.length / 2))
      .reduce((sum, p) => sum + p.level, 0) / Math.floor(painEvolution.length / 2);
    
    const last = painEvolution.slice(Math.floor(painEvolution.length / 2))
      .reduce((sum, p) => sum + p.level, 0) / (painEvolution.length - Math.floor(painEvolution.length / 2));
    
    return last - first;
  }
  
  private static generateExecutiveSummary(reportData?: ReportData, nlpInsights?: NLPInsights): string {
    if (!reportData) return 'Dados insuficientes para análise';
    
    const sentiment = nlpInsights?.overallSentiment.label || 'NEUTRAL';
    const sentimentText = sentiment === 'POSITIVE' ? 'positivo' : 
                         sentiment === 'NEGATIVE' ? 'preocupante' : 'neutro';
    
    return `Análise de ${reportData.totalDays} dias com ${reportData.crisisEpisodes} episódios de crise registrados. ` +
           `Dor média de ${reportData.averagePain}/10 e estado emocional geral ${sentimentText}. ` +
           `Taxa de adesão ao monitoramento: ${reportData.adherenceRate}%.`;
  }
  
  private static extractKeyFindings(nlpInsights?: NLPInsights, patternInsights?: PatternInsights, reportData?: ReportData): string[] {
    const findings: string[] = [];
    
    if (reportData?.averagePain && reportData.averagePain > 6) {
      findings.push(`Nível elevado de dor média (${reportData.averagePain}/10)`);
    }
    
    if (nlpInsights?.clinicalAlerts && nlpInsights.clinicalAlerts.length > 0) {
      findings.push(...nlpInsights.clinicalAlerts);
    }
    
    if (reportData?.adherenceRate && reportData.adherenceRate > 80) {
      findings.push('Excelente adesão ao monitoramento diário');
    }
    
    return findings.slice(0, 5);
  }
  
  private static generateClinicalRecommendations(nlpInsights?: NLPInsights, reportData?: ReportData): string[] {
    const recommendations: string[] = [];
    
    if (reportData?.averagePain && reportData.averagePain > 7) {
      recommendations.push('Considere reavaliação do esquema analgésico atual');
    }
    
    if (nlpInsights?.overallSentiment.label === 'NEGATIVE') {
      recommendations.push('Suporte psicológico pode ser benéfico');
    }
    
    if (reportData?.adherenceRate && reportData.adherenceRate < 60) {
      recommendations.push('Estratégias para melhorar adesão ao monitoramento');
    }
    
    return recommendations;
  }
  
  private static generatePredictiveAlerts(nlpInsights?: NLPInsights, patternInsights?: PatternInsights, reportData?: ReportData): PredictiveAlert[] {
    const alerts: PredictiveAlert[] = [];
    
    if (reportData?.crisisEpisodes && reportData.crisisEpisodes > 3) {
      alerts.push({
        type: 'crisis',
        urgency: 'high',
        probability: 0.7,
        description: 'Padrão de crises frequentes detectado',
        recommendation: 'Monitoramento intensivo recomendado',
        timeframe: 'Próximos 7-14 dias'
      });
    }
    
    return alerts;
  }
  
  private static assessOverallRisk(nlpInsights?: NLPInsights, reportData?: ReportData) {
    let riskScore = 0;
    const factors: string[] = [];
    
    if (reportData?.averagePain && reportData.averagePain > 7) {
      riskScore += 3;
      factors.push('Dor elevada');
    }
    
    if (nlpInsights?.overallSentiment.label === 'NEGATIVE') {
      riskScore += 2;
      factors.push('Estado emocional negativo');
    }
    
    if (reportData?.crisisEpisodes && reportData.crisisEpisodes > 2) {
      riskScore += 2;
      factors.push('Múltiplos episódios de crise');
    }
    
    const overall: 'low' | 'medium' | 'high' | 'critical' = riskScore > 6 ? 'critical' : 
                   riskScore > 4 ? 'high' : 
                   riskScore > 2 ? 'medium' : 'low';
    
    return { overall, factors, score: riskScore };
  }
  
  private static analyzeProgressIndicators(nlpInsights?: NLPInsights, reportData?: ReportData) {
    const improvement: string[] = [];
    const concerning: string[] = [];
    const stable: string[] = [];
    
    if (reportData?.adherenceRate && reportData.adherenceRate > 75) {
      improvement.push('Boa adesão ao monitoramento');
    }
    
    if (reportData?.averagePain && reportData.averagePain > 7) {
      concerning.push('Nível de dor elevado');
    } else if (reportData?.averagePain && reportData.averagePain < 4) {
      improvement.push('Controle adequado da dor');
    } else {
      stable.push('Dor em nível moderado');
    }
    
    return { improvement, concerning, stable };
  }
  
  private static prepareSentimentEvolutionChart(nlpInsights?: NLPInsights) {
    if (!nlpInsights?.sentimentEvolution) return [];
    
    return nlpInsights.sentimentEvolution.map(item => ({
      date: item.date,
      positive: item.sentiment.label === 'POSITIVE' ? item.sentiment.score * 100 : 0,
      negative: item.sentiment.label === 'NEGATIVE' ? item.sentiment.score * 100 : 0,
      neutral: item.sentiment.label === 'NEUTRAL' ? item.sentiment.score * 100 : 0
    }));
  }
  
  private static prepareUrgencyHeatmap(nlpInsights?: NLPInsights) {
    // Implementação simplificada para heatmap de urgência
    return nlpInsights?.urgencyTimeline.map((item, index) => ({
      day: item.date,
      hour: 14, // Assumir horário padrão por simplicidade
      intensity: item.level
    })) || [];
  }
  
  private static prepareEntityWordCloud(nlpInsights?: NLPInsights) {
    const entities: Array<{ entity: string; frequency: number; category: string }> = [];
    
    if (nlpInsights?.medicalEntities) {
      Object.entries(nlpInsights.medicalEntities).forEach(([category, entityList]) => {
        entityList.forEach(entity => {
          entities.push({
            entity: entity.entity,
            frequency: Math.round(entity.confidence * 10),
            category
          });
        });
      });
    }
    
    return entities;
  }
  
  private static prepareCorrelationMatrix(enhanced: EnhancedReportData) {
    // Matriz de correlação simplificada
    return [
      { x: 'Dor', y: 'Humor', correlation: 0.7 },
      { x: 'Medicação', y: 'Alívio', correlation: 0.6 }
    ];
  }
}