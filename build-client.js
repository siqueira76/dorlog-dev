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
  base: process.env.NODE_ENV === 'production' ? './' : '/',
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
    console.log('✅ Build do cliente concluído!');
    console.log('📁 Arquivos gerados em: dist/public/');
  } catch (error) {
    console.error('❌ Erro durante o build:', error);
    process.exit(1);
  }
}

buildClient();