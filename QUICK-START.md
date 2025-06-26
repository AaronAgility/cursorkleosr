# 🚀 Kairo Quick Start Guide

Get up and running with Kairo's multi-agent development platform in minutes.

## Prerequisites

- **Node.js 18+** and npm
- **Git** for version control
- **Optional**: API keys for AI providers (OpenAI, Anthropic, Google)

## Installation

1. Install all dependencies
```bash
npm run setup
```

## Development Options

### **Desktop App (Recommended)**
```bash
npm run app:dev
```

### **Web Interface**
```bash
npm run dev
```

## Available Commands

### Development
```bash
npm run dev         # Start web development server
npm run app:dev     # Launch desktop app in development
npm run build       # Build web application
npm run app:build   # Build desktop app for distribution
npm run app:pack    # Package desktop app
```

### Utilities
```bash
npm run lint        # Run ESLint across all packages
npm run setup       # Install all dependencies
```

## 🎯 First Steps

1. **Start the desktop app**: `npm run app:dev`
2. **Configure Settings**: Click the Settings button to configure:
   - AI provider API keys
   - Agent models and preferences
   - Project type and orchestration mode
3. **Start Developing**: Use the chat interface to coordinate with AI agents

## ✨ Key Features

- **🤖 Multi-Agent System**: 10+ specialized AI agents for different development tasks
- **🖥️ Native Desktop App**: Electron-based app with modern interface
- **⚡ Real-time Orchestration**: Intelligent agent coordination
- **🔧 Project Integration**: Automatic test project detection
- **🎨 Modern UI**: Beautiful, responsive interface with drag-and-drop

## 🔧 Configuration

### Agent Models
Configure which AI models each agent uses:
- **Claude**: Best for coding and analysis
- **GPT**: Great for general tasks and reasoning
- **Gemini**: Excellent for planning and strategy

### API Keys
Add your provider API keys in Settings:
- OpenAI API Key
- Anthropic API Key  
- Google API Key
- Azure OpenAI credentials

### Orchestration Modes
- **Intelligent**: Agents decide how to collaborate
- **Manual**: You control which agents are involved
- **Sequential**: Agents work one after another

## 🚀 Next Steps

4. Try `npm run app:dev` for the full desktop experience
5. Explore the agent system and orchestration capabilities
6. Configure your project settings for optimal agent performance

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [Agent Architecture](./kairo-platform/apps/docs/)
- [Desktop App Guide](./kairo-platform/electron/)

---

**Ready to build with AI agents?** Start with `npm run app:dev` and experience the future of development! 🤖✨
