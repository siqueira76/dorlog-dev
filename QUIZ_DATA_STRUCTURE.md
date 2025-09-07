# Estrutura de Dados e Mapeamento Quiz-Respostas - DorLog

## Visão Geral

O DorLog utiliza um sistema flexível de quizzes com mapeamento semântico automático das respostas. Esta documentação descreve a estrutura completa de dados, desde as perguntas até a persistência no Firebase.

## 🏗️ Arquitetura de Dados

### Collection Firebase: `quizzes`
```
📂 quizzes/
├── 📄 matinal/
│   ├── nome: "Quiz Matinal"
│   ├── disparo: "notificacao"
│   └── 📂 perguntas/
│       ├── 📄 1 → {id, texto, tipo, opcoes?}
│       ├── 📄 2 → {id, texto, tipo, opcoes?}
│       └── ...
├── 📄 noturno/
└── 📄 emergencial/
```

### Collection Firebase: `report_diario`
```
📂 report_diario/
└── 📄 {email}_{YYYY-MM-DD}/
    ├── data: Timestamp
    ├── usuarioId: string
    ├── quizzes: Array<QuizData>
    ├── criadoEm: Timestamp
    └── ultimaAtualizacao: Timestamp
```

## 📋 Estrutura das Perguntas por Quiz

### 🌅 Quiz Matinal

| ID | Pergunta | Tipo | Opções | Semântica |
|----|----------|------|---------|-----------|
| 1 | "Como você se sente ao acordar hoje?" | `emojis` | - | `emotional_state` |
| 2 | "Qual é o seu nível de dor neste momento?" | `eva` | 0-10 | `eva_scale` |
| 3 | "Que sintomas você está sentindo hoje?" | `checkbox` | ["Dor de cabeça", "Náusea", "Fadiga", "Dor muscular", "Ansiedade", "Nenhum"] | `symptoms` |
| 4 | "Como foi sua qualidade de sono na noite passada?" | `opcoes` | ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"] | `sleep_quality` |
| 5 | "Descreva brevemente como você está se sentindo:" | `texto` | - | `free_text` |

### 🌙 Quiz Noturno

| ID | Pergunta (Inferida) | Tipo | Semântica |
|----|---------------------|------|-----------|
| 1 | Estado geral noturno | `emojis` | `emotional_state` |
| 2 | Nível de dor atual | `eva` | `eva_scale` |
| 3 | Atividades realizadas no dia | `checkbox` | `activities` |
| 4 | Estado emocional | `opcoes` | `emotional_state` |
| 8 | Evacuação intestinal | `opcoes` | `bowel_movement` |

### 🚨 Quiz Emergencial

| ID | Pergunta (Inferida) | Tipo | Semântica |
|----|---------------------|------|-----------|
| 1 | Nível de dor de emergência | `eva` | `eva_scale` |
| 2 | Locais da dor | `checkbox` | `pain_locations` |
| 3 | Tipo de dor | `opcoes` | `multiple_choice` |
| 4 | Duração da crise | `opcoes` | `multiple_choice` |
| 5 | Gatilhos identificados | `checkbox` | `multiple_choice` |
| 6 | Sintomas associados | `checkbox` | `symptoms` |
| 7 | Medicamento de resgate tomado | `texto` | `rescue_medication` |
| 8 | Observações adicionais | `texto` | `free_text` |

## 📊 Tipos de Perguntas Suportados

### Tipos Básicos (`QuestionType`)
```typescript
type QuestionType = "opcoes" | "eva" | "slider" | "checkbox" | "texto" | "imagem" | "emojis";
```

| Tipo | Descrição | Formato da Resposta | Exemplo |
|------|-----------|---------------------|---------|
| `opcoes` | Seleção única | `string` | `"Boa"` |
| `eva` | Escala visual analógica | `number` (0-10) | `7` |
| `slider` | Controle deslizante | `number` | `5` |
| `checkbox` | Seleção múltipla | `string[]` | `["Dor de cabeça", "Fadiga"]` |
| `texto` | Campo de texto livre | `string` | `"Me sentindo melhor hoje"` |
| `imagem` | Upload de imagem | `string` (URL) | `"url_da_imagem"` |
| `emojis` | Seleção por emoji | `string` | `"😊"` |

## 🔄 Mapeamento Semântico Automático

### Função: `getQuestionSemanticType(questionId, quizType, answer)`

O sistema analisa automaticamente cada resposta e atribui um tipo semântico baseado em:
1. **Contexto do Quiz**: Tipo de quiz (matinal/noturno/emergencial)
2. **ID da Pergunta**: Posição específica da pergunta
3. **Conteúdo da Resposta**: Análise do valor retornado

### Tipos Semânticos Identificados

| Tipo Semântico | Critério de Detecção | Exemplo de Resposta |
|----------------|---------------------|---------------------|
| `eva_scale` | `typeof answer === 'number' && answer >= 0 && answer <= 10` | `7` |
| `pain_locations` | Array contendo pontos anatômicos | `["Cabeça", "Pescoço", "Braços"]` |
| `symptoms` | Array contendo sintomas | `["Dor de cabeça", "Náusea", "Fadiga"]` |
| `activities` | Array contendo atividades | `["Exercícios", "Trabalho", "Descanso"]` |
| `emotional_state` | Array/string com estados emocionais | `["Ansioso", "Triste"]` ou `"😊"` |
| `rescue_medication` | String no contexto emergencial P2 | `"Dipirona 500mg"` |
| `sleep_quality` | String sobre qualidade do sono | `"Boa"` |
| `bowel_movement` | Resposta sim/não sobre evacuação | `"Sim"` |
| `free_text` | Texto livre genérico | `"Me sentindo melhor hoje"` |
| `medication_text` | String contendo medicamentos | `"Tomei paracetamol"` |
| `multiple_choice` | Array não categorizado | `["Opção A", "Opção B"]` |
| `unknown` | Tipo não reconhecido | `null` ou formato inválido |

