/**
 * Serviço de Detecção de Padrões para DorLog
 * 
 * Analisa correlações entre quizzes, detecta tendências
 * e identifica padrões comportamentais nos dados de saúde.
 */

export interface QuizData {
  tipo: 'matinal' | 'noturno' | 'emergencial';
  timestamp: Date;
  respostas: Record<string, any>;
}

export interface ReportData {
  date: string;
  quizzes: QuizData[];
  medicamentos?: any[];
}

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  correlation: number; // -1 a 1
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  sampleSize: number;
}

export interface TrendResult {
  metric: string;
  direction: 'IMPROVING' | 'WORSENING' | 'STABLE';
  slope: number;
  confidence: number;
}

export interface PatternResult {
  pattern: string;
  frequency: number;
  strength: number;
  examples: string[];
}

/**
 * Classe para detecção de padrões nos dados de saúde
 */
export class PatternDetectionService {
  
  /**
   * Analisa correlação entre humor noturno e crises emergenciais
   */
  analyzeMoodCrisisCorrelation(reports: ReportData[]): CorrelationResult[] {
    console.log('🔗 Analisando correlação humor-crise...');
    
    const correlations: CorrelationResult[] = [];
    const moodCrisisData: Array<{mood: string, hasCrisis: boolean, date: string}> = [];

    // Extrair dados de humor e crises
    reports.forEach(report => {
      const nightQuiz = report.quizzes.find(q => q.tipo === 'noturno');
      const emergencyQuizzes = report.quizzes.filter(q => q.tipo === 'emergencial');
      
      if (nightQuiz?.respostas['9']) {
        const mood = nightQuiz.respostas['9'];
        const hasCrisis = emergencyQuizzes.length > 0;
        
        moodCrisisData.push({
          mood: mood as string,
          hasCrisis,
          date: report.date
        });
      }
    });

    // Calcular correlação para cada estado de humor
    const moodStates = ['Ansioso', 'Triste', 'Irritado', 'Calmo', 'Feliz', 'Depressivo'];
    
    moodStates.forEach(moodState => {
      const moodData = moodCrisisData.filter(d => d.mood === moodState);
      const crisisRate = moodData.filter(d => d.hasCrisis).length / Math.max(moodData.length, 1);
      
      if (moodData.length >= 3) { // Mínimo de amostras
        correlations.push({
          variable1: `Humor: ${moodState}`,
          variable2: 'Ocorrência de Crise',
          correlation: crisisRate > 0.6 ? 0.8 : crisisRate > 0.3 ? 0.5 : 0.2,
          significance: crisisRate > 0.6 ? 'HIGH' : crisisRate > 0.3 ? 'MEDIUM' : 'LOW',
          sampleSize: moodData.length
        });
      }
    });

    return correlations;
  }

