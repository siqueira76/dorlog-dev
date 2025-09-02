/**
 * Serviço de Análise Inteligente de Medicamentos de Resgate
 * 
 * Implementa análise NLP com fallbacks robustos para extrair insights
 * sobre medicamentos utilizados durante episódios de crise.
 */

export interface RescueMedicationData {
  medication: string;
  frequency: number;
  dates: string[];
  context?: string;
  category: 'prescribed' | 'otc' | 'unknown';
  isEffective?: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MedicationAnalysis {
  rawText: string;
  date: string;
  extractedMedications: string[];
  context: string;
  riskFactors: string[];
}

export class RescueMedicationAnalysisService {
  
  /**
   * Analisa texto livre sobre medicamentos usando NLP com fallbacks
   */
  static analyzeMedicationText(text: string, date: string): MedicationAnalysis {
    console.log(`💊 Analisando texto de medicamento: "${text}" (${date})`);
    
    const analysis: MedicationAnalysis = {
      rawText: text,
      date,
      extractedMedications: [],
      context: '',
      riskFactors: []
    };

    try {
      // 1. Análise NLP avançada (com fallback)
      analysis.extractedMedications = this.extractMedicationNames(text);
      
      // 2. Análise de contexto
      analysis.context = this.extractContext(text);
      
      // 3. Detecção de fatores de risco
      analysis.riskFactors = this.detectRiskFactors(text);
      
      console.log(`✅ Análise concluída:`, {
        medicamentos: analysis.extractedMedications.length,
        riscos: analysis.riskFactors.length
      });
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Erro na análise de medicamentos:', error);
      
      // Fallback básico
      analysis.extractedMedications = this.basicMedicationExtraction(text);
      analysis.context = text.substring(0, 100);
      
      return analysis;
    }
  }
  
