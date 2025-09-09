# Overview

FibroDiário is a Progressive Web App (PWA) specifically designed for patients with fibromialgia. It enables users to track pain, manage symptoms, medications, and coordinate with healthcare providers. Key features include detailed tracking of pain and crisis episodes, full CRUD operations for medication and doctor management, dynamic daily health quizzes, and automated generation of professional HTML reports for easy sharing with medical professionals. The primary goal is to empower fibromialgia patients in managing their health data and enhance communication with their healthcare teams.

## Visual Identity
- **Logo**: Butterfly with sun symbol representing transformation and hope for chronic pain patients
- **Color Palette**: 
  - Primary Purple: #9C27B0 (fibromialgia awareness color)
  - Accent Yellow: #FBC02D (hope and energy)
  - Success Green: #66BB6A (healing and progress)
- **Typography**: Inter font family for modern, accessible design

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
Developed with React 18 and TypeScript, using Vite for building. It employs Wouter for routing and TanStack Query for data management. Styling is handled by Tailwind CSS and shadcn/ui, ensuring a mobile-first, responsive, and light-mode-only interface with high-contrast, accessible colors. Navigation utilizes bottom tabs and a drawer-based side menu.

## Backend
An Express.js server in TypeScript manages the backend. It uses Drizzle ORM with Neon Database (PostgreSQL) for core application data.

## Data Layer
PostgreSQL stores primary application data. Firestore is used for user profiles, authentication, and specific collections including `usuarios`, `assinaturas` (subscriptions), `quizzes`, `medicos`, `medicamentos`, and `report_diario`. Firebase Authentication manages user logins (email/password, Google OAuth).

### Sistema de Quizzes e Mapeamento de Dados
O DorLog implementa um sistema flexível de questionários diários com mapeamento semântico automático das respostas. A estrutura completa está documentada em `QUIZ_DATA_STRUCTURE.md`, incluindo:

- **Três tipos de quiz**: Matinal, Noturno e Emergencial com perguntas específicas
- **Mapeamento semântico automático**: Sistema que classifica respostas em tipos como `eva_scale`, `pain_locations`, `symptoms`, `emotional_state`, `rescue_medication`, etc.
- **Persistência estruturada**: Dados salvos na collection `report_diario` com formato `{email}_{YYYY-MM-DD}`
- **Validação robusta**: Sistema de normalização que identifica e trata dados corrompidos
- **Análise integrada**: Processamento das respostas para geração de insights nos relatórios enhanced

## Report Generation & Sharing
A unified client-side system generates professional HTML reports from Firestore data, uploading them to Firebase Storage for permanent public URLs. This system integrates a template engine for comprehensive medical reports, optimized for performance and cross-platform compatibility. Report sharing is handled via a hybrid multi-platform WhatsApp strategy, using Web Share API on mobile, clipboard integration for desktop, and a fallback URI scheme.

## Sistema Isolado de Análise NLP para Insights de Saúde
**Arquitetura Independente**: Sistema autônomo de processamento de linguagem natural totalmente integrado ao DorLog para análise avançada de textos livres dos usuários, operando de forma isolada e segura.

### Modelos de IA Locais (Privacy-First)
- **Engine**: `@xenova/transformers` - Execução de modelos Transformer diretamente no navegador
- **Privacidade Total**: Zero dados enviados para servidores externos
- **Modelos Utilizados**:
  - **DistilBERT-SST-2**: Análise de sentimento (positivo/negativo/neutro) com 91% de precisão
  - **T5-Small**: Sumarização inteligente e extração de pontos-chave
  - **DistilBERT-MNLI**: Classificação zero-shot para entidades médicas
  - **Sistema Híbrido**: Detecção de urgência combinando IA + regras especializadas

### Capacidades de Análise
- **Análise de Sentimento**: Classificação emocional de relatos com scores de confiança
- **Sumarização Automática**: Condensação de textos longos em insights médicos relevantes  
- **Extração de Entidades**: Identificação automática de sintomas, medicamentos, partes do corpo
- **Detecção de Urgência**: Sistema especializado para identificar situações críticas
- **Correlação Temporal**: Análise de padrões emocionais ao longo do tempo
- **Alertas Preditivos**: Identificação precoce de tendências preocupantes

