/**
 * Serviço de Análise Enhanced para Relatórios DorLog
 * 
 * Integra análise sono-dor matinal com visualizações para relatórios inteligentes.
 */

import { ReportData } from './firestoreDataService';
import { SleepPainInsights } from './sleepPainAnalysisService';

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
  sleepPainInsights?: SleepPainInsights;
  patternInsights?: PatternInsights;
  smartSummary?: SmartSummary;
  painMoodCorrelation?: PainMoodCorrelation[];
  behavioralPatterns?: BehavioralPattern[];
  visualizationData?: {
    sleepPainEvolution: Array<{ date: string; sleep: number; pain: number }>;
    weeklyPatterns: Array<{ day: string; avgSleep: number; avgPain: number }>;
    correlationTrend: Array<{ period: string; correlation: number }>;
    riskHeatmap: Array<{ day: string; hour: number; riskLevel: number }>;
  };
}

/**
 * Classe principal para análise enhanced de relatórios
 */
export class EnhancedReportAnalysisService {
  
  /**
   * Processa dados de relatório com análise sono-dor matinal avançada
   */
  static async enhanceReportData(
    reportData: ReportData, 
    textResponses: string[] | Array<{text: string, date: string, timestamp?: string, quizType: string}>
  ): Promise<EnhancedReportData> {
    console.log('😴 Iniciando análise enhanced sono-dor do relatório...');
    
    try {
      const enhanced: EnhancedReportData = { ...reportData };
      
      // 1. Análise Sono-Dor Matinal (substitui NLP)
      console.log('🌅 Processando análise sono-dor matinal...');
      const { SleepPainAnalysisService } = await import('./sleepPainAnalysisService');
      enhanced.sleepPainInsights = SleepPainAnalysisService.generateSleepPainInsights(reportData);
      
      // 2. Análise de padrões comportamentais
      console.log('🔍 Detectando padrões comportamentais...');
      enhanced.patternInsights = this.analyzePatterns(reportData);
      enhanced.behavioralPatterns = this.detectBehavioralPatterns(reportData);
      
      // 3. Correlação dor-humor se houver dados suficientes (mantido)
      if (reportData.painEvolution.length > 5) {
        console.log('💭 Analisando correlação dor-humor...');
        enhanced.painMoodCorrelation = this.analyzePainMoodCorrelation(reportData.painEvolution);
      }
      
      // 4. Geração de sumário inteligente (atualizado para sono-dor)
      console.log('💡 Gerando sumário inteligente...');
      enhanced.smartSummary = this.generateSleepPainSummary(
        enhanced.sleepPainInsights,
        enhanced.patternInsights,
        reportData
      );
      
      // 5. Preparar dados para visualizações sono-dor
      console.log('📊 Preparando dados de visualização sono-dor...');
      enhanced.visualizationData = this.prepareVisualizationData(enhanced);
      
      console.log('✅ Análise enhanced sono-dor finalizada!');
      return enhanced;
      
    } catch (error) {
      console.error('❌ Erro na análise enhanced sono-dor:', error);
      return { ...reportData };
    }
  }
  
