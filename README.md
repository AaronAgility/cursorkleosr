# Kairo Multi-Agent Development Platform

A next-generation AI-powered development platform that orchestrates specialized agents to build, optimize, and deploy web applications with real-time preview capabilities.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cursorkleosr

# Install dependencies and start all services
npm run dev
```

This will start:
- **Kairo Orchestration** (AI coordination): `http://localhost:3001`
- **Documentation**: `http://localhost:4001`
- **Your Project Preview**: `http://localhost:3000` (in the iframe)

## ✨ Features

### AI Orchestration
- **Main Orchestration Agent**: Coordinates 8 specialized AI agents
- **Multi-Provider AI**: Claude for coding, Gemini for reasoning, Azure for fallback
- **Intelligent Delegation**: Automatically selects the right agents for each task
- **Real-time Chat**: Streaming AI responses with code highlighting

### Live Preview System
- **Real-time Preview**: Instant updates as agents modify your project
- **Device Simulation**: Desktop, tablet, and mobile views
- **Safari-style Browser**: Realistic browser chrome with functional address bar
- **Project Isolation**: Generated projects live in separate Git repositories

### 8 Specialized Agents
- 🎨 **Design Agent**: UI/UX design, Figma integration, design systems
- ⚛️ **Frontend Agent**: React/Next.js, state management, components
- 🗄️ **Content Agent**: CMS integration, SEO optimization, content strategy
- 🧪 **Testing Agent**: Playwright, Jest, visual regression testing
- ⚡ **Performance Agent**: Core Web Vitals, optimization, monitoring
- 🔒 **Security Agent**: Vulnerability scanning, compliance, auth
- 📱 **Responsive Agent**: Multi-device, PWA features, responsive design
- 🚀 **Deployment Agent**: CI/CD, infrastructure, deployment automation

## 🏗️ Architecture

### Platform Structure
```
kairo-platform/
├── apps/
│   ├── web/           # Kairo orchestration (port 3001)
│   └── docs/          # Documentation (port 4001)
├── lib/               # Shared utilities
├── packages/          # Shared packages
└── agents/            # AI agent configurations
```

### Project Isolation
Generated projects are created outside the platform in `../kairo-projects/` with independent Git repositories:

```
workspace/
├── cursorkleosr/              # Platform source (this repo)
└── kairo-projects/            # Generated projects
    ├── project-1/             # Independent Git repo
    └── project-2/             # Independent Git repo
```

## 🎯 Usage

1. **Start Kairo**: Run `npm run dev` from the root directory
2. **Open Interface**: Navigate to `http://localhost:3001`
3. **Configure Agents**: Click Settings to enable/disable agents and set orchestration mode
4. **Start Building**: Chat with the orchestration agent to describe what you want to build
5. **Live Preview**: Watch your project come to life in real-time at `http://localhost:3000`

### Example Prompts

- "Build a modern landing page with a hero section and contact form"
- "Create a React dashboard with charts and user management"
- "Help me optimize this app's performance and add responsive design"

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.0.0, React 18.2.0, TypeScript 5.3.0
- **Styling**: Tailwind CSS 3.4.0 with custom Kairo theme
- **AI Integration**: Vercel AI SDK with multi-provider support
- **Build System**: Turborepo for monorepo management
- **Package Manager**: Yarn with workspaces

## 🎨 Design System

### Colors
- **Background**: Gradient from `rgb(31 41 55)` with rich gradients
- **Primary Actions**: `#7933dd` (purple) with white text
- **Agility Branding**: Integrated Agility CMS logo and yellow accent `#FFCB28`

### UI Principles
- **Split-screen Layout**: 40% chat interface, 60% live preview
- **Gradient Backgrounds**: Rich gradients throughout the interface
- **Professional Typography**: Clean, modern font stack
- **Responsive Design**: Works seamlessly across all device sizes

## 🔧 Development

The platform is built with a focus on:
- **Developer Experience**: One-command startup, hot reloading, TypeScript
- **Scalability**: Modular architecture, independent agent system
- **Performance**: Optimized builds, efficient AI provider switching
- **Maintainability**: Clean code structure, comprehensive documentation

## 📚 Documentation

Visit `http://localhost:4001` when running the platform for detailed documentation, API references, and development guides.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[License information here]

---

**Kairo** - Transforming web development through intelligent AI orchestration.