### Palavras-Chave para Detecção

#### Pontos Anatômicos
```javascript
['Cabeça', 'Pescoço', 'Ombros', 'Costas', 'Braços', 'Pernas', 'Abdômen', 'Músculos', 'Articulações', 'Outro local']
```

#### Sintomas
```javascript
['Dor de cabeça', 'Fadiga', 'Náusea', 'Ansiedade', 'Irritabilidade', 'Depressivo', 'Sensibilidade']
```

#### Atividades
```javascript
['Exercícios', 'Trabalho', 'Descanso', 'Socialização', 'Tarefas domésticas']
```

#### Estados Emocionais
```javascript
['Ansioso', 'Triste', 'Irritado', 'Calmo', 'Feliz', 'Depressivo']
```

#### Medicamentos
```javascript
['paracetamol', 'ibuprofeno', 'dipirona', 'tramadol', 'morfina', 'dimorf', 'aspirina', 'naproxeno']
```

## 💾 Estrutura de Persistência

### Documento `report_diario`
```json
{
  "data": "2025-09-07T12:00:00.000Z",
  "usuarioId": "josecarlos.siqueira76@gmail.com",
  "quizzes": [
    {
      "tipo": "matinal",
      "data": "2025-09-07T08:30:00.000Z",
      "timestamp": "2025-09-07T08:30:00.000Z",
      "respostas": {
        "1": "😊",
        "2": 7,
        "3": ["Dor de cabeça", "Fadiga"],
        "4": "Boa",
        "5": "Me sentindo melhor hoje"
      },
      "inicioQuiz": "2025-09-07T08:28:00.000Z",
      "fimQuiz": "2025-09-07T08:32:00.000Z"
    },
    {
      "tipo": "emergencial",
      "data": "2025-09-07T15:45:00.000Z",
      "timestamp": "2025-09-07T15:45:00.000Z",
      "respostas": {
        "1": 9,
        "2": ["Cabeça", "Pescoço"],
        "3": "Pulsante",
        "4": "30 minutos",
        "5": ["Estresse", "Falta de sono"],
        "6": ["Náusea", "Sensibilidade à luz"],
        "7": "Dipirona 500mg",
        "8": "Crise intensa após reunião estressante"
      },
      "inicioQuiz": "2025-09-07T15:43:00.000Z",
      "fimQuiz": "2025-09-07T15:47:00.000Z"
    }
  ],
  "criadoEm": "2025-09-07T08:28:00.000Z",
  "ultimaAtualizacao": "2025-09-07T15:47:00.000Z"
}
```

## 🔍 Normalização e Validação

### Função: `normalizeQuizData(quizzes)`

#### Formatos Aceitos:
✅ **Formato Correto**:
```json
[
  {
    "tipo": "matinal",
    "respostas": {"1": "😊", "2": 7},
    "data": "timestamp",
    "timestamp": "timestamp"
  }
]
```

❌ **Formatos Rejeitados**:
```json
[1, 2, 3]  // Arrays numéricos corrompidos
```

#### Logs de Validação:
- `✅ Quizzes no formato correto (X quiz(es))`
- `⚠️ Dados de quiz antigos/corrompidos detectados`
- `⚠️ Arrays numéricos não podem ser processados - dados perdidos`
- `⚠️ Formato de quiz não reconhecido`

## 📈 Processamento para Relatórios

### Fluxo de Dados:
1. **Coleta**: Busca documentos `report_diario` por período
2. **Normalização**: Valida formato dos quizzes
3. **Mapeamento Semântico**: Classifica cada resposta
4. **Agregação**: Consolida dados por tipo semântico
5. **Análise**: Gera insights e correlações
6. **Relatório**: Produz HTML enhanced com visualizações

### Contadores e Métricas:
- **Episódios de Crise**: Count de quizzes tipo `emergencial`
- **Nível Médio de Dor**: Média dos valores `eva_scale`
- **Pontos de Dor**: Frequência de `pain_locations`
- **Medicamentos de Resgate**: Lista de `rescue_medication`
- **Evolução Temporal**: Série histórica de `eva_scale`

## 🛡️ Tratamento de Erros

### Estratégias de Fallback:
1. **Dados Corrompidos**: Ignorados com log de aviso
2. **Tipos Desconhecidos**: Marcados como `unknown`
3. **Formatos Antigos**: Convertidos quando possível
4. **Campos Ausentes**: Valores padrão aplicados

### Logs de Depuração:
```javascript
console.log(`🔭 DEBUG: Analisando Q${questionId} (${quizType}): ${JSON.stringify(answer)} [${typeof answer}]`);
console.log(`✅ ${normalizedQuizzes.length} quiz(es) processado(s)`);
console.warn(`⚠️ Formato não reconhecido para Q${questionId}`);
```

## 🔄 Ciclo de Vida dos Dados

1. **Criação**: Usuário responde quiz na interface
2. **Validação**: Frontend valida campos obrigatórios
3. **Transformação**: Respostas convertidas para formato persistível
4. **Persistência**: Dados salvos no `report_diario`
5. **Consulta**: Sistema busca dados para relatórios
6. **Processamento**: Mapeamento semântico aplicado
7. **Análise**: Insights gerados automaticamente
8. **Visualização**: Dados apresentados em relatórios HTML

---

**Última Atualização**: 2025-09-07  
**Versão**: 1.0.0  
**Sistema**: DorLog Enhanced NLP  