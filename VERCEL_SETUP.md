# 🚀 Configuração do Vercel - Project Odysseus

## Problemas Identificados e Soluções

### 1. 🖼️ Logo não aparece
**Problema:** A logo estava apenas na pasta `src/assets` mas o `index.html` referencia `/logo-odysseus.png` da pasta `public`.

**Solução:** ✅ Logo copiada para `frontend/public/logo-odysseus.png`

### 2. 🔑 API Key do Gemini não configurada
**Problema:** As variáveis de ambiente não estão configuradas no Vercel.

**Solução:** Configure as seguintes variáveis no painel do Vercel:

## 📋 Variáveis de Ambiente para o Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

### Obrigatórias:
```
VITE_GEMINI_API_KEY=AIzaSyCzIWU_8bAFBrISKrICUXtXrSZhGg99TvI
VITE_APP_NAME=Project Odysseus
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

### Firebase (Configure com seus dados reais):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Opcionais:
```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SOUND=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_DEBUG_MODE=false
```

## 🔧 Passos para Configurar:

1. **Acesse o Vercel Dashboard**
2. **Selecione seu projeto**
3. **Vá em Settings → Environment Variables**
4. **Adicione cada variável acima**
5. **Faça um novo deploy**

## 🚨 Importante:
- Todas as variáveis devem ter o prefixo `VITE_`
- Configure para todos os ambientes (Production, Preview, Development)
- Após adicionar as variáveis, faça um redeploy do projeto

## ✅ Verificação:
Após configurar, a mensagem "API key do Gemini não configurada" deve desaparecer e a logo deve aparecer corretamente.