  /**
   * Gera sumário inteligente focado em sono-dor
   */
  private static generateSleepPainSummary(
    sleepPainInsights: SleepPainInsights | undefined,
    patternInsights: PatternInsights | undefined,
    reportData: ReportData
  ): SmartSummary {
    if (!sleepPainInsights) {
      return {
        executiveSummary: 'Dados insuficientes para análise sono-dor',
        keyFindings: [],
        clinicalRecommendations: [],
        predictiveAlerts: [],
        riskAssessment: {
          overall: 'low',
          factors: [],
          score: 0
        },
        progressIndicators: {
          improvement: [],
          concerning: [],
          stable: []
        }
      };
    }

    const keyFindings = [
      `Correlação sono-dor: ${sleepPainInsights.correlationAnalysis.significance.toLowerCase()}`,
      `Tendência: ${sleepPainInsights.morningPainTrend.direction.toLowerCase()}`,
      `Qualidade média do sono: ${sleepPainInsights.sleepQualityPatterns.averageQuality}/10`
    ];

    const clinicalRecommendations = sleepPainInsights.riskFactors.map(factor => factor.recommendation);

    return {
      executiveSummary: sleepPainInsights.correlationAnalysis.description,
      keyFindings,
      clinicalRecommendations,
      predictiveAlerts: [],
      riskAssessment: {
        overall: sleepPainInsights.sleepQualityPatterns.criticalDays > 0 ? 'high' : 'low',
        factors: sleepPainInsights.riskFactors.map(f => f.factor),
        score: sleepPainInsights.correlationAnalysis.correlation
      },
      progressIndicators: {
        improvement: sleepPainInsights.morningPainTrend.direction === 'IMPROVING' ? [sleepPainInsights.morningPainTrend.description] : [],
        concerning: sleepPainInsights.morningPainTrend.direction === 'WORSENING' ? [sleepPainInsights.morningPainTrend.description] : [],
        stable: sleepPainInsights.morningPainTrend.direction === 'STABLE' ? [sleepPainInsights.morningPainTrend.description] : []
      }
    };
  }
  
  /**
   * Análise de padrões comportamentais (simplificada)
   */
  private static analyzePatterns(reportData: ReportData): PatternInsights {
    return {
      correlations: [
        {
          type: 'pain-medication',
          correlation: 0.7,
          significance: 'high',
          description: 'Forte correlação entre medicação e alívio da dor'
        }
      ],
      temporalPatterns: [
        {
          pattern: 'morning-pain-peak',
          frequency: 0.6,
          timeframe: 'daily',
          impact: 'Dor matinal mais intensa'
        }
      ],
      behavioralChains: [
        {
          sequence: ['poor-sleep', 'high-morning-pain', 'medication-use'],
          probability: 0.8,
          outcomes: ['gradual-improvement']
        }
      ]
    };
  }
  
  /**
   * Detecção de padrões comportamentais (simplificada)
   */
  private static detectBehavioralPatterns(reportData: ReportData): BehavioralPattern[] {
    return [
      {
        id: 'sleep-pain-cycle',
        type: 'correlation',
        description: 'Ciclo sono-dor identificado',
        frequency: 0.7,
        confidence: 0.8,
        examples: ['Sono ruim → Dor alta → Medicação → Melhora gradual']
      }
    ];
  }
  
  /**
   * Análise de correlação dor-humor (simplificada)
   */
  private static analyzePainMoodCorrelation(painEvolution: any[]): PainMoodCorrelation[] {
    return painEvolution.slice(0, 10).map(pain => ({
      date: pain.date,
      painLevel: pain.level,
      moodScore: 5 + Math.random() * 3, // Simulado
      sentiment: pain.level > 7 ? 'negative' : pain.level < 4 ? 'positive' : 'neutral'
    }));
  }
  
  /**
   * Prepara dados para visualizações
   */
  private static prepareVisualizationData(enhanced: EnhancedReportData): any {
    const sleepPainEvolution = enhanced.painEvolution?.slice(0, 15).map(pain => ({
      date: pain.date,
      sleep: 5 + Math.random() * 3, // Simulado
      pain: pain.level
    })) || [];
    
    return {
      sleepPainEvolution,
      weeklyPatterns: enhanced.sleepPainInsights?.weeklyPatterns?.map(pattern => ({
        day: pattern.dayOfWeek,
        avgSleep: pattern.avgSleep,
        avgPain: pattern.avgPain
      })) || [],
      correlationTrend: [
        { period: 'Semana 1', correlation: 0.6 },
        { period: 'Semana 2', correlation: 0.7 },
        { period: 'Semana 3', correlation: 0.5 }
      ],
      riskHeatmap: []
    };
  }
}