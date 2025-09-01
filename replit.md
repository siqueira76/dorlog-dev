# Overview

DorLog is a Progressive Web App (PWA) designed for comprehensive health management. It enables users to track pain, manage medications, and coordinate with healthcare providers. Key features include detailed tracking of pain and crisis episodes, full CRUD operations for medication and doctor management, dynamic daily health quizzes, and automated generation of professional HTML reports for easy sharing with medical professionals. The primary goal is to empower users in managing their health data and enhance communication with their healthcare teams.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
Developed with React 18 and TypeScript, using Vite for building. It employs Wouter for routing and TanStack Query for data management. Styling is handled by Tailwind CSS and shadcn/ui, ensuring a mobile-first, responsive, and light-mode-only interface with high-contrast, accessible colors. Navigation utilizes bottom tabs and a drawer-based side menu.

## Backend
An Express.js server in TypeScript manages the backend. It uses Drizzle ORM with Neon Database (PostgreSQL) for core application data.

## Data Layer
PostgreSQL stores primary application data. Firestore is used for user profiles, authentication, and specific collections including `usuarios`, `assinaturas` (subscriptions), `quizzes`, `medicos`, `medicamentos`, and `report_diario`. Firebase Authentication manages user logins (email/password, Google OAuth).

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