### Integração com Relatórios
- **Relatórios Enhanced**: Templates especializados com seções de insights NLP
- **Visualizações IA**: Gráficos de sentimento, mapas de entidades médicas
- **Resumos Executivos**: Sínteses automáticas geradas por IA
- **Recomendações Clínicas**: Sugestões baseadas em análise de padrões
- **Risk Assessment**: Avaliação automática de risco baseada em linguagem

### Componentes Arquiteturais
- `nlpAnalysisService.ts`: Núcleo de processamento NLP com modelos Transformers
- `insightGenerationService.ts`: Orquestrador que combina NLP com detecção de padrões  
- `patternDetectionService.ts`: Análise estatística de correlações e tendências
- `enhancedReportAnalysisService.ts`: Integração de insights NLP nos relatórios
- `enhancedHtmlTemplate.ts`: Templates especializados para relatórios com IA

### Estratégias de Fallback e Robustez
- **Sistema Híbrido**: Algoritmos baseados em regras quando modelos de IA falham
- **Lazy Loading**: Carregamento sob demanda dos modelos para otimização
- **Timeout Inteligente**: Fallbacks automáticos em caso de lentidão
- **Cache de Análises**: Otimização de performance para textos já analisados

## UI/UX Design Patterns
The application features a light-mode-only interface with a high-contrast color scheme, bottom navigation tabs, drawer-based side navigation, and card-based layouts. It includes a dynamic quiz system for health tracking and an enhanced EVA Scale component for pain assessment.

## Relatórios Mensais com Análise NLP Integrada

### Duas Modalidades de Relatórios
- **Relatório Padrão**: HTML profissional com dados estruturados e visualizações básicas
- **Relatório Enhanced**: Versão avançada com análise NLP completa e insights de IA

### Seções Exclusivas do Sistema NLP
1. **Resumo Executivo Automatizado**: Síntese inteligente gerada por IA dos principais achados
2. **Análise de Sentimento Temporal**: Evolução emocional ao longo do período analisado  
3. **Insights NLP Contextualizados**: Descobertas automáticas em textos livres dos usuários
4. **Detecção de Padrões Comportamentais**: Correlações identificadas por machine learning
5. **Alertas Preditivos**: Identificação precoce de situações que requerem atenção
6. **Recomendações Clínicas Personalizadas**: Sugestões baseadas na análise integral dos dados

### Processamento Inteligente de Texto Livre
- **Entrada**: Observações dos quizzes, descrições de dor, relatos de crises
- **Análise**: Sentimento, urgência, entidades médicas, padrões linguísticos
- **Saída**: Insights médicos estruturados e alertas clínicos relevantes

### Visualizações Avançadas com IA
- **Timeline de Sentimento**: Correlação emocional com episódios de dor
- **Mapa de Entidades Médicas**: Nuvem de palavras com sintomas identificados
- **Matrix de Correlações**: Heatmap de relações descobertas pela IA
- **Linha de Urgência**: Detecção temporal de situações críticas

### Página de Demonstração NLP
- **NLPDemo**: Interface para testar capacidades de análise de texto em tempo real
- **Textos de Exemplo**: Casos clínicos pré-configurados para demonstração
- **Análise ao Vivo**: Resultados instantâneos de sentimento, entidades e urgência
- **Fallback Testing**: Demonstração de estratégias quando IA não está disponível

## Overview do Relatório Mensal DorLog (/reports/monthly)

### Interface de Seleção de Período
- **Modo Único**: Seleção de um mês específico para análise
- **Modo Intervalo**: Seleção de múltiplos meses consecutivos (ex: Janeiro até Março 2025)
- **Opções Disponíveis**: Últimos 12 meses + próximos 3 meses
- **Seleção Padrão**: Mês atual pré-selecionado automaticamente

### Funcionalidades de Compartilhamento
- **Estratégia Mobile-First**: Prioriza Web Share API nativa (interface do sistema)
- **Fallbacks Desktop**: WhatsApp Web, App WhatsApp, e clipboard como alternativas
- **URL Pública Permanente**: Upload automático para Firebase Storage com links compartilháveis

### Dados Coletados e Processados

