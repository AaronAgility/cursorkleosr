# 🚀 Kairo Quick Start

Run Kairo Multi-Agent Development Platform from the repository root.

## ⚡ **One-Command Setup**

```bash
npm run setup
```

This will:
1. Install all dependencies (including local Proton CLI)
2. Check your environment and show available modes

## 🎯 **Running Kairo**

### **Default Development (Web Mode)**
```bash
npm run dev
# or
npm run web:dev
```

### **Enhanced Development (Proton Mode)**
```bash
npm run proton:dev
```

### **Desktop App with Test Project**
```bash
# Optional: Clone test project for enhanced preview
cd ..
git clone https://github.com/agility/kairo-test-project
cd kairo

# Start desktop app with automatic project detection
npm run app:dev
```

## 📊 **Available Commands**

### **Development**
```bash
npm run dev           # Start web development (default)
npm run web:dev       # Start web development
npm run proton:dev    # Start Proton enhanced development
npm run app:dev       # Start desktop app with project detection
```

### **Building & Production**
```bash
npm run build         # Build for web production
npm run web:build     # Build for web production  
npm run web:start     # Start web production server
npm run proton:build  # Build with Proton optimizations
npm run proton:start  # Start Proton production server
npm run app:build     # Build desktop app for distribution
npm run app:pack      # Package desktop app
```

### **Environment & Status**
```bash
npm run check         # Check dual-mode compatibility
npm run proton:status # Check Proton CLI status
npm run proton:info   # Show environment information
```

### **Setup & Maintenance**
```bash
npm run setup         # Full setup (install + check)
npm run install:all   # Install dependencies
npm run lint          # Run linting
```

## 🌟 **What You Get**

- **🤖 9 AI Agents**: Specialized for different development tasks
- **🔄 Live Preview**: Real-time code execution and preview  
- **⚡ Hot Reload**: Enhanced development experience
- **🎯 Type-Safe**: Full TypeScript integration
- **📦 TurboRepo**: Optimized monorepo structure
- **🚀 Dual-Mode**: Choose web or enhanced Proton experience
- **🖥️ Desktop App**: Native Electron app with project detection
- **🔗 Auto-Detection**: Automatically finds and runs test projects

## 🎯 **Next Steps**

1. Run \`npm run setup\` to get started
2. Run \`npm run dev\` for quick development  
3. Open your browser to see the live preview
4. Try \`npm run proton:dev\` for enhanced features

## 🔗 **Test Project Integration**

Kairo can automatically detect and run test projects for enhanced development:

- **Automatic Detection**: Checks for `VibeStage` or `kairo-test-project` in parent directory
- **Live Preview**: Shows your test project in the preview panel
- **Dual Development**: Kairo interface + your project running simultaneously
- **Fallback**: Works with any project running on `localhost:3000`

---

**Ready to build the future with AI agents!** 🤖✨
