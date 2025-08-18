# Configuração do GitHub Pages para DorLog

## Visão Geral
Este projeto está configurado para deploy automático no GitHub Pages usando GitHub Actions. O deploy pode ser feito de duas formas:

## 1. Deploy Automático via GitHub Actions

### Configuração Inicial
1. No seu repositório GitHub, vá em **Settings** > **Pages**
2. Em **Source**, selecione **GitHub Actions**
3. Adicione os secrets necessários em **Settings** > **Secrets and variables** > **Actions**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID` 
   - `VITE_FIREBASE_APP_ID`

### Como Funciona
- O arquivo `.github/workflows/deploy.yml` configura o deploy automático
- A cada push na branch `main`, o GitHub Actions:
  1. Instala as dependências
  2. Faz o build do cliente com as variáveis de ambiente
  3. Faz o deploy no GitHub Pages

## 2. Deploy Manual

### Usando o Script Automático
```bash
./deploy.sh
```

### Usando Comandos Manuais
```bash
# Build do cliente apenas
node build-client.js

# Deploy manual com gh-pages
npx gh-pages -d dist/public
```

## Estrutura do Projeto

### Arquivos de Build
- `build-client.js` - Script para build apenas do cliente (sem servidor)
- `deploy.sh` - Script bash para deploy manual completo
- `.github/workflows/deploy.yml` - Configuração do GitHub Actions

### Diretórios
- `client/` - Código fonte do frontend React
- `dist/public/` - Build final para GitHub Pages
- `server/` - Código do servidor Express (não usado no GitHub Pages)

## Configuração do Firebase

### Variáveis de Ambiente Necessárias
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_PROJECT_ID=dorlog-fibro-diario
VITE_FIREBASE_APP_ID=seu_app_id
```

### Domínios Autorizados no Firebase
Adicione o domínio do GitHub Pages no Firebase Console:
- `https://seu-usuario.github.io`
- `https://seu-usuario.github.io/seu-repositorio`

## URLs de Acesso

Após o deploy, o app estará disponível em:
- **GitHub Pages**: `https://seu-usuario.github.io/seu-repositorio/`
- **Replit (desenvolvimento)**: URL do ambiente Replit

## Resolução do Problema 404

Para resolver o erro 404 em rotas SPA no GitHub Pages:

1. **404.html criado**: Arquivo especial que redireciona todas as rotas para index.html
2. **Base Path corrigido**: Configurado como `/dorlog/` para corresponder ao nome do repositório
3. **SPA Routing**: O React Router agora funciona corretamente com navegação direta

## URLs de Acesso Corretas

Após o deploy, acesse:
- **Página principal**: `https://siqueira76.github.io/dorlog/`
- **Login**: `https://siqueira76.github.io/dorlog/login`
- **Outras rotas**: Funcionam automaticamente via client-side routing

## Notas Importantes

1. **Base Path**: O projeto está configurado com base path `/dorlog/` para GitHub Pages
2. **Cliente Apenas**: O GitHub Pages serve apenas arquivos estáticos, então apenas o frontend React é deployado
3. **Firebase**: As funcionalidades de autenticação e Firestore funcionam normalmente no GitHub Pages
4. **PWA**: As capacidades de Progressive Web App são mantidas no deploy
5. **SPA Routing**: Arquivo 404.html garante que todas as rotas funcionem corretamente