#### Fontes de Dados Firestore
- **Collection `medicamentos`**: Lista completa de medicamentos com posologia e frequência
- **Collection `medicos`**: Profissionais cadastrados com especialidades e contatos
- **Collection `quizzes`**: Questionários diários (matinal, noturno, emergencial) com textos livres
- **Collection `report_diario`**: Relatórios diários detalhados de episódios de saúde
- **Collection `usuarios`**: Perfis de usuário e configurações

#### Estratégia de Busca Híbrida
1. **Primary**: Busca por email do usuário
2. **Fallback**: Busca por Firebase UID quando email não retorna resultados
3. **Cache Otimizado**: Armazenamento temporário de identificadores para performance

### Seções do Relatório Padrão

#### Estrutura Base
- **Cabeçalho**: Logo DorLog, período selecionado, email do usuário, data de geração
- **Estatísticas Gerais**: Total de dias, episódios de crise, dor média, taxa de aderência
- **Pontos de Dor**: Mapa de locais mais afetados com frequência de ocorrência
- **Evolução Temporal**: Gráfico de intensidade da dor por períodos do dia
- **Lista de Medicamentos**: Medicamentos ativos com posologia e médicos responsáveis
- **Profissionais de Saúde**: Médicos cadastrados com especialidades e CRM
- **Observações Textuais**: Compilação de notas livres e contextos importantes

### Seções Exclusivas do Relatório Enhanced (NLP)

#### Sumário Executivo Inteligente
- **Síntese Automatizada**: Resumo gerado por IA dos principais achados do período
- **Métricas-Chave Visuais**: Cards com dias analisados, crises, dor média, adesão
- **Avaliação de Risco**: Classificação geral (baixo/médio/alto/crítico) baseada em IA

#### Análise de Linguagem Natural
- **Sentimento Geral**: Classificação emocional (positivo/negativo/neutro) com score de confiança
- **Nível de Urgência**: Escala 1-10 baseada em análise semântica de relatos
- **Entidades Médicas**: Contagem automática de sintomas, medicamentos, partes do corpo, emoções identificadas

#### Visualizações Avançadas com IA
- **Timeline de Sentimento**: Evolução emocional correlacionada com episódios de dor
- **Correlação Dor-Humor**: Análise da relação entre dor física e estado emocional
- **Mapa de Entidades**: Nuvem de palavras com termos médicos mais frequentes
- **Heatmap de Urgência**: Padrões de urgência por dia da semana e horário

#### Insights Preditivos e Clínicos
- **Detecção de Padrões**: Correlações comportamentais descobertas por machine learning
- **Alertas Preditivos**: Identificação precoce de situações críticas com probabilidades
- **Recomendações Personalizadas**: Sugestões clínicas baseadas na análise integral dos dados
- **Timeline de Risco**: Projeção temporal de situações que requerem atenção médica

### Processamento de Textos Livres
- **Entrada**: Observações dos questionários, descrições de dor, relatos de crises, contextos de gatilhos
- **Análise NLP**: Sentimento (DistilBERT-SST-2), sumarização (T5-Small), classificação de entidades (DistilBERT-MNLI)
- **Detecção de Urgência**: Sistema híbrido combinando IA com regras especializadas
- **Saída**: Insights médicos estruturados, alertas clínicos relevantes, e visualizações inteligentes

### Características Técnicas e Privacidade
- **Geração Otimizada**: 2-5 segundos de processamento client-side
- **Formato Standalone**: HTML com CSS/JS inline para máxima compatibilidade
- **Design Responsivo**: Mobile-first com adaptação automática para diferentes dispositivos
- **Privacidade Total**: Processamento NLP 100% local no navegador, zero vazamento de dados
- **Armazenamento Seguro**: URLs públicas permanentes via Firebase Storage
- **Proteção Opcional**: Sistema de senhas para relatórios sensíveis

# External Dependencies

## Firebase Services
- **Firebase Auth**: For user authentication (email/password, Google OAuth).
- **Firestore**: Primary NoSQL database for user-centric data.
- **Firebase Storage**: For storing generated HTML reports.

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.

## UI & Design System
- **shadcn/ui**: React components.
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development Tools
- **Vite**: Build tool.
- **TanStack Query**: Server state management.
- **Wouter**: Routing library.
- **React Hook Form**: Form management and validation.