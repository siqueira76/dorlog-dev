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
    
    // Base expandida de medicamentos conhecidos
    const commonMedications = [
      // Analgésicos e Anti-inflamatórios
      'dipirona', 'paracetamol', 'aspirina', 'ibuprofeno', 'diclofenaco',
      'nimesulida', 'cetoprofeno', 'naproxeno', 'meloxicam', 'piroxicam',
      'indometacina', 'sulindaco', 'fenilbutazona', 'etoricoxib', 'celecoxib',
      
      // Antiespasmódicos e Relaxantes
      'buscopan', 'escopolamina', 'hioscina', 'dorflex', 'atropina',
      'ciclobenzaprina', 'carisoprodol', 'orfenadrina', 'tizanidina',
      'baclofeno', 'clorzoxazona', 'metocarbamol',
      
      // Corticosteroides
      'prednisolona', 'prednisona', 'dexametasona', 'betametasona',
      'hidrocortisona', 'metilprednisolona', 'triamcinolona',
      
      // Opióides e Derivados - Lista Ampliada
      'tramadol', 'codeína', 'morfina', 'oxicodona', 'dimorf', 'dimorf-lc',
      'fentanila', 'fentanil', 'buprenorfina', 'nalbuphina', 'petidina',
      'meperidina', 'metadona', 'tapentadol', 'oximorfona', 'hidromorfona',
      
      // Anticonvulsivantes/Neuropáticos
      'gabapentina', 'pregabalina', 'amitriptilina', 'nortriptilina',
      'duloxetina', 'venlafaxina', 'carbamazepina', 'fenitoína',
      'ácido valpróico', 'lamotrigina', 'topiramato', 'clonazepam',
      
      // Benzodiazepínicos
      'diazepam', 'lorazepam', 'alprazolam', 'clonazepam', 'bromazepam',
      'midazolam', 'flunitrazepam', 'nitrazepam', 'temazepam',
      
      // Anestésicos Locais
      'lidocaína', 'lidocaina', 'procaína', 'benzocaína', 'prilocaína',
      'bupivacaína', 'articaína', 'mepivacaína',
      
      // Medicamentos de Marca/Comerciais
      'novalgina', 'tylenol', 'advil', 'voltaren', 'cataflan', 'doril',
      'neosaldina', 'anador', 'lisador', 'toragesic', 'tramal', 'epidurol',
      'artrolive', 'atroveran', 'buscopan', 'spidufen', 'flanax',
      'profenid', 'feldene', 'mioflex', 'beserol', 'miosan', 'tandrilax',
      
      // Outros medicamentos para dor
      'capsaicina', 'mentol', 'salicilato', 'benzidamina', 'flurbiprofeno',
      'ketoprofeno', 'dexketoprofeno', 'aceclofenaco', 'lornoxicam'
    ];
    
    // Buscar medicamentos conhecidos
    commonMedications.forEach(med => {
      if (cleanText.includes(med)) {
        medications.push(this.normalizeMedicationName(med));
      }
    });
    
    // Padrões de extração melhorados
    const patterns = [
      // Dosagens
      /(\w+)\s*\d+\s*mg/gi,  // "medicamento 10mg"
      /(\w+)mg/gi,           // "medicamentomg"
      /(\w+)\s*\d+\s*g/gi,   // "medicamento 1g"
      
      // Ações com medicamentos
      /(?:tomei|usei|apliquei|coloquei|passei)\s+(\w+)/gi,
      /(?:tomo|uso|aplico|coloco|passo)\s+(\w+)/gi,
      
      // Formas farmacêuticas
      /(\w+)\s+(?:comprimido|capsula|gota|ampola|injeção|pomada|gel|creme)/gi,
      /(?:comprimido|capsula|gota|ampola|injeção|pomada|gel|creme)\s+(?:de\s+)?(\w+)/gi,
      
      // Padrões diretos - palavras isoladas que podem ser medicamentos
      /\b([a-zA-Z]{4,15})\b/g  // palavras de 4-15 caracteres (candidatas a medicamentos)
    ];
    
    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].length > 2) {
          const candidate = match[1].toLowerCase();
          
          // Para o último padrão (palavras isoladas), aplicar filtros mais rigorosos
          if (index === patterns.length - 1) {
            if (this.isPotentialMedication(candidate)) {
              const medication = this.normalizeMedicationName(candidate);
              if (medication && !medications.includes(medication)) {
                medications.push(medication);
              }
            }
          } else {
            // Para padrões específicos, aceitar diretamente
            const medication = this.normalizeMedicationName(candidate);
            if (medication && !medications.includes(medication)) {
              medications.push(medication);
            }
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
      this.isPotentialMedication(word)
    );
    
    return potentialMeds.slice(0, 5); // Máximo 5 candidatos
  }
  
  /**
   * Verifica se uma palavra pode ser um medicamento
   */
  private static isPotentialMedication(word: string): boolean {
    // Lista de palavras comuns que NÃO são medicamentos
    const excludeWords = [
      'tomei', 'usei', 'para', 'dor', 'muito', 'pouco', 'hoje', 'ontem',
      'amanha', 'sempre', 'nunca', 'quando', 'onde', 'como', 'porque',
      'estava', 'estou', 'senti', 'sinto', 'tinha', 'tenho', 'fiquei',
      'fico', 'passou', 'passa', 'melhor', 'pior', 'bem', 'mal', 'forte',
      'fraco', 'mais', 'menos', 'ainda', 'agora', 'depois', 'antes',
      'durante', 'sobre', 'contra', 'entre', 'sem', 'com', 'uma', 'dois',
      'tres', 'quatro', 'cinco', 'horas', 'dias', 'vezes', 'vez', 'hora',
      'dia', 'noite', 'manha', 'tarde', 'minutos', 'segundo', 'casa',
      'trabalho', 'hospital', 'medico', 'enfermeiro', 'farmacia'
    ];
    
    return word.length >= 4 && 
           word.length <= 15 && 
           /^[a-zA-Z]+$/.test(word) &&
           !excludeWords.includes(word.toLowerCase()) &&
           // Características típicas de nomes de medicamentos
           (word.includes('ina') || word.includes('ol') || word.includes('an') || 
            word.includes('il') || word.includes('ox') || word.includes('fen') ||
            word.includes('mor') || word.includes('tram') || word.includes('dol') ||
            word.includes('phen') || word.includes('meth') || word.includes('cain') ||
            // Ou palavras que terminam com sufixos comuns de medicamentos
            word.endsWith('ina') || word.endsWith('fen') || word.endsWith('tine') ||
            word.endsWith('pine') || word.endsWith('done') || word.endsWith('aine') ||
            word.endsWith('lone') || word.endsWith('sone') || word.endsWith('cain') ||
            // Ou tem características farmacológicas
            word.length >= 6);
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