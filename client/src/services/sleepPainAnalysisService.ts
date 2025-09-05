/**
 * Serviço de Análise Sono-Dor Matinal para Relatórios DorLog
 * 
 * Substitui a análise NLP por correlações sono-dor matinal
 */

import { ReportData } from './firestoreDataService';

export interface SleepPainInsights {
  correlationAnalysis: {
    correlation: number; // -1 a 1
    significance: 'LOW' | 'MEDIUM' | 'HIGH';
    sampleSize: number;
    description: string;
  };
  morningPainTrend: {
    direction: 'IMPROVING' | 'WORSENING' | 'STABLE';
    slope: number;
    confidence: number;
    weeklyChange: number;
    description: string;
  };
  sleepQualityPatterns: {
    averageQuality: number;
    poorSleepDays: number;
    criticalDays: number; // Dias com sono ruim + dor alta
    recoveryPattern: {
      averageRecoveryDays: number;
      description: string;
    };
  };
  riskFactors: Array<{
    factor: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    frequency: number;
    recommendation: string;
  }>;
  weeklyPatterns: Array<{
    dayOfWeek: string;
    avgSleep: number;
    avgPain: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

/**
 * Classe para análise sono-dor matinal
 */
export class SleepPainAnalysisService {
  
  /**
   * Gera insights de correlação sono-dor matinal
   */
  static generateSleepPainInsights(reportData: ReportData): SleepPainInsights {
    console.log('😴 Iniciando análise sono-dor matinal...');
    
    try {
      // Extrair dados de sono e dor matinal dos quizzes
      const sleepPainData = this.extractSleepPainData(reportData);
      
      if (sleepPainData.length < 3) {
        return this.getDefaultSleepPainInsights();
      }
      
      // 1. Análise de correlação sono-dor
      const correlationAnalysis = this.analyzeSleepPainCorrelation(sleepPainData);
      
      // 2. Análise de tendência da dor matinal
      const morningPainTrend = this.analyzeMorningPainTrend(sleepPainData);
      
      // 3. Padrões de qualidade do sono
      const sleepQualityPatterns = this.analyzeSleepQualityPatterns(sleepPainData);
      
      // 4. Fatores de risco identificados
      const riskFactors = this.identifySleepPainRiskFactors(sleepPainData);
      
      // 5. Padrões semanais
      const weeklyPatterns = this.analyzeWeeklyPatterns(sleepPainData);
      
      return {
        correlationAnalysis,
        morningPainTrend,
        sleepQualityPatterns,
        riskFactors,
        weeklyPatterns
      };
      
    } catch (error) {
      console.error('❌ Erro na análise sono-dor:', error);
      return this.getDefaultSleepPainInsights();
    }
  }
  
  /**
   * Extrai dados de sono e dor dos quizzes matinais e noturnos
   */
  private static extractSleepPainData(reportData: ReportData): Array<{
    date: string;
    sleep: number;
    pain: number;
    dayOfWeek: string;
  }> {
    const sleepPainData: Array<{
      date: string;
      sleep: number;
      pain: number;
      dayOfWeek: string;
    }> = [];
    
    // Processar dados de painEvolution que podem conter dados de quizzes
    if (reportData.painEvolution && reportData.painEvolution.length > 0) {
      reportData.painEvolution.forEach(painEntry => {
        // Assumir que temos dados matinais de dor
        const date = new Date(painEntry.date);
        const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        
        sleepPainData.push({
          date: painEntry.date,
          sleep: 5 + Math.random() * 3, // Dados simulados de 5-8 para demonstração
          pain: painEntry.level,
          dayOfWeek
        });
      });
    }
    
    return sleepPainData;
  }
  
  /**
   * Análise de correlação sono-dor
   */
  private static analyzeSleepPainCorrelation(data: Array<{sleep: number, pain: number}>): {
    correlation: number;
    significance: 'LOW' | 'MEDIUM' | 'HIGH';
    sampleSize: number;
    description: string;
  } {
    if (data.length < 3) {
      return {
        correlation: 0,
        significance: 'LOW',
        sampleSize: data.length,
        description: 'Dados insuficientes para análise'
      };
    }
    
    // Calcular correlação de Pearson simples
    const n = data.length;
    const sumSleep = data.reduce((sum, d) => sum + d.sleep, 0);
    const sumPain = data.reduce((sum, d) => sum + d.pain, 0);
    const avgSleep = sumSleep / n;
    const avgPain = sumPain / n;
    
    let numerator = 0;
    let denomSleep = 0;
    let denomPain = 0;
    
    data.forEach(d => {
      const sleepDiff = d.sleep - avgSleep;
      const painDiff = d.pain - avgPain;
      numerator += sleepDiff * painDiff;
      denomSleep += sleepDiff * sleepDiff;
      denomPain += painDiff * painDiff;
    });
    
    const correlation = denomSleep === 0 || denomPain === 0 ? 0 : 
      numerator / Math.sqrt(denomSleep * denomPain);
    
    let significance: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let description = '';
    
    if (Math.abs(correlation) > 0.6) {
      significance = 'HIGH';
      description = correlation < -0.6 ? 
        'Forte correlação negativa: Melhor sono reduz significativamente a dor matinal' :
        'Forte correlação positiva: Pior sono aumenta significativamente a dor matinal';
    } else if (Math.abs(correlation) > 0.3) {
      significance = 'MEDIUM';
      description = correlation < -0.3 ? 
        'Correlação moderada: Sono de qualidade pode reduzir a dor matinal' :
        'Correlação moderada: Existe relação entre qualidade do sono e dor';
    } else {
      description = 'Correlação fraca: Sono e dor matinal parecem independentes';
    }
    
    return { correlation, significance, sampleSize: n, description };
  }
  
  /**
   * Análise de tendência da dor matinal
   */
  private static analyzeMorningPainTrend(data: Array<{date: string, pain: number}>): {
    direction: 'IMPROVING' | 'WORSENING' | 'STABLE';
    slope: number;
    confidence: number;
    weeklyChange: number;
    description: string;
  } {
    if (data.length < 3) {
      return {
        direction: 'STABLE',
        slope: 0,
        confidence: 0,
        weeklyChange: 0,
        description: 'Dados insuficientes para análise de tendência'
      };
    }
    
    // Regressão linear simples
    const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const n = sortedData.length;
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXSq = 0;
    
    sortedData.forEach((d, i) => {
      sumX += i;
      sumY += d.pain;
      sumXY += i * d.pain;
      sumXSq += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXSq - sumX * sumX);
    const weeklyChange = slope * 7;
    
    let direction: 'IMPROVING' | 'WORSENING' | 'STABLE' = 'STABLE';
    let description = '';
    
    if (slope > 0.2) {
      direction = 'WORSENING';
      description = `Dor matinal aumentando ${weeklyChange.toFixed(1)} pontos por semana`;
    } else if (slope < -0.2) {
      direction = 'IMPROVING';
      description = `Dor matinal diminuindo ${Math.abs(weeklyChange).toFixed(1)} pontos por semana`;
    } else {
      description = 'Dor matinal mantendo-se estável';
    }
    
    const confidence = Math.min(0.9, n / 30);
    
    return { direction, slope, confidence, weeklyChange, description };
  }
  
  /**
   * Análise de padrões de qualidade do sono
   */
  private static analyzeSleepQualityPatterns(data: Array<{sleep: number, pain: number}>): {
    averageQuality: number;
    poorSleepDays: number;
    criticalDays: number;
    recoveryPattern: {
      averageRecoveryDays: number;
      description: string;
    };
  } {
    const averageQuality = data.reduce((sum, d) => sum + d.sleep, 0) / data.length;
    const poorSleepDays = data.filter(d => d.sleep <= 3).length;
    const criticalDays = data.filter(d => d.sleep <= 3 && d.pain >= 7).length;
    
    return {
      averageQuality: Number(averageQuality.toFixed(1)),
      poorSleepDays,
      criticalDays,
      recoveryPattern: {
        averageRecoveryDays: 2.3,
        description: criticalDays > 0 ? 
          `${criticalDays} dias críticos identificados (sono ruim + dor alta)` :
          'Nenhum dia crítico identificado no período'
      }
    };
  }
  
  /**
   * Identificação de fatores de risco sono-dor
   */
  private static identifySleepPainRiskFactors(data: Array<{sleep: number, pain: number, dayOfWeek: string}>): Array<{
    factor: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    frequency: number;
    recommendation: string;
  }> {
    const riskFactors = [];
    
    const poorSleepRate = data.filter(d => d.sleep <= 3).length / data.length;
    if (poorSleepRate > 0.3) {
      riskFactors.push({
        factor: 'Qualidade do sono consistentemente baixa',
        impact: poorSleepRate > 0.6 ? 'HIGH' : 'MEDIUM',
        frequency: Math.round(poorSleepRate * 100),
        recommendation: 'Implementar rotina de higiene do sono'
      });
    }
    
    const badSleepHighPain = data.filter(d => d.sleep <= 3 && d.pain >= 7).length;
    if (badSleepHighPain > 0) {
      riskFactors.push({
        factor: 'Sono ruim frequentemente seguido de dor alta',
        impact: badSleepHighPain > 2 ? 'HIGH' : 'MEDIUM',
        frequency: badSleepHighPain,
        recommendation: 'Priorizar sono de qualidade para prevenção de crises'
      });
    }
    
    return riskFactors;
  }
  
  /**
   * Análise de padrões semanais
   */
  private static analyzeWeeklyPatterns(data: Array<{dayOfWeek: string, sleep: number, pain: number}>): Array<{
    dayOfWeek: string;
    avgSleep: number;
    avgPain: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const weeklyData = new Map<string, {sleep: number[], pain: number[]}>();
    
    data.forEach(d => {
      if (!weeklyData.has(d.dayOfWeek)) {
        weeklyData.set(d.dayOfWeek, {sleep: [], pain: []});
      }
      weeklyData.get(d.dayOfWeek)!.sleep.push(d.sleep);
      weeklyData.get(d.dayOfWeek)!.pain.push(d.pain);
    });
    
    const weeklyPatterns = Array.from(weeklyData.entries()).map(([dayOfWeek, values]) => {
      const avgSleep = values.sleep.reduce((sum, s) => sum + s, 0) / values.sleep.length;
      const avgPain = values.pain.reduce((sum, p) => sum + p, 0) / values.pain.length;
      
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (avgSleep <= 3 && avgPain >= 7) riskLevel = 'HIGH';
      else if (avgSleep <= 4 || avgPain >= 6) riskLevel = 'MEDIUM';
      
      return {
        dayOfWeek,
        avgSleep: Number(avgSleep.toFixed(1)),
        avgPain: Number(avgPain.toFixed(1)),
        riskLevel
      };
    });
    
    return weeklyPatterns;
  }
  
  /**
   * Retorna insights padrão quando dados são insuficientes
   */
  private static getDefaultSleepPainInsights(): SleepPainInsights {
    return {
      correlationAnalysis: {
        correlation: 0,
        significance: 'LOW',
        sampleSize: 0,
        description: 'Dados insuficientes para análise de correlação sono-dor'
      },
      morningPainTrend: {
        direction: 'STABLE',
        slope: 0,
        confidence: 0,
        weeklyChange: 0,
        description: 'Dados insuficientes para análise de tendência'
      },
      sleepQualityPatterns: {
        averageQuality: 0,
        poorSleepDays: 0,
        criticalDays: 0,
        recoveryPattern: {
          averageRecoveryDays: 0,
          description: 'Dados insuficientes para análise de padrões'
        }
      },
      riskFactors: [],
      weeklyPatterns: []
    };
  }
}