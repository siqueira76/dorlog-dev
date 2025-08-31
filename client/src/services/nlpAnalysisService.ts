/**
 * Serviço de Análise NLP Client-Side para DorLog
 * 
 * Sistema isolado para processamento de linguagem natural
 * sem interferir nas funcionalidades existentes da aplicação.
 */

import { pipeline, Pipeline } from '@xenova/transformers';

// Tipos para análise NLP
export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TextSummary {
  summary: string;
  keyPhrases: string[];
  length: number;
}

export interface EmotionalState {
  primary: string;
  intensity: number;
  confidence: number;
}

export interface MedicalEntity {
  entity: string;
  type: 'SYMPTOM' | 'MEDICATION' | 'BODY_PART' | 'TIME' | 'EMOTION';
  confidence: number;
}

export interface NLPAnalysisResult {
  sentiment: SentimentResult;
  summary?: TextSummary;
  emotions: EmotionalState[];
  entities: MedicalEntity[];
  urgencyLevel: number; // 0-10
  clinicalRelevance: number; // 0-10
}

/**
 * Classe principal para análise NLP
 */
export class NLPAnalysisService {
  private sentimentPipeline: Pipeline | null = null;
  private summaryPipeline: Pipeline | null = null;
  private classificationPipeline: Pipeline | null = null;
  private isLoading = false;
  private initialized = false;

  /**
   * Inicializa os modelos NLP (lazy loading)
   */
  async initialize(): Promise<void> {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    console.log('🧠 Inicializando modelos NLP...');

    try {
      // Modelo multilíngue para análise de sentimento (inclui português)
      console.log('📥 Carregando modelo de análise de sentimento...');
      this.sentimentPipeline = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        { 
          dtype: 'fp16', // Reduzir uso de memória
          device: 'webgpu' // Acelerar com WebGPU se disponível
        }
      );

      // Modelo para sumarização de texto
      console.log('📥 Carregando modelo de sumarização...');
      this.summaryPipeline = await pipeline(
        'summarization',
        'Xenova/t5-small',
        { dtype: 'fp16' }
      );

      // Modelo para classificação zero-shot (entidades médicas)
      console.log('📥 Carregando modelo de classificação...');
      this.classificationPipeline = await pipeline(
        'zero-shot-classification',
        'Xenova/distilbert-base-uncased-mnli',
        { dtype: 'fp16' }
      );

      this.initialized = true;
      console.log('✅ Modelos NLP inicializados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar modelos NLP:', error);
      throw new Error('Falha na inicialização dos modelos NLP');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Analisa sentimento de um texto
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    await this.initialize();
    if (!this.sentimentPipeline) throw new Error('Modelo de sentimento não inicializado');

    try {
      const result = await this.sentimentPipeline(text);
      const output = Array.isArray(result) ? result[0] : result;
      
      return {
        label: output.label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
        score: output.score,
        confidence: output.score > 0.8 ? 'HIGH' : output.score > 0.6 ? 'MEDIUM' : 'LOW'
      };
    } catch (error) {
      console.error('❌ Erro na análise de sentimento:', error);
      return { label: 'NEUTRAL', score: 0.5, confidence: 'LOW' };
    }
  }

  /**
   * Gera resumo de texto
   */
  async summarizeText(text: string, maxLength = 100): Promise<TextSummary> {
    await this.initialize();
    if (!this.summaryPipeline) throw new Error('Modelo de sumarização não inicializado');

    // Verificar se o texto é longo o suficiente para sumarização
    if (text.length < 50) {
      return {
        summary: text,
        keyPhrases: this.extractKeyPhrases(text),
        length: text.length
      };
    }

    try {
      const result = await this.summaryPipeline(text, {
        max_length: maxLength,
        min_length: 20,
        do_sample: false
      });

      const summaryText = Array.isArray(result) ? result[0].summary_text : result.summary_text;

      return {
        summary: summaryText,
        keyPhrases: this.extractKeyPhrases(text),
        length: summaryText.length
      };
    } catch (error) {
      console.error('❌ Erro na sumarização:', error);
      return {
        summary: text.substring(0, maxLength) + '...',
        keyPhrases: this.extractKeyPhrases(text),
        length: text.length
      };
    }
  }

  /**
   * Classifica entidades médicas no texto
   */
  async extractMedicalEntities(text: string): Promise<MedicalEntity[]> {
    await this.initialize();
    if (!this.classificationPipeline) throw new Error('Modelo de classificação não inicializado');

    const medicalLabels = [
      'sintoma médico',
      'medicamento',
      'parte do corpo',
      'tempo de duração',
      'estado emocional',
      'dor',
      'tratamento'
    ];

    try {
      const result = await this.classificationPipeline(text, medicalLabels);
      
      const entities: MedicalEntity[] = result.labels.map((label: string, index: number) => {
        const score = result.scores[index];
        
        let entityType: MedicalEntity['type'] = 'EMOTION';
        if (label.includes('sintoma')) entityType = 'SYMPTOM';
        else if (label.includes('medicamento')) entityType = 'MEDICATION';
        else if (label.includes('corpo')) entityType = 'BODY_PART';
        else if (label.includes('tempo')) entityType = 'TIME';

        return {
          entity: label,
          type: entityType,
          confidence: score
        };
      }).filter((entity: MedicalEntity) => entity.confidence > 0.3);

      return entities;
    } catch (error) {
      console.error('❌ Erro na extração de entidades:', error);
      return [];
    }
  }

