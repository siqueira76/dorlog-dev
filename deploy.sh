#!/bin/bash
# Script automatizado para deploy no GitHub Pages

echo "🚀 Iniciando deploy do DorLog para GitHub Pages..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar se git está configurado
if ! git config user.name > /dev/null; then
    log_warn "Configurando git..."
    read -p "Digite seu nome: " git_name
    read -p "Digite seu email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
fi

# Verificar se o repositório remoto existe
if ! git remote get-url origin > /dev/null 2>&1; then
    log_warn "Configurando repositório remoto..."
    git remote add origin https://github.com/siqueira76/dorlog.git
else
    log_info "Repositório remoto já configurado"
fi

# Build do projeto
log_info "Fazendo build do projeto..."
if ! npm run build:client; then
    log_error "Erro no build do projeto"
    exit 1
fi

# Adicionar arquivos ao git
log_info "Adicionando arquivos ao git..."
git add .

# Verificar se há mudanças para commit
if git diff --staged --quiet; then
    log_warn "Nenhuma mudança detectada para commit"
else
    # Fazer commit
    log_info "Fazendo commit..."
    git commit -m "Deploy: Update DorLog app $(date '+%Y-%m-%d %H:%M')"
fi

# Push para GitHub
log_info "Enviando para GitHub..."
if git push -u origin main; then
    log_info "Deploy enviado com sucesso!"
    echo
    log_info "URLs para teste:"
    echo "🧪 Página de teste: https://siqueira76.github.io/dorlog/test.html"
    echo "🏠 App principal: https://siqueira76.github.io/dorlog/"
    echo
    log_warn "Aguarde até 10 minutos para o GitHub Pages atualizar"
    log_warn "Monitore o progresso em: https://github.com/siqueira76/dorlog/actions"
else
    log_error "Erro ao enviar para GitHub"
    log_warn "Verifique se o repositório existe e você tem permissões"
    exit 1
fi

echo
log_info "Deploy concluído! 🎉"