  /**
   * Detecta padrões temporais nas crises emergenciais
   */
  detectEmergencyTimePatterns(reports: ReportData[]): PatternResult[] {
    console.log('⏰ Detectando padrões temporais de crises...');
    
    const patterns: PatternResult[] = [];
    const crisisData: Array<{hour: number, day: string, triggers: string[]}> = [];

    // Extrair dados das crises
    reports.forEach(report => {
      const emergencyQuizzes = report.quizzes.filter(q => q.tipo === 'emergencial');
      
      emergencyQuizzes.forEach(quiz => {
        const hour = new Date(quiz.timestamp).getHours();
        const day = new Date(quiz.timestamp).toLocaleDateString('pt-BR', { weekday: 'long' });
        const triggers = quiz.respostas['5'] || [];
        
        crisisData.push({ hour, day, triggers: Array.isArray(triggers) ? triggers : [] });
      });
    });

    // Padrão de horários
    const hourDistribution = new Map<number, number>();
    crisisData.forEach(crisis => {
      hourDistribution.set(crisis.hour, (hourDistribution.get(crisis.hour) || 0) + 1);
    });

    const peakHour = Array.from(hourDistribution.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    if (peakHour && peakHour[1] >= 2) {
      patterns.push({
        pattern: `Crises concentradas às ${peakHour[0]}h`,
        frequency: peakHour[1],
        strength: peakHour[1] / Math.max(crisisData.length, 1),
        examples: [`${peakHour[1]} crises registradas neste horário`]
      });
    }

    // Padrão de dias da semana
    const dayDistribution = new Map<string, number>();
    crisisData.forEach(crisis => {
      dayDistribution.set(crisis.day, (dayDistribution.get(crisis.day) || 0) + 1);
    });

    const peakDay = Array.from(dayDistribution.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    if (peakDay && peakDay[1] >= 2) {
      patterns.push({
        pattern: `Maior incidência de crises em ${peakDay[0]}`,
        frequency: peakDay[1],
        strength: peakDay[1] / Math.max(crisisData.length, 1),
        examples: [`${peakDay[1]} crises registradas neste dia da semana`]
      });
    }

    return patterns;
  }

  /**
   * Analisa tendências na evolução da dor
   */
  analyzePainTrends(reports: ReportData[]): TrendResult[] {
    console.log('📈 Analisando tendências de dor...');
    
    const trends: TrendResult[] = [];
    const painData: Array<{date: Date, eva: number, tipo: string}> = [];

    // Extrair dados de dor de todos os quizzes
    reports.forEach(report => {
      report.quizzes.forEach(quiz => {
        if (quiz.respostas['1'] && typeof quiz.respostas['1'] === 'number') {
          painData.push({
            date: new Date(report.date),
            eva: quiz.respostas['1'],
            tipo: quiz.tipo
          });
        }
        if (quiz.respostas['2'] && typeof quiz.respostas['2'] === 'number') {
          painData.push({
            date: new Date(report.date),
            eva: quiz.respostas['2'],
            tipo: quiz.tipo
          });
        }
      });
    });

    if (painData.length < 3) return trends;

    // Calcular tendência geral
    const sortedData = painData.sort((a, b) => a.date.getTime() - b.date.getTime());
    const slope = this.calculateSlope(sortedData.map((d, i) => ({ x: i, y: d.eva })));
    
    trends.push({
      metric: 'Dor Geral',
      direction: slope > 0.2 ? 'WORSENING' : slope < -0.2 ? 'IMPROVING' : 'STABLE',
      slope,
      confidence: Math.min(0.9, painData.length / 30) // Mais dados = maior confiança
    });

    // Tendências por tipo de quiz
    ['matinal', 'noturno', 'emergencial'].forEach(tipo => {
      const tipoData = painData.filter(d => d.tipo === tipo);
      if (tipoData.length >= 3) {
        const tipoSorted = tipoData.sort((a, b) => a.date.getTime() - b.date.getTime());
        const tipoSlope = this.calculateSlope(tipoSorted.map((d, i) => ({ x: i, y: d.eva })));
        
        trends.push({
          metric: `Dor ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
          direction: tipoSlope > 0.2 ? 'WORSENING' : tipoSlope < -0.2 ? 'IMPROVING' : 'STABLE',
          slope: tipoSlope,
          confidence: Math.min(0.9, tipoData.length / 15)
        });
      }
    });

    return trends;
  }

  /**
   * Detecta associações entre gatilhos e tipos de dor
   */
  detectTriggerPainAssociations(reports: ReportData[]): CorrelationResult[] {
    console.log('🎯 Detectando associações gatilho-dor...');
    
    const correlations: CorrelationResult[] = [];
    const associationData: Array<{triggers: string[], painType: string[], intensity: number}> = [];

    // Extrair dados das crises emergenciais
    reports.forEach(report => {
      const emergencyQuizzes = report.quizzes.filter(q => q.tipo === 'emergencial');
      
      emergencyQuizzes.forEach(quiz => {
        const triggers = quiz.respostas['5'] || [];
        const painType = quiz.respostas['3'] || [];
        const intensity = quiz.respostas['1'] || 0;
        
        if (Array.isArray(triggers) && Array.isArray(painType)) {
          associationData.push({ triggers, painType, intensity });
        }
      });
    });

    // Analisar associações
    const triggerOptions = ['Estresse', 'Mudança do tempo', 'Falta de sono', 'Atividade física', 'Alimentação', 'Postura', 'Trabalho'];
    const painTypeOptions = ['Pulsante', 'Latejante', 'Aguda', 'Queimação', 'Formigamento', 'Peso', 'Pressão', 'Pontada', 'Cólica', 'Contínua'];

    triggerOptions.forEach(trigger => {
      painTypeOptions.forEach(painType => {
        const withBoth = associationData.filter(d => 
          d.triggers.includes(trigger) && d.painType.includes(painType)
        );
        const withTrigger = associationData.filter(d => d.triggers.includes(trigger));
        
        if (withTrigger.length >= 2 && withBoth.length > 0) {
          const associationRate = withBoth.length / withTrigger.length;
          
          if (associationRate > 0.4) { // Limite mínimo para correlação significativa
            correlations.push({
              variable1: `Gatilho: ${trigger}`,
              variable2: `Tipo de Dor: ${painType}`,
              correlation: associationRate,
              significance: associationRate > 0.7 ? 'HIGH' : associationRate > 0.5 ? 'MEDIUM' : 'LOW',
              sampleSize: withTrigger.length
            });
          }
        }
      });
    });

    return correlations.sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Analisa eficácia medicamentosa baseada nos relatos
   */
  analyzeMedicationEffectiveness(reports: ReportData[]): PatternResult[] {
    console.log('💊 Analisando eficácia medicamentosa...');
    
    const patterns: PatternResult[] = [];
    const medicationData: Array<{response: string, intensity: number, date: string}> = [];

    // Extrair dados de medicação das crises
    reports.forEach(report => {
      const emergencyQuizzes = report.quizzes.filter(q => q.tipo === 'emergencial');
      
      emergencyQuizzes.forEach(quiz => {
        const medicationResponse = quiz.respostas['7'];
        const intensity = quiz.respostas['1'] || 0;
        
        if (medicationResponse) {
          medicationData.push({
            response: medicationResponse as string,
            intensity,
            date: report.date
          });
        }
      });
    });

    // Analisar padrões de eficácia
    const responseTypes = ['Sim, melhorou', 'Sim, não fez efeito', 'Sim, piorou', 'Não tomei ainda', 'Não tenho medicamento'];
    
    responseTypes.forEach(responseType => {
      const responseData = medicationData.filter(d => d.response === responseType);
      
      if (responseData.length >= 2) {
        const avgIntensity = responseData.reduce((sum, d) => sum + d.intensity, 0) / responseData.length;
        const frequency = responseData.length;
        
        patterns.push({
          pattern: `Medicação: ${responseType}`,
          frequency,
          strength: frequency / Math.max(medicationData.length, 1),
          examples: [
            `${frequency} ocorrências`,
            `Intensidade média da dor: ${avgIntensity.toFixed(1)}`,
            `Representa ${((frequency / medicationData.length) * 100).toFixed(1)}% dos casos`
          ]
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Detecta sequências de humor que precedem crises
   */
  detectMoodCrisisSequences(reports: ReportData[]): PatternResult[] {
    console.log('🧠 Detectando sequências humor-crise...');
    
    const patterns: PatternResult[] = [];
    const sortedReports = reports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const sequences: Array<{moodSequence: string[], crisisOccurred: boolean}> = [];

    // Analisar sequências de 3 dias
    for (let i = 0; i < sortedReports.length - 2; i++) {
      const day1 = sortedReports[i];
      const day2 = sortedReports[i + 1];
      const day3 = sortedReports[i + 2];

      const mood1 = day1.quizzes.find(q => q.tipo === 'noturno')?.respostas['9'];
      const mood2 = day2.quizzes.find(q => q.tipo === 'noturno')?.respostas['9'];
      const hasCrisisDay3 = day3.quizzes.some(q => q.tipo === 'emergencial');

      if (mood1 && mood2) {
        sequences.push({
          moodSequence: [mood1 as string, mood2 as string],
          crisisOccurred: hasCrisisDay3
        });
      }
    }

    // Identificar sequências que precedem crises
    const sequenceMap = new Map<string, {total: number, crises: number}>();
    
    sequences.forEach(seq => {
      const key = seq.moodSequence.join(' → ');
      const current = sequenceMap.get(key) || {total: 0, crises: 0};
      
      sequenceMap.set(key, {
        total: current.total + 1,
        crises: current.crises + (seq.crisisOccurred ? 1 : 0)
      });
    });

    // Converter em padrões
    sequenceMap.forEach((data, sequence) => {
      if (data.total >= 2) { // Mínimo de ocorrências
        const crisisRate = data.crises / data.total;
        
        if (crisisRate > 0.4) { // Padrão significativo
          patterns.push({
            pattern: `Sequência: ${sequence}`,
            frequency: data.total,
            strength: crisisRate,
            examples: [
              `${data.crises} crises em ${data.total} ocorrências`,
              `Taxa de predição: ${(crisisRate * 100).toFixed(1)}%`,
              `Risco: ${crisisRate > 0.7 ? 'ALTO' : crisisRate > 0.5 ? 'MÉDIO' : 'BAIXO'}`
            ]
          });
        }
      }
    });

    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Analisa correlação entre qualidade do sono e dor
   */
  analyzeSleepPainCorrelation(reports: ReportData[]): CorrelationResult[] {
    console.log('😴 Analisando correlação sono-dor...');
    
    const correlations: CorrelationResult[] = [];
    const sleepPainData: Array<{sleepQuality: number, nextDayPain: number}> = [];

    const sortedReports = reports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Correlacionar sono de um dia com dor do dia seguinte
    for (let i = 0; i < sortedReports.length - 1; i++) {
      const currentDay = sortedReports[i];
      const nextDay = sortedReports[i + 1];

      const nightQuiz = currentDay.quizzes.find(q => q.tipo === 'noturno');
      const sleepQuality = nightQuiz?.respostas['4']; // Slider 1-10

      const nextDayQuizzes = nextDay.quizzes;
      const nextDayPain = nextDayQuizzes.find(q => q.respostas['1'] || q.respostas['2']);
      const painLevel = nextDayPain?.respostas['1'] || nextDayPain?.respostas['2'];

      if (typeof sleepQuality === 'number' && typeof painLevel === 'number') {
        sleepPainData.push({
          sleepQuality,
          nextDayPain: painLevel
        });
      }
    }

    if (sleepPainData.length >= 3) {
      const correlation = this.calculateCorrelation(
        sleepPainData.map(d => d.sleepQuality),
        sleepPainData.map(d => d.nextDayPain)
      );

      correlations.push({
        variable1: 'Qualidade do Sono',
        variable2: 'Dor do Dia Seguinte',
        correlation,
        significance: Math.abs(correlation) > 0.6 ? 'HIGH' : Math.abs(correlation) > 0.3 ? 'MEDIUM' : 'LOW',
        sampleSize: sleepPainData.length
      });
    }

    return correlations;
  }

  /**
   * Detecta padrões de sintomas associados
   */
  detectSymptomClusters(reports: ReportData[]): PatternResult[] {
    console.log('🎯 Detectando clusters de sintomas...');
    
    const patterns: PatternResult[] = [];
    const symptomCombinations = new Map<string, number>();

    // Extrair combinações de sintomas
    reports.forEach(report => {
      report.quizzes.forEach(quiz => {
        const symptoms = quiz.respostas['3'] || quiz.respostas['6']; // Diferentes perguntas de sintomas
        
        if (Array.isArray(symptoms) && symptoms.length > 1) {
          // Gerar combinações de sintomas
          for (let i = 0; i < symptoms.length; i++) {
            for (let j = i + 1; j < symptoms.length; j++) {
              const combination = [symptoms[i], symptoms[j]].sort().join(' + ');
              symptomCombinations.set(combination, (symptomCombinations.get(combination) || 0) + 1);
            }
          }
        }
      });
    });

    // Identificar combinações frequentes
    symptomCombinations.forEach((frequency, combination) => {
      if (frequency >= 2) { // Mínimo de ocorrências
        patterns.push({
          pattern: `Combinação: ${combination}`,
          frequency,
          strength: frequency / Math.max(reports.length, 1),
          examples: [
            `${frequency} co-ocorrências identificadas`,
            `Taxa de associação: ${((frequency / reports.length) * 100).toFixed(1)}%`
          ]
        });
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calcula coeficiente de correlação de Pearson
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calcula inclinação de tendência linear
   */
  private calculateSlope(points: Array<{x: number, y: number}>): number {
    if (points.length < 2) return 0;

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  /**
   * Análise completa de padrões
   */
  async analyzeAllPatterns(reports: ReportData[]): Promise<{
    correlations: CorrelationResult[];
    trends: TrendResult[];
    patterns: PatternResult[];
  }> {
    console.log('🔍 Iniciando análise completa de padrões...');

    const [
      moodCrisisCorrelations,
      sleepPainCorrelations,
      triggerPainAssociations,
      painTrends,
      timePatterns,
      moodSequences,
      symptomClusters,
      medicationPatterns
    ] = await Promise.all([
      this.analyzeMoodCrisisCorrelation(reports),
      this.analyzeSleepPainCorrelation(reports),
      this.detectTriggerPainAssociations(reports),
      this.analyzePainTrends(reports),
      this.detectEmergencyTimePatterns(reports),
      this.detectMoodCrisisSequences(reports),
      this.detectSymptomClusters(reports),
      this.analyzeMedicationEffectiveness(reports)
    ]);

    return {
      correlations: [
        ...moodCrisisCorrelations,
        ...sleepPainCorrelations,
        ...triggerPainAssociations
      ],
      trends: painTrends,
      patterns: [
        ...timePatterns,
        ...moodSequences,
        ...symptomClusters,
        ...medicationPatterns
      ]
    };
  }
}

// Instância singleton
export const patternDetectionService = new PatternDetectionService();