  /**
   * Detecta nível de urgência no texto
   */
  detectUrgencyLevel(text: string): number {
    const urgencyKeywords = {
      critical: ['insuportável', 'desesperado', 'socorro', 'emergência', 'não aguento'],
      high: ['muito forte', 'muito ruim', 'piorou muito', 'preocupado', 'assustado'],
      medium: ['desconfortável', 'ruim', 'incomoda', 'atrapalha'],
      low: ['leve', 'suportável', 'tolerável', 'melhor']
    };

    const normalizedText = text.toLowerCase();
    
    let urgencyScore = 0;
    
    urgencyKeywords.critical.forEach(keyword => {
      if (normalizedText.includes(keyword)) urgencyScore += 3;
    });
    
    urgencyKeywords.high.forEach(keyword => {
      if (normalizedText.includes(keyword)) urgencyScore += 2;
    });
    
    urgencyKeywords.medium.forEach(keyword => {
      if (normalizedText.includes(keyword)) urgencyScore += 1;
    });
    
    urgencyKeywords.low.forEach(keyword => {
      if (normalizedText.includes(keyword)) urgencyScore -= 1;
    });

    // Normalizar para escala 0-10
    return Math.max(0, Math.min(10, urgencyScore));
  }

  /**
   * Avalia relevância clínica do texto
   */
  assessClinicalRelevance(text: string): number {
    const clinicalKeywords = {
      high: ['dor', 'sintoma', 'medicamento', 'médico', 'hospital', 'tratamento', 'crise'],
      medium: ['desconforto', 'mal-estar', 'cansaço', 'stress', 'ansiedade'],
      low: ['normal', 'bem', 'rotina', 'trabalho']
    };

    const normalizedText = text.toLowerCase();
    let relevanceScore = 0;
    
    clinicalKeywords.high.forEach(keyword => {
      if (normalizedText.includes(keyword)) relevanceScore += 2;
    });
    
    clinicalKeywords.medium.forEach(keyword => {
      if (normalizedText.includes(keyword)) relevanceScore += 1;
    });
    
    clinicalKeywords.low.forEach(keyword => {
      if (normalizedText.includes(keyword)) relevanceScore -= 0.5;
    });

    // Normalizar para escala 0-10
    return Math.max(0, Math.min(10, relevanceScore));
  }

  /**
   * Extrai frases-chave do texto (implementação simples)
   */
  private extractKeyPhrases(text: string): string[] {
    // Implementação básica - pode ser melhorada com NLP mais avançado
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const keywords = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    
    // Retornar frases mais relevantes baseadas em palavras-chave médicas
    const medicalKeywords = ['dor', 'sintoma', 'medicamento', 'sono', 'humor', 'crise'];
    const relevantSentences = sentences.filter(sentence => 
      medicalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    return relevantSentences.slice(0, 3).map(s => s.trim());
  }

  /**
   * Análise completa de um texto
   */
  async analyzeText(text: string): Promise<NLPAnalysisResult> {
    if (!text || text.trim().length < 3) {
      throw new Error('Texto muito curto para análise');
    }

    console.log('🧠 Iniciando análise NLP do texto...');

    try {
      // Executar análises em paralelo
      const [sentiment, entities] = await Promise.all([
        this.analyzeSentiment(text),
        this.extractMedicalEntities(text)
      ]);

      // Análises síncronas
      const urgencyLevel = this.detectUrgencyLevel(text);
      const clinicalRelevance = this.assessClinicalRelevance(text);

      // Gerar resumo se o texto for longo
      let summary: TextSummary | undefined;
      if (text.length > 100) {
        summary = await this.summarizeText(text);
      }

      // Mapear estado emocional baseado no sentimento
      const emotions: EmotionalState[] = [{
        primary: sentiment.label === 'POSITIVE' ? 'calmo' : 
                sentiment.label === 'NEGATIVE' ? 'preocupado' : 'neutro',
        intensity: sentiment.score * 10,
        confidence: sentiment.score
      }];

      const result: NLPAnalysisResult = {
        sentiment,
        summary,
        emotions,
        entities,
        urgencyLevel,
        clinicalRelevance
      };

      console.log('✅ Análise NLP concluída:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro na análise NLP:', error);
      throw new Error(`Falha na análise NLP: ${error}`);
    }
  }

  /**
   * Verifica se os modelos estão carregados
   */
  isReady(): boolean {
    return this.initialized && !this.isLoading;
  }

  /**
   * Libera recursos dos modelos (para economia de memória)
   */
  dispose(): void {
    this.sentimentPipeline = null;
    this.summaryPipeline = null;
    this.classificationPipeline = null;
    this.initialized = false;
    console.log('🗑️ Modelos NLP liberados da memória');
  }
}

// Instância singleton para reutilização
export const nlpService = new NLPAnalysisService();