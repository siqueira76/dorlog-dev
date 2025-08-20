#!/bin/bash

# DorLog - Script de Deploy Automatizado para Firebase Hosting
# Este script automatiza o processo de deploy dos relatórios HTML

set -e  # Sair em caso de erro

echo "🚀 DorLog - Deploy Automatizado"
echo "================================"

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado"
    echo "   Instale com: npm install -g firebase-tools"
    exit 1
fi

# Verificar se está autenticado
if ! firebase projects:list &> /dev/null; then
    echo "❌ Usuário não autenticado no Firebase"
    echo "   Execute: firebase login"
    exit 1
fi

# Verificar se a pasta reports existe
if [ ! -d "reports" ]; then
    echo "❌ Pasta 'reports' não encontrada"
    echo "   Certifique-se de que a estrutura de pastas foi criada"
    exit 1
fi

# Verificar configuração do Firebase
if [ ! -f "firebase.json" ]; then
    echo "❌ Arquivo firebase.json não encontrado"
    echo "   Execute a configuração inicial primeiro"
    exit 1
fi

echo "✅ Verificações preliminares concluídas"

# Mostrar informações do projeto
PROJECT_ID=$(grep -o '"projectId": "[^"]*' firebase.json | cut -d'"' -f4) 2>/dev/null || echo "dorlog-fibro-diario"
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID="dorlog-fibro-diario"
fi

echo "📋 Projeto: $PROJECT_ID"

# Contar arquivos de relatório
REPORT_COUNT=$(find reports/usuarios -name "*.html" -type f 2>/dev/null | wc -l) || REPORT_COUNT=0
echo "📄 Relatórios encontrados: $REPORT_COUNT"

# Fazer deploy
echo ""
echo "🔥 Iniciando deploy no Firebase Hosting..."

if firebase deploy --only hosting --project "$PROJECT_ID"; then
    echo ""
    echo "🎉 Deploy concluído com sucesso!"
    echo "🔗 URL do site: https://$PROJECT_ID.web.app"
    echo "📊 Relatórios disponíveis em: https://$PROJECT_ID.web.app/usuarios/"
    
    # Listar relatórios disponíveis
    if [ $REPORT_COUNT -gt 0 ]; then
        echo ""
        echo "📋 Relatórios disponíveis:"
        find reports/usuarios -name "*.html" -type f | while read file; do
            filename=$(basename "$file")
            echo "   • https://$PROJECT_ID.web.app/usuarios/$filename"
        done
    fi
else
    echo ""
    echo "❌ Erro durante o deploy"
    echo "   Verifique sua autenticação e tente novamente"
    exit 1
fi

echo ""
echo "✅ Processo concluído!"