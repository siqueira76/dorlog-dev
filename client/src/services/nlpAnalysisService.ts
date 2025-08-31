/**
 * Serviço de Análise NLP Client-Side para DorLog
 * 
 * Sistema isolado para processamento de linguagem natural
 * sem interferir nas funcionalidades existentes da aplicação.
 */

import { pipeline } from '@xenova/transformers';
import type { 
  TextClassificationPipeline,
  SummarizationPipeline,
  ZeroShotClassificationPipeline
} from '@xenova/transformers';

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
  private sentimentPipeline: TextClassificationPipeline | null = null;
  private summaryPipeline: SummarizationPipeline | null = null;
  private classificationPipeline: ZeroShotClassificationPipeline | null = null;
  private isLoading = false;
  private initialized = false;

  /**
   * Inicializa os modelos NLP (lazy loading) - versão otimizada
   */
  async initialize(): Promise<void> {
    if (this.initialized || this.isLoading) return;
    
    this.isLoading = true;
    console.log('🧠 Inicializando modelos NLP (modo otimizado)...');

    try {
      // Carregar apenas modelo de sentimento inicialmente (mais leve)
      console.log('📥 Carregando modelo de análise de sentimento...');
      
      const initPromise = this.initializeSentimentModel();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na inicialização (30s)')), 30000)
      );
      
      await Promise.race([initPromise, timeoutPromise]);
      
      this.initialized = true;
      console.log('✅ Modelo de sentimento inicializado com sucesso');
      console.log('ℹ️ Outros modelos serão carregados conforme necessário');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar modelo NLP:', error);
      console.error('📝 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : 'Stack não disponível'
      });
      
      // Não falhar completamente - usar fallback
      this.initialized = false;
      console.log('🔄 Usando modo fallback baseado em regras');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Inicializa apenas o modelo de sentimento
   */
  private async initializeSentimentModel(): Promise<void> {
    this.sentimentPipeline = await pipeline(
      'text-classification',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    ) as TextClassificationPipeline;
  }

  /**
   * Inicializa modelo de sumarização sob demanda
   */
  private async initializeSummaryModel(): Promise<void> {
    if (this.summaryPipeline) return;
    
    try {
      console.log('📥 Carregando modelo de sumarização...');
      const initPromise = pipeline(
        'summarization',
        'Xenova/t5-small'
      );
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout modelo sumarização')), 20000)
      );
      
      this.summaryPipeline = await Promise.race([initPromise, timeoutPromise]) as SummarizationPipeline;
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de sumarização:', error);
      throw error;
    }
  }

  /**
   * Inicializa modelo de classificação sob demanda
   */
  private async initializeClassificationModel(): Promise<void> {
    if (this.classificationPipeline) return;
    
    try {
      console.log('📥 Carregando modelo de classificação...');
      const initPromise = pipeline(
        'zero-shot-classification',
        'Xenova/distilbert-base-uncased-mnli'
      );
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout modelo classificação')), 20000)
      );
      
      this.classificationPipeline = await Promise.race([initPromise, timeoutPromise]) as ZeroShotClassificationPipeline;
    } catch (error) {
      console.error('❌ Erro ao carregar modelo de classificação:', error);
      throw error;
    }
  }

  /**
   * Analisa sentimento de um texto
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    await this.initialize();
    
    // Se modelo de IA não estiver disponível, usar fallback
    if (!this.sentimentPipeline) {
      console.log('🔄 Usando análise de sentimento baseada em regras');
      return this.analyzeSentimentFallback(text);
    }

    try {
      const result = await this.sentimentPipeline!(text) as any;
      const output = Array.isArray(result) ? result[0] : result;
      
      return {
        label: output.label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
        score: output.score || 0.5,
        confidence: (output.score || 0.5) > 0.8 ? 'HIGH' : (output.score || 0.5) > 0.6 ? 'MEDIUM' : 'LOW'
      };
    } catch (error) {
      console.error('❌ Erro na análise de sentimento IA:', error);
      console.log('🔄 Fallback para análise baseada em regras');
      return this.analyzeSentimentFallback(text);
    }
  }

  /**
   * Análise de sentimento baseada em regras (fallback)
   */
  private analyzeSentimentFallback(text: string): SentimentResult {
    const textLower = text.toLowerCase();
    
    // Palavras positivas
    const positiveWords = ['bom', 'bem', 'melhor', 'otimo', 'ótimo', 'calmo', 'tranquilo', 'feliz', 'alegre', 'satisfeito', 'melhorou', 'aliviado'];
    const negativeWords = ['dor', 'mal', 'pior', 'terrível', 'insuportável', 'preocupado', 'ansioso', 'triste', 'deprimido', 'crise', 'ruim', 'péssimo'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (textLower.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (textLower.includes(word)) negativeScore++;
    });
    
    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    let score = 0.5;
    
    if (positiveScore > negativeScore) {
      label = 'POSITIVE';
      score = Math.min(0.9, 0.6 + (positiveScore * 0.1));
    } else if (negativeScore > positiveScore) {
      label = 'NEGATIVE';
      score = Math.min(0.9, 0.6 + (negativeScore * 0.1));
    }
    
    return {
      label,
      score,
      confidence: score > 0.8 ? 'HIGH' : score > 0.6 ? 'MEDIUM' : 'LOW'
    };
  }

  /**
   * Gera resumo de texto
   */
  async summarizeText(text: string, maxLength = 100): Promise<TextSummary> {
    // Verificar se o texto é longo o suficiente para sumarização
    if (text.length < 50) {
      return {
        summary: text,
        keyPhrases: this.extractKeyPhrases(text),
        length: text.length
      };
    }

    // Tentar carregar modelo de sumarização se ainda não foi carregado
    if (!this.summaryPipeline) {
      try {
        await this.initializeSummaryModel();
      } catch (error) {
        console.log('🔄 Modelo de sumarização não disponível, usando fallback');
        return this.summarizeTextFallback(text, maxLength);
      }
    }

    try {
      const result = await this.summaryPipeline!(text, {
        max_length: maxLength,
        min_length: 20,
        do_sample: false
      }) as any;

      const summaryText = Array.isArray(result) ? result[0]?.summary_text || result[0]?.generated_text : result?.summary_text || result?.generated_text;

      return {
        summary: summaryText,
        keyPhrases: this.extractKeyPhrases(text),
        length: summaryText.length
      };
    } catch (error) {
      console.error('❌ Erro na sumarização IA:', error);
      return this.summarizeTextFallback(text, maxLength);
    }
  }

  /**
   * Sumarização baseada em regras (fallback)
   */
  private summarizeTextFallback(text: string, maxLength: number): TextSummary {
    // Pegar as primeiras frases mais relevantes
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const medicalKeywords = ['dor', 'sintoma', 'medicamento', 'sono', 'humor', 'crise'];
    
    // Priorizar frases com palavras médicas
    const relevantSentences = sentences.filter(sentence => 
      medicalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    const summaryText = relevantSentences.length > 0 
      ? relevantSentences.slice(0, 2).join('. ').substring(0, maxLength) + '...'
      : text.substring(0, maxLength) + '...';
    
    return {
      summary: summaryText,
      keyPhrases: this.extractKeyPhrases(text),
      length: summaryText.length
    };
  }

  /**
   * Classifica entidades médicas no texto
   */
  async extractMedicalEntities(text: string): Promise<MedicalEntity[]> {
    // Tentar carregar modelo de classificação se ainda não foi carregado
    if (!this.classificationPipeline) {
      try {
        await this.initializeClassificationModel();
      } catch (error) {
        console.log('🔄 Modelo de classificação não disponível, usando fallback');
        return this.extractMedicalEntitiesFallback(text);
      }
    }

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
      const result = await this.classificationPipeline!(text, medicalLabels) as any;
      const resultData = Array.isArray(result) ? result[0] : result;
      
      const entities: MedicalEntity[] = (resultData.labels || []).map((label: string, index: number) => {
        const score = (resultData.scores || [])[index] || 0.5;
        
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
      console.error('❌ Erro na extração de entidades IA:', error);
      return this.extractMedicalEntitiesFallback(text);
    }
  }

  /**
   * Extração de entidades baseada em regras (fallback)
   */
  private extractMedicalEntitiesFallback(text: string): MedicalEntity[] {
    const textLower = text.toLowerCase();
    const entities: MedicalEntity[] = [];
    
    // Dicionários de palavras por categoria
    const entityDict = {
      symptoms: ['dor', 'crise', 'ansiedade', 'depressão', 'cansaço', 'mal-estar', 'náusea', 'tontura'],
      bodyParts: ['cabeça', 'pescoço', 'costas', 'braço', 'perna', 'estômago', 'peito', 'olhos'],
      medications: ['remédio', 'medicamento', 'dipirona', 'paracetamol', 'ibuprofeno', 'antidepressivo'],
      timeWords: ['minutos', 'horas', 'dias', 'semana', 'mês', 'hoje', 'ontem', 'sempre'],
      emotions: ['triste', 'feliz', 'preocupado', 'calmo', 'irritado', 'ansioso', 'deprimido']
    };
    
    // Detectar entidades por palavra-chave
    Object.entries(entityDict).forEach(([category, words]) => {
      words.forEach(word => {
        if (textLower.includes(word)) {
          let type: MedicalEntity['type'] = 'EMOTION';
          switch(category) {
            case 'symptoms': type = 'SYMPTOM'; break;
            case 'bodyParts': type = 'BODY_PART'; break;
            case 'medications': type = 'MEDICATION'; break;
            case 'timeWords': type = 'TIME'; break;
            case 'emotions': type = 'EMOTION'; break;
          }
          
          entities.push({
            entity: word,
            type,
            confidence: 0.7 // Confiança média para detecção por regras
          });
        }
      });
    });
    
    // Remover duplicatas
    const uniqueEntities = entities.filter((entity, index, self) => 
      index === self.findIndex(e => e.entity === entity.entity && e.type === entity.type)
    );
    
    return uniqueEntities.slice(0, 5); // Limitar a 5 entidades
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
      // Executar análises sequencialmente para reduzir carga
      console.log('🔍 Analisando sentimento...');
      const sentiment = await this.analyzeSentiment(text);
      
      console.log('🏥 Extraindo entidades médicas...');
      const entities = await this.extractMedicalEntities(text);

      // Análises síncronas (baseadas em regras)
      console.log('⚡ Calculando urgência e relevância...');
      const urgencyLevel = this.detectUrgencyLevel(text);
      const clinicalRelevance = this.assessClinicalRelevance(text);

      // Gerar resumo se o texto for longo
      let summary: TextSummary | undefined;
      if (text.length > 100) {
        console.log('📝 Gerando resumo...');
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

      console.log('✅ Análise NLP concluída:', {
        sentiment: sentiment.label,
        entitiesFound: entities.length,
        urgency: urgencyLevel,
        clinical: clinicalRelevance
      });
      return result;

    } catch (error) {
      console.error('❌ Erro na análise NLP:', error);
      console.error('📝 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      // Retornar resultado básico em caso de erro total
      return {
        sentiment: { label: 'NEUTRAL', score: 0.5, confidence: 'LOW' },
        emotions: [{ primary: 'neutro', intensity: 5, confidence: 0.5 }],
        entities: [],
        urgencyLevel: 5,
        clinicalRelevance: 5
      };
    }
  }

  /**
   * Verifica se os modelos estão carregados
   */
  isReady(): boolean {
    return this.initialized && !this.isLoading;
  }

  /**
   * Retorna status detalhado dos modelos
   */
  getModelStatus(): { sentiment: boolean; summary: boolean; classification: boolean; fallbackMode: boolean } {
    return {
      sentiment: !!this.sentimentPipeline,
      summary: !!this.summaryPipeline,
      classification: !!this.classificationPipeline,
      fallbackMode: !this.initialized
    };
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