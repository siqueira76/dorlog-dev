# GitHub Pages Deployment Setup - Atualizado

Este documento fornece instruções completas para configurar o deployment do DorLog no GitHub Pages com todas as funcionalidades implementadas.

## Visão Geral

O DorLog foi desenvolvido como uma aplicação full-stack com:
- **Frontend React**: Interface web responsiva
- **Sistema de Relatórios**: Geração de relatórios HTML profissionais
- **Firebase Integration**: Autenticação e dados
- **WhatsApp Sharing**: Compartilhamento otimizado multi-plataforma

## Configuração do GitHub Actions

### 1. Criação do Workflow

Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build client
      run: npm run build:client
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. Configuração de Secrets

No GitHub: **Settings → Secrets and variables → Actions → New repository secret**

#### Firebase Client Configuration (Obrigatórios)
```bash
VITE_FIREBASE_API_KEY=AIzaSyB0jO... # Chave da API do Firebase
VITE_FIREBASE_AUTH_DOMAIN=projeto-id.firebaseapp.com # Domínio de autenticação
VITE_FIREBASE_PROJECT_ID=projeto-id # ID do projeto Firebase
VITE_FIREBASE_STORAGE_BUCKET=projeto-id.firebasestorage.app # Bucket do Storage
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890 # ID do remetente
VITE_FIREBASE_APP_ID=1:123:web:abc123... # ID da aplicação
```

#### Firebase Admin SDK (Opcionais - Relatórios com Dados Reais)
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..." # Chave privada do Service Account
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@projeto.iam.gserviceaccount.com # Email do Service Account
FIREBASE_PRIVATE_KEY_ID=abc123... # ID da chave privada
FIREBASE_CLIENT_ID=123456789... # ID do cliente
```

#### Firebase Tools (Opcional - Firebase Hosting)
```bash
FIREBASE_TOKEN=1//0... # Token para deploy no Firebase Hosting
```

### 3. Habilitação do GitHub Pages

1. **Settings → Pages**
2. **Source**: "Deploy from a branch"
3. **Branch**: `gh-pages`
4. **Save**

## Sistema de Relatórios no GitHub Pages

### Funcionalidades Disponíveis

✅ **Interface Completa**: Seleção de períodos mensais e intervalos personalizados  
✅ **Layout Profissional**: Design médico moderno com 🩺 DorLog branding  
✅ **WhatsApp Sharing**: Integração multi-fallback (Web Share API → whatsapp:// → WhatsApp Web)  
✅ **Email Sharing**: Abertura automática do cliente de email com conteúdo pré-preenchido  
✅ **Dados Demonstrativos**: Relatórios realistas com medicamentos, pontos de dor, estatísticas  

### Limitações no GitHub Pages

❌ **Backend APIs**: Endpoints `/api/generate-report` não funcionam (apenas frontend estático)  
❌ **Dados Reais**: Sem acesso ao Firebase Admin SDK (sem backend)  
❌ **Deploy Automático**: Relatórios não são automaticamente deployados no Firebase Hosting  

### Como Funciona no GitHub Pages

1. **Interface**: Usuário seleciona período e clica em "Compartilhar via WhatsApp"
2. **Geração Local**: Relatório HTML é gerado no browser com dados demonstrativos
3. **Compartilhamento**: Link de demonstração é enviado via WhatsApp/Email
4. **Conteúdo**: Dados realistas incluindo Pregabalina, Região lombar, estatísticas de saúde

## Scripts de Build

### build-client.js
```javascript
import { build } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔨 Building client for GitHub Pages...');

try {
  await build({
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    mode: 'production',
    base: './', // Importante para GitHub Pages
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
```

### package.json
```json
{
  "scripts": {
    "build:client": "node build-client.js",
    "deploy:manual": "npm run build:client && npx gh-pages -d dist"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // Essencial para GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
});
```

## Firebase Configuration

### Domínios Autorizados

No Firebase Console → Authentication → Settings → Authorized domains:
```
localhost
seu-usuario.github.io
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
    // ... outras regras
  }
}
```

## Deployment e Verificação

### Deploy Automático
- Push para `main` → GitHub Actions → Deploy automático

### Deploy Manual
```bash
npm run deploy:manual
```

### Verificação Pós-Deploy
1. ✅ Acesse `https://seu-usuario.github.io/repositorio`
2. ✅ Teste login/logout Firebase
3. ✅ Navegue pelas páginas (Home, Médicos, Medicamentos, Relatórios)
4. ✅ Teste geração de relatório
5. ✅ Verifique compartilhamento WhatsApp

## Para Funcionalidade Completa

Se você precisar de todas as funcionalidades (dados reais, deploy automático de relatórios):

### Opção 1: Replit (Recomendado)
- ✅ Backend completo funcionando
- ✅ APIs de relatórios ativas
- ✅ Dados reais do Firestore
- ✅ Deploy automático no Firebase Hosting

### Opção 2: Vercel com Serverless Functions
```bash
npm i -g vercel
vercel --prod
```

### Opção 3: Netlify com Functions
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Opção 4: Firebase Hosting + Cloud Functions
```bash
firebase init functions
firebase deploy
```

## Troubleshooting

### Problemas Comuns

1. **Assets 404**
   - ✅ Verificar `base: './'` no vite.config.ts
   - ✅ Confirmar build em `dist/` (não `dist/public/`)

2. **Firebase Auth Errors**
   - ✅ Verificar todos os secrets VITE_FIREBASE_*
   - ✅ Confirmar domínio autorizado no Firebase

3. **Relatórios não Funcionam**
   - ✅ Normal no GitHub Pages (sem backend)
   - ✅ Interface funciona com dados demonstrativos

4. **WhatsApp não Abre**
   - ✅ Normal em desktop - usar WhatsApp Web
   - ✅ Mobile funciona com app nativo

### Logs de Debug

```bash
# GitHub Actions
github.com/usuario/repo/actions

# Browser Console
F12 → Console → Verificar erros

# Network Tab
F12 → Network → Verificar requests falhando
```

## Monitoramento

- **GitHub Actions**: Logs automáticos de deploy
- **Firebase Console**: Métricas de autenticação
- **Browser DevTools**: Erros de runtime
- **GitHub Pages**: Status em Settings → Pages

## Próximos Passos

Para evolução do projeto:

1. **Migração para Vercel**: Suporte completo a APIs
2. **Cloud Functions**: Relatórios com dados reais
3. **PWA**: Instalação offline
4. **Push Notifications**: Lembretes de medicação

---

*Documentação atualizada: 21 de Agosto de 2025*  
*Versão: Sistema de Relatórios com URLs Únicas implementado*