# Kairo - Multi-Agent Development Platform

Kairo is an advanced multi-agent AI development platform that combines intelligent orchestration with live preview capabilities. It features a split-screen interface where AI agents coordinate to build applications while providing real-time visual feedback.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn package manager

### Installation & Startup

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd cursorkleosr/kairo-platform
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Start all development servers:**
   ```bash
   turbo dev
   ```

4. **Access the applications:**
   - **🎯 Kairo Orchestration**: `http://localhost:3001` (Main AI interface)
   - **🚀 Main Project**: `http://localhost:3000` (Generated applications)
   - **📚 Documentation**: `http://localhost:4001` (Guides and API docs)

## 🏗️ Architecture

### Multi-App Development Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    KAIRO ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│  🎯 Kairo Orchestration (Port 3001)                       │
│  • Main AI orchestration interface                         │
│  • Project settings & agent configuration                  │
│  • Live preview panel with Safari-style address bar       │
│  • Navigation to workspace and docs                        │
│                                                            │
│  🚀 Main Project (Port 3000)                              │
│  • Generated project development environment               │
│  • Hot reload & live development                          │
│  • Project management dashboard                           │
│                                                            │
│  📚 Docs (Port 4001)                                      │
│  • Documentation and guides                               │
│  • API references                                         │
│  • Setup instructions                                     │
└─────────────────────────────────────────────────────────────┘
```

### 8 Specialized AI Agents
- **🎨 Design Agent** - UI/UX design and visual consistency
- **⚡ Frontend Agent** - React/Next.js development
- **📝 Content Agent** - Copy writing and content generation
- **🧪 Testing Agent** - Automated testing and quality assurance
- **🚀 Performance Agent** - Optimization and performance tuning
- **🔒 Security Agent** - Security best practices and vulnerability scanning
- **📱 Responsive Agent** - Mobile-first and responsive design
- **🚀 Deployment Agent** - CI/CD and deployment automation

## 🎯 Features

### 🤖 AI Orchestration
- **Main Orchestration Agent** coordinates all specialized agents
- **Intelligent task delegation** with transparent agent mentions
- **Configurable orchestration modes**: Intelligent, Manual, Sequential
- **Project type awareness**: Web App, Mobile App, API, Full Stack

### 🖥️ Live Preview System
- **Real-time iframe preview** of generated applications
- **Device simulation**: Desktop, Tablet, Mobile with responsive sizing
- **Safari-style browser chrome** with functional address bar
- **Quick navigation** between different applications
- **Error handling** with retry functionality

### ⚙️ Project Configuration
- **Agent selection** - Toggle 8 specialized agents with descriptions
- **Orchestration modes** - Choose how agents work together
- **Project types** - Optimize for different application types
- **Quick presets** - Minimal, Standard, Full Suite configurations

### 🔗 Seamless Navigation
- **Header navigation buttons** for instant access between apps
- **Integrated preview panel** supports all applications
- **Cross-app linking** with bidirectional navigation

## 🛠️ Development Workflow

1. **Start Kairo** → Access orchestration at `localhost:3001`
2. **Configure Agents** → Use settings modal to enable desired agents
3. **Describe Project** → Chat with main orchestration agent
4. **Watch AI Build** → Agents coordinate to generate code
5. **Live Preview** → See results instantly in preview panel
6. **Navigate Seamlessly** → Switch between apps using header buttons

## 🎨 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.8
- **Styling**: Tailwind CSS 3.4 with custom Kairo theme
- **AI Integration**: Vercel AI SDK with multi-provider support
  - Anthropic Claude (coding agents)
  - Google Gemini (reasoning agents)
  - Azure OpenAI (fallback)
- **Development**: Turborepo for monorepo management
- **Package Manager**: Yarn workspaces

## 📁 Project Structure

### Platform Structure
```
workspace/
├── kairo-platform/              # Platform source code (this repository)
│   ├── apps/
│   │   ├── web/                 # Kairo orchestration interface (port 3001)
│   │   ├── workspace/           # Project manager (port 3000)
│   │   └── docs/                # Documentation (port 4001)
│   ├── lib/
│   │   └── project-manager.ts   # Project creation and management
│   ├── packages/
│   │   ├── ui/                  # Shared UI components
│   │   ├── eslint-config/       # Shared ESLint configuration
│   │   └── typescript-config/   # Shared TypeScript configuration
│   └── agents/                  # AI agent configurations
│
└── kairo-projects/              # Generated projects (separate Git repos)
    ├── project-1/               # Each project = independent Git repository
    │   ├── .git/                # Independent Git history
    │   ├── src/                 # Project source code
    │   ├── package.json         # Project dependencies
    │   └── README.md            # Project documentation
    ├── project-2/
    └── project-3/
```

### Benefits of Project Isolation
- ✅ **Clean Separation** - Platform code separate from generated projects
- ✅ **Independent Git Repos** - Each project has its own Git history
- ✅ **Easy Export** - Projects are already in separate repositories
- ✅ **Customer Ownership** - Customers can own their project repos
- ✅ **Platform Updates** - Kairo platform can be updated independently
- ✅ **Scalable** - Unlimited projects without cluttering platform repo

## 🚀 Deployment

Kairo supports both self-hosted and SaaS deployment models:

- **Self-Hosted**: Deploy the entire platform on your infrastructure
- **SaaS Ready**: Scalable architecture for multi-tenant deployments
- **Hybrid Model**: Development platform with project export capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: `http://localhost:4001` when running locally
- **Issues**: Create an issue in the GitHub repository
- **Discussions**: Use GitHub Discussions for questions and ideas

---

**Built with ❤️ by the Kairo team**
