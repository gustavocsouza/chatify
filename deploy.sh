#!/bin/bash

# Script para facilitar deployment no Vercel
# Execute: bash deploy.sh ou ./deploy.sh

echo "🚀 Iniciando deployment no Vercel..."
echo ""

# Verificar se CLI do Vercel está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado."
    echo "Instale com: npm install -g vercel"
    exit 1
fi

# Verificar se estamos em um repositório Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Não é um repositório Git. Inicialize com: git init"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Você tem mudanças não commitadas."
    echo "Faça commit das mudanças antes de fazer deploy."
    exit 1
fi

echo "✅ Verificações iniciais OK"
echo ""

# Push para GitHub (opcional)
read -p "Deseja fazer push para GitHub antes de deployar? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "📤 Fazendo push para GitHub..."
    git push origin main
    echo "✅ Push concluído"
    echo ""
fi

# Fazer deploy
read -p "Deploy em produção? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🚀 Deployando em produção..."
    vercel --prod
else
    echo "🔍 Fazendo preview..."
    vercel
fi

echo ""
echo "✨ Deploy concluído!"
