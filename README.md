# 🧭 Project Odysseus - Frontend

Um sistema de aprendizado gamificado que transforma objetivos de carreira em árvores de habilidades épicas.

## 🚀 Tecnologias

- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **Firebase** - Autenticação e banco de dados
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Framer Motion** - Animações
- **D3.js** - Visualizações de dados
- **Lucide React** - Ícones

## 📦 Instalação

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações do Firebase e outras APIs.

4. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ErrorBoundary.jsx
│   ├── LoadingScreen.jsx
│   ├── Navbar.jsx
│   ├── NotificationToast.jsx
│   ├── ProtectedRoute.jsx
│   ├── PublicRoute.jsx
│   ├── Sidebar.jsx
│   ├── SkillNode.jsx
│   └── SkillTreeVisualization.jsx
├── hooks/               # Custom hooks
│   └── useAuth.js
├── pages/               # Páginas da aplicação
│   ├── AboutPage.jsx
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── HomePage.jsx
│   ├── ProfilePage.jsx
│   ├── SettingsPage.jsx
│   └── SkillTreePage.jsx
├── services/            # Serviços e APIs
│   ├── api.js
│   ├── firebase.js
│   └── soundSystem.js
├── stores/              # Stores do Zustand
│   └── useAppStore.js
├── utils/               # Utilitários
│   ├── constants.js
│   ├── helpers.js
│   └── skillTreeGenerator.js
├── App.jsx              # Componente principal
└── main.jsx             # Ponto de entrada
```

## 🎯 Funcionalidades (ALGUMAS NO PROCESSO) 

### ✅ Implementadas
- 🔐 **Autenticação completa** (email/senha, Google)
- 🏠 **Página inicial** com hero section e features
- 📊 **Dashboard** com estatísticas e progresso
- 🌳 **Visualização de árvores de habilidades**
- 👤 **Perfil de usuário** com conquistas
- ⚙️ **Configurações** (tema, som, notificações)
- 🔊 **Sistema de som** com feedback auditivo
- 📱 **Design responsivo** para todos os dispositivos
- 🎨 **Tema dark/light** com glassmorphism
- 🔔 **Sistema de notificações** toast
- 🎯 **Gamificação** com níveis e conquistas

### 🚧 Em Desenvolvimento
- 📈 **Analytics avançados**
- 🤝 **Sistema social** (amigos, rankings)
- 📚 **Biblioteca de recursos**
- 🎮 **Mini-jogos educativos**
- 📱 **App mobile** (React Native)

## 🎨 Design System

### Cores Principais
- **Primary**: `#1ECBF4` (Neon Blue)
- **Accent**: `#FF6B35` (Runic Orange)
- **Dark**: `#0A0A0A` (Deep Black)
- **Success**: `#10B981`
- **Error**: `#EF4444`
- **Warning**: `#F59E0B`

### Tipografia
- **Heading**: Orbitron (futurística)
- **Body**: Inter (legível)
- **Code**: JetBrains Mono

### Componentes
- **Glass Cards**: Efeito glassmorphism
- **Neon Effects**: Bordas e textos com brilho
- **Smooth Animations**: Transições fluidas
- **Responsive Grid**: Layout adaptativo

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run start        # Alias para dev

# Build
npm run build        # Build para produção
npm run preview      # Preview do build
npm run analyze      # Análise do bundle

# Qualidade
npm run lint         # Executa ESLint
npm run clean        # Limpa node_modules e dist
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `VITE_FIREBASE_API_KEY` | Chave da API do Firebase | `AIza...` |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase | `my-project` |
| `VITE_API_BASE_URL` | URL base da API | `http://localhost:5000/api` |
| `VITE_ENABLE_ANALYTICS` | Habilitar analytics | `true` |
| `VITE_DEBUG_MODE` | Modo debug | `true` |

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload da pasta dist/
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📱 PWA

O aplicativo é configurado como PWA (Progressive Web App):
- ✅ Instalável no dispositivo
- ✅ Funciona offline (cache básico)
- ✅ Notificações push
- ✅ Ícones adaptativos

## 🔒 Segurança

- **Firebase Security Rules** configuradas
- **Validação de entrada** com Zod
- **Sanitização** de dados do usuário
- **HTTPS** obrigatório em produção
- **CSP Headers** configurados

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Firebase**:
   - Verifique as variáveis de ambiente
   - Confirme as configurações do projeto Firebase

2. **Erro de Build**:
   - Limpe o cache: `npm run clean && npm install`
   - Verifique a versão do Node.js (>=18)

3. **Problemas de Performance**:
   - Use o React DevTools Profiler
   - Verifique o bundle analyzer: `npm run analyze`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **João Lucas de Oliveira** - Desenvolvedor Principal
- **Você** - Colaborador testando esse projeto que criei para testes, o funcionamento ficará em análise por um tempo até eu dar os updates para construção de algo incrível! 

---

**Project Odysseus** - Transformando aprendizado em aventura! 🚀
