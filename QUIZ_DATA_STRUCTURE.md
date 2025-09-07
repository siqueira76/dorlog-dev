# Estrutura de Dados e Mapeamento Quiz-Respostas - DorLog

## Visão Geral

O DorLog utiliza um sistema flexível de quizzes com mapeamento semântico automático das respostas. Esta documentação descreve a estrutura completa de dados, desde as perguntas até a persistência no Firebase.

## 🏗️ Arquitetura de Dados

### Collection Firebase: `quizzes`

**⚠️ IMPORTANTE**: O sistema implementa um robusto mecanismo de fallback quando os quizzes não estão configurados no Firebase ou quando as subcoleções `perguntas` estão vazias. Nestes casos, utiliza automaticamente quizzes de demonstração pré-definidos no código.
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

#### **Estado Atual (Firebase Produção):**
| ID | Pergunta | Tipo | Opções | Semântica |
|----|----------|------|---------|-----------|
| 1 | "Como você dormiu?" | `opcoes` | ["Bem", "Médio", "Ruim", "Não dormiu"] | `sleep_quality` |
| 2 | "Qual foi a intensidade da dor hoje?" | `eva` | 0-10 | `eva_scale` |

#### **Estrutura Completa (Fallback/Demonstração):**
| ID | Pergunta | Tipo | Opções | Semântica |
|----|----------|------|---------|-----------|
| 1 | "Como você se sente ao acordar hoje?" | `emojis` | - | `emotional_state` |
| 2 | "Qual é o seu nível de dor neste momento?" | `eva` | 0-10 | `eva_scale` |
| 3 | "Que sintomas você está sentindo hoje?" | `checkbox` | ["Dor de cabeça", "Náusea", "Fadiga", "Dor muscular", "Ansiedade", "Nenhum"] | `symptoms` |
| 4 | "Descreva brevemente como foi sua noite de sono:" | `texto` | - | `sleep_quality` |

### 🌙 Quiz Noturno

#### **Estado Atual (Firebase Produção):**
*Não configurado - usando fallback de demonstração*

#### **Estrutura Completa (Fallback/Demonstração):**
| ID | Pergunta | Tipo | Opções | Semântica |
|----|----------|------|---------|-----------|
| 1 | "Como foi seu dia hoje?" | `emojis` | - | `emotional_state` |
| 2 | "Qual é o seu nível de dor agora?" | `eva` | 0-10 | `eva_scale` |
| 3 | "Quais atividades você realizou hoje?" | `checkbox` | ["Exercícios", "Trabalho", "Descanso", "Tarefas domésticas", "Socialização", "Outros"] | `activities` |
| 4 | "Como você avalia sua qualidade de sono na noite anterior?" | `slider` | 1-10 | `sleep_quality` |
| 5 | "Descreva como se sente ao final do dia:" | `texto` | - | `free_text` |
| 6 | "Que sintomas você teve hoje?" | `checkbox` | ["Dor de cabeça", "Fadiga", "Dor muscular", "Ansiedade", "Irritabilidade", "Depressivo", "Nenhum"] | `symptoms` |
| 7 | "Qual é sua expectativa para o sono de hoje?" | `opcoes` | ["Muito boa", "Boa", "Regular", "Ruim", "Muito ruim"] | `sleep_quality` |
| 8 | "Algo específico que gostaria de registrar sobre hoje?" | `texto` | - | `free_text` |
| 9 | "Como está seu humor agora?" | `emojis` | ["Ansioso", "Triste", "Irritado", "Calmo", "Feliz", "Depressivo"] | `emotional_state` |

### 🚨 Quiz Emergencial

#### **Estado Atual (Firebase Produção):**
*Não configurado - usando fallback de demonstração*

#### **Estrutura Completa (Fallback/Demonstração):**
| ID | Pergunta | Tipo | Opções | Semântica |
|----|----------|------|---------|-----------|
| 1 | "Qual é a intensidade da sua dor agora?" | `eva` | 0-10 | `eva_scale` |
| 2 | "Onde você está sentindo dor?" | `checkbox` | ["Cabeça", "Pescoço", "Ombros", "Costas", "Braços", "Pernas", "Abdômen", "Músculos", "Articulações", "Outro local"] | `pain_locations` |
| 3 | "Como você descreveria sua dor?" | `checkbox` | ["Pulsante", "Latejante", "Aguda", "Queimação", "Formigamento", "Peso", "Pressão", "Pontada", "Cólica", "Contínua"] | `multiple_choice` |
| 4 | "Há quanto tempo você está sentindo essa dor?" | `opcoes` | ["Menos de 1 hora", "1-3 horas", "3-6 horas", "6-12 horas", "Mais de 12 horas", "Vários dias"] | `multiple_choice` |
| 5 | "O que pode ter desencadeado essa crise?" | `checkbox` | ["Estresse", "Mudança do tempo", "Falta de sono", "Atividade física", "Alimentação", "Postura", "Trabalho", "Não sei", "Outro"] | `multiple_choice` |
| 6 | "Que outros sintomas você está sentindo?" | `checkbox` | ["Náusea", "Vômito", "Tontura", "Sensibilidade à luz", "Sensibilidade ao som", "Fadiga", "Ansiedade", "Irritabilidade", "Nenhum"] | `symptoms` |
| 7 | "Você já tomou algum medicamento para essa dor?" | `opcoes` | ["Sim, melhorou", "Sim, não fez efeito", "Sim, piorou", "Não tomei ainda", "Não tenho medicamento"] | `rescue_medication` |
| 8 | "Descreva qualquer informação adicional sobre esta crise:" | `texto` | - | `free_text` |

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

## 🔧 Sistema de Carregamento de Quizzes

### Fluxo de Carregamento
1. **Tentativa Firebase**: Acessa `quizzes/{quizId}` no Firestore
2. **Busca Subcoleção**: Consulta `perguntas` ordenadas por ID
3. **Validação**: Verifica se há perguntas configuradas
4. **Fallback Automático**: Se vazio, usa quizzes de demonstração pré-definidos
5. **Toast Informativo**: Notifica usuário sobre modo demonstração

### Estados do Sistema
- **✅ Produção**: Quiz configurado no Firebase com perguntas na subcoleção
- **⚠️ Demonstração**: Usando fallback devido a configuração incompleta
- **❌ Erro**: Falha na conexão ou configuração Firebase inválida

### Logs de Monitoramento
```javascript
console.log('🧪 Tentando carregar quiz:', quizId);
console.log('📁 Tentando acessar documento quiz:', path);
console.log('✅ Documento do quiz encontrado');
console.log('📋 Pergunta carregada:', questionId, perguntaData);
console.log('⚠️ Nenhuma pergunta encontrada na subcoleção');
console.log('🔧 Usando quiz de demonstração');
```

---

**Última Atualização**: 2025-09-07  
**Versão**: 2.0.0  
**Sistema**: DorLog Enhanced NLP  
**Status Atual**: Quiz Matinal configurado (2 perguntas), Noturno e Emergencial em modo demonstração  