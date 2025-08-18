#!/usr/bin/env node

// Script para build do cliente apenas (sem servidor)
import { build } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  plugins: [
    (await import('@vitejs/plugin-react')).default(),
  ],
  root: resolve(__dirname, 'client'),
  build: {
    outDir: resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  base: process.env.NODE_ENV === 'production' ? '/dorlog/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client', 'src'),
      '@shared': resolve(__dirname, 'shared'),
      '@assets': resolve(__dirname, 'attached_assets'),
    },
  },
};

async function buildClient() {
  try {
    console.log('🏗️  Construindo cliente para GitHub Pages...');
    await build(config);
    
    // Copy 404.html to handle SPA routing
    const fs = await import('fs/promises');
    const path404Source = resolve(__dirname, 'client/public/404.html');
    const path404Dest = resolve(__dirname, 'dist/public/404.html');
    
    try {
      await fs.copyFile(path404Source, path404Dest);
      console.log('✅ 404.html copiado para SPA routing');
    } catch (copyError) {
      console.log('⚠️  404.html não encontrado, criando automaticamente...');
      const html404 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DorLog - Redirecionando...</title>
  <script>
    (function() {
      var currentPath = window.location.pathname;
      var basePath = '/dorlog/';
      
      var route = currentPath.replace(basePath, '');
      
      if (route && route !== '' && route !== 'index.html') {
        var redirectUrl = window.location.origin + basePath + '#/' + route + window.location.search + window.location.hash;
        window.location.replace(redirectUrl);
      } else {
        window.location.replace(window.location.origin + basePath);
      }
    })();
  </script>
</head>
<body>
  <div style="text-align: center; padding-top: 50px;">
    <h2>Redirecionando...</h2>
    <p>Você está sendo redirecionado para o DorLog.</p>
  </div>
</body>
</html>`;
      await fs.writeFile(path404Dest, html404);
      console.log('✅ 404.html criado automaticamente');
    }
    
    console.log('✅ Build do cliente concluído!');
    console.log('📁 Arquivos gerados em: dist/public/');
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
  }
}

buildClient();