# Variáveis de Ambiente - DorLog

## Firebase Client (Obrigatórias)

Estas variáveis são essenciais para o funcionamento básico do app:

```bash
VITE_FIREBASE_API_KEY=AIzaSyB0jO...
VITE_FIREBASE_AUTH_DOMAIN=dorlog-fibro-diario.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dorlog-fibro-diario
VITE_FIREBASE_STORAGE_BUCKET=dorlog-fibro-diario.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1005551706966
VITE_FIREBASE_APP_ID=1:1005551706966:web:abc123...
```

## Firebase Admin SDK (Opcionais)

Para relatórios com dados reais do Firestore:

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@dorlog-fibro-diario.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_CLIENT_ID=123456789012345678901
```

## Firebase Hosting (Opcional)

Para deploy automático de relatórios:

```bash
FIREBASE_TOKEN=1//0ABC...
```

## Como Obter as Variáveis

### Firebase Client
1. Firebase Console → Project Settings → General
2. Copie os valores da seção "Firebase SDK snippet"

### Firebase Admin SDK
1. Firebase Console → Project Settings → Service Accounts
2. Generate new private key → Download JSON
3. Extraia os campos necessários do arquivo JSON

### Firebase Token
```bash
npx firebase login:ci
```

## Configuração por Ambiente

### Desenvolvimento Local (.env)
```bash
# Crie arquivo .env na raiz do projeto
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# ... outras variáveis
```

### GitHub Pages (Secrets)
```bash
# Settings → Secrets and variables → Actions
VITE_FIREBASE_API_KEY
VITE_FIREBASE_PROJECT_ID
# ... outras variáveis
```

### Replit (Environment)
```bash
# Sidebar → Tools → Secrets
VITE_FIREBASE_API_KEY: valor
VITE_FIREBASE_PROJECT_ID: valor
# ... outras variáveis
```

## Validação

Para verificar se as variáveis estão funcionando:

```javascript
// Console do browser
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓' : '✗',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓' : '✗',
  // ... outras verificações
});
```

## Troubleshooting

### Erro: "Firebase Config Missing"
- Verificar se todas as variáveis VITE_FIREBASE_* estão definidas
- Confirmar que começam com "VITE_" (obrigatório para Vite)

### Erro: "Service Account Invalid"
- Verificar FIREBASE_PRIVATE_KEY (incluir quebras de linha \n)
- Confirmar FIREBASE_CLIENT_EMAIL está correto

### Erro: "Firebase Auth Domain"
- Adicionar domínio em Firebase Console → Authentication → Settings → Authorized domains