  /**
   * Extrai nomes de medicamentos do texto usando padrões e NLP
   */
  private static extractMedicationNames(text: string): string[] {
    const medications: string[] = [];
    const cleanText = text.toLowerCase().trim();
    
    // Base de medicamentos comuns (fallback principal)
    const commonMedications = [
      // Analgésicos comuns
      'dipirona', 'paracetamol', 'aspirina', 'ibuprofeno', 'diclofenaco',
      'nimesulida', 'cetoprofeno', 'naproxeno', 'meloxicam',
      
      // Antiespasmódicos
      'buscopan', 'escopolamina', 'hioscina', 'dorflex',
      
      // Relaxantes musculares
      'ciclobenzaprina', 'carisoprodol', 'orfenadrina',
      
      // Anti-inflamatórios
      'prednisolona', 'prednisona', 'dexametasona',
      
      // Medicamentos para dor neuropática
      'gabapentina', 'pregabalina', 'amitriptilina',
      
      // Opióides
      'tramadol', 'codeína', 'morfina', 'oxicodona',
      
      // Outros comuns
      'novalgina', 'tylenol', 'advil', 'voltaren', 'cataflan',
      'doril', 'neosaldina', 'anador', 'lisador'
    ];
    
    // Buscar medicamentos conhecidos
    commonMedications.forEach(med => {
      if (cleanText.includes(med)) {
        medications.push(this.normalizeMedicationName(med));
      }
    });
    
    // Padrões de extração adicional
    const patterns = [
      /(\w+)mg/g,  // Nomes seguidos de dosagem
      /tomei\s+(\w+)/g,  // "tomei X"
      /usei\s+(\w+)/g,   // "usei X"
      /(\w+)\s+comprimido/g  // "X comprimido"
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length > 2) {
          const medication = this.normalizeMedicationName(match[1]);
          if (medication && !medications.includes(medication)) {
            medications.push(medication);
          }
        }
      }
    });
    
    // Remove duplicatas usando filter
    return medications.filter((med, index) => medications.indexOf(med) === index);
  }
  
  /**
   * Extrai contexto e informações adicionais do texto
   */
  private static extractContext(text: string): string {
    const contextIndicators = [
      'eficaz', 'não funcionou', 'ajudou', 'aliviou', 'melhorou',
      'piorou', 'efeito colateral', 'enjoo', 'sonolência', 'tontura',
      'rápido', 'demorou', 'minutos', 'horas', 'dose', 'comprimidos'
    ];
    
    let context = '';
    const cleanText = text.toLowerCase();
    
    contextIndicators.forEach(indicator => {
      if (cleanText.includes(indicator)) {
        // Extrair frase que contém o indicador
        const sentences = text.split(/[.!?]/);
        const relevantSentence = sentences.find(sentence => 
          sentence.toLowerCase().includes(indicator)
        );
        
        if (relevantSentence && relevantSentence.trim().length > 5) {
          context += relevantSentence.trim() + '. ';
        }
      }
    });
    
    return context.trim() || text.substring(0, 100);
  }
  
  /**
   * Detecta fatores de risco no uso de medicamentos
   */
  private static detectRiskFactors(text: string): string[] {
    const riskFactors: string[] = [];
    const cleanText = text.toLowerCase();
    
    const riskPatterns = [
      { pattern: /(\d+)\s*(comprimidos?|cápsulas?)/, risk: 'dose-alta' },
      { pattern: /(não receitado|sem receita|por conta própria)/, risk: 'automedicacao' },
      { pattern: /(junto com|misturei|combinei)/, risk: 'interacao' },
      { pattern: /(não funcionou|sem efeito|não aliviou)/, risk: 'ineficacia' },
      { pattern: /(enjoo|tontura|sonolência|mal estar)/, risk: 'efeito-colateral' },
      { pattern: /(toda hora|várias vezes|muitas vezes)/, risk: 'uso-excessivo' }
    ];
    
    riskPatterns.forEach(({ pattern, risk }) => {
      if (pattern.test(cleanText)) {
        riskFactors.push(risk);
      }
    });
    
    return riskFactors;
  }
  
  /**
   * Extração básica de medicamentos (fallback)
   */
  private static basicMedicationExtraction(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const potentialMeds = words.filter(word => 
      word.length > 4 && 
      /^[a-z]+$/.test(word) &&
      !['tomei', 'usei', 'para', 'dor', 'muito', 'pouco'].includes(word)
    );
    
    return potentialMeds.slice(0, 3); // Máximo 3 candidatos
  }
  
  /**
   * Normaliza nome do medicamento
   */
  private static normalizeMedicationName(name: string): string {
    // Remover acentos e normalizar
    const normalized = name.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éèê]/g, 'e')
      .replace(/[íì]/g, 'i')
      .replace(/[óòôõ]/g, 'o')
      .replace(/[úù]/g, 'u')
      .replace(/ç/g, 'c');
    
    // Capitalizar primeira letra
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  
  /**
   * Categoriza medicamento (prescrito, OTC, desconhecido)
   */
  static categorizeMedication(medicationName: string): 'prescribed' | 'otc' | 'unknown' {
    const otcMeds = [
      'dipirona', 'paracetamol', 'aspirina', 'ibuprofeno',
      'novalgina', 'tylenol', 'advil', 'anador'
    ];
    
    const prescribedMeds = [
      'tramadol', 'gabapentina', 'pregabalina', 'amitriptilina',
      'morfina', 'oxicodona', 'ciclobenzaprina'
    ];
    
    const normalized = medicationName.toLowerCase();
    
    if (otcMeds.some(med => normalized.includes(med))) {
      return 'otc';
    }
    
    if (prescribedMeds.some(med => normalized.includes(med))) {
      return 'prescribed';
    }
    
    return 'unknown';
  }
  
  /**
   * Avalia nível de risco
   */
  static assessRiskLevel(analysis: MedicationAnalysis): 'low' | 'medium' | 'high' {
    const riskFactors = analysis.riskFactors;
    
    // Alto risco
    if (riskFactors.includes('interacao') || 
        riskFactors.includes('automedicacao') ||
        riskFactors.includes('uso-excessivo')) {
      return 'high';
    }
    
    // Médio risco
    if (riskFactors.includes('dose-alta') || 
        riskFactors.includes('efeito-colateral') ||
        riskFactors.includes('ineficacia')) {
      return 'medium';
    }
    
    // Baixo risco
    return 'low';
  }
  
  /**
   * Consolida análises em dados estruturados
   */
  static consolidateAnalyses(analyses: MedicationAnalysis[]): RescueMedicationData[] {
    const medicationMap = new Map<string, RescueMedicationData>();
    
    analyses.forEach(analysis => {
      analysis.extractedMedications.forEach(medName => {
        const existing = medicationMap.get(medName);
        
        if (existing) {
          existing.frequency++;
          existing.dates.push(analysis.date);
          existing.context += ` ${analysis.context}`.trim();
        } else {
          medicationMap.set(medName, {
            medication: medName,
            frequency: 1,
            dates: [analysis.date],
            context: analysis.context,
            category: this.categorizeMedication(medName),
            riskLevel: this.assessRiskLevel(analysis)
          });
        }
      });
    });
    
    // Ordenar por frequência
    return Array.from(medicationMap.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
}