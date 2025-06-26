# 🚀 Kairo Multi-Agent Development Platform
![Screenshot 2025-06-26 at 5 17 29 PM](https://github.com/user-attachments/assets/369dd206-31cc-4d6e-aab6-6c87c963ff6a)

AI-powered development platform with 9 specialized agents and a snazzy electron env.

## ⚡ **Quick Start from Repository Root**

```bash
# One-command setup
npm run setup

# Start development (default web mode)
npm run dev

# Or try enhanced Proton mode
npm run proton:dev
```

## 🎯 **All Available Commands**

### **🚀 Development**
```bash
npm run dev           # Start web development (default)
npm run web:dev       # Start web development explicitly
npm run proton:dev    # Start enhanced Proton development
```

### **📦 Building & Production**
```bash
npm run build         # Build for web production
npm run web:build     # Build for web production
npm run web:start     # Start web production server
npm run proton:build  # Build with Proton optimizations
npm run proton:start  # Start Proton production server
```

### **📊 Environment & Status**
```bash
npm run check         # Check dual-mode compatibility
npm run proton:status # Check Proton CLI status
npm run proton:info   # Show detailed environment info
```

### **🛠 Setup & Maintenance**
```bash
npm run setup         # Full setup (install + check)
npm run install:all   # Install all dependencies
npm run lint          # Run linting across platform
```

## 🌟 **What Kairo Provides**

- **🤖 9 Specialized AI Agents**: Design, Frontend, Content, Testing, Performance, Security, Responsive, Deployment, Translation
- **🔄 Live Preview**: Real-time code execution and preview in browser
- **⚡ Enhanced Development**: Hot reload, advanced bundling, edge simulation
- **🎯 Type-Safe**: Full TypeScript integration throughout
- **📦 TurboRepo**: Optimized monorepo with workspace management
- **🚀 Dual-Mode**: Choose traditional web or enhanced Proton experience
- **🌐 Universal Deploy**: Web, Proton cloud, or container deployment

## 🏗 **Platform Architecture**

```
kairo/                    # Repository root
├── README.md                    # This file
├── QUICK-START.md              # Quick start guide
├── package.json                # Root commands
└── kairo-platform/             # Main platform
    ├── apps/
    │   ├── web/                # Main UI application
    │   ├── agents/             # AI agent system  
    │   └── docs/               # Documentation
    ├── tools/proton-dev/       # Local Proton CLI
    ├── lib/runtime-config.ts   # Dual-mode detection
    ├── proton.config.js        # Proton configuration
    └── DUAL-MODE-SETUP.md      # Detailed setup guide
```

## 🚀 **Getting Started**

1. **Clone** the repository
2. **Run** `npm run setup` from the root
3. **Start** development with `npm run dev`
4. **Open** your browser to see the platform
5. **Try** `npm run proton:dev` for enhanced features

## 🔗 **Test Project Setup (Optional)**

For enhanced development and testing, Kairo can automatically detect and run test projects:

### **Option 1: Official Test Project**
```bash
# Clone the official test project (recommended)
cd ..  # Go to parent directory of kairo
git clone https://github.com/agility/kairo-test-project
cd kairo
npm run app:dev  # Start desktop app with test project
```

### **Option 2: Custom Project**
Place any project with a `turbo dev --filter=web` command in the parent directory:
```bash
# Your directory structure should look like:
parent-directory/
├── kairo/           # This repository
├── kairo-test-project/     # Official test project (priority 1)
└── VibeStage/             # Or any other project (priority 2)
```

### **Preview Behavior**
- **With test project**: The preview panel loads your project on `localhost:3000`
- **Without test project**: The preview panel shows whatever is running on `localhost:3000`
- **Priority order**: VibeStage → kairo-test-project → any localhost:3000 content

### **Desktop App Commands**
```bash
npm run app:dev       # Start desktop app with project detection
npm run app:build     # Build desktop app for distribution
npm run app:pack      # Package desktop app
```

## 📚 **Documentation**

- [Quick Start Guide](./QUICK-START.md) - Get running in 2 minutes
- [Dual-Mode Setup](./kairo-platform/DUAL-MODE-SETUP.md) - Detailed configuration
- [Agent Documentation](./kairo-platform/apps/agents/README.md) - AI agent system
- [Platform README](./kairo-platform/README.md) - Complete platform docs

## 🎯 **Use Cases**

- **Rapid Prototyping**: Get AI agents to build your ideas
- **Code Review**: Security, performance, and best practice analysis  
- **Multi-Modal Development**: Web apps, mobile experiences, content management
- **Team Collaboration**: Specialized agents for different team roles
- **Learning**: See how AI approaches different development challenges

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Test with both `npm run dev` and `npm run proton:dev`
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

**Built with ❤️ for the future of AI-powered development** 🤖✨

Ready to experience multi-agent development? Run `npm run setup` and get started!
