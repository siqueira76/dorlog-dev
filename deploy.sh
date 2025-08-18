#!/bin/bash

# Script para deploy manual no GitHub Pages
# Execute: chmod +x deploy.sh && ./deploy.sh

echo "🚀 Iniciando deploy para GitHub Pages..."

# Build do cliente
echo "📦 Construindo aplicação cliente..."
node build-client.js

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy com gh-pages
    echo "🌐 Fazendo deploy para GitHub Pages..."
    npx gh-pages -d dist/public
    
    if [ $? -eq 0 ]; then
        echo "✅ Deploy realizado com sucesso!"
        echo "🌍 Site disponível em: https://siqueira76.github.io/dorlog/"
        echo "📱 Acesse: https://siqueira76.github.io/dorlog/login"
    else
        echo "❌ Erro durante o deploy!"
        exit 1
    fi
else
    echo "❌ Erro durante o build!"
    exit 1
fi