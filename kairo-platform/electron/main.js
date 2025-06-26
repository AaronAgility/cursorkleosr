const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Set the app name as early as possible
app.setName('Kairo');

// Keep a global reference of the window object
let mainWindow;
let splashWindow;
let devServer;
let testProjectServer;
const isDev = process.env.NODE_ENV === 'development';
const previewPort = 3000; // Preview window always loads port 3000
const kairoPort = 3001; // Kairo always runs on 3001

function createSplashWindow() {
  const iconPath = path.join(__dirname, '../assets/icon-256.png');
  
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: iconPath,
    show: false
  });

  // Create splash screen HTML content
  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #FFCB28;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          border-radius: 12px;
          overflow: hidden;
        }
        .logo {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }
        .title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
          color: white;
        }
        .subtitle {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 30px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 203, 40, 0.3);
          border-top: 3px solid #FFCB28;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .status {
          margin-top: 20px;
          font-size: 12px;
          opacity: 0.6;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <svg class="logo" viewBox="0 0 42 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.4227 30.2102H9.83134L20.8296 11.2799L31.828 30.2102L35.0358 35.8501H41.6587L20.8291 0L0 35.8501H26.9791L24.4227 30.2102Z" fill="#FFCB28"/>
      </svg>
      <div class="title">Kairo</div>
      <div class="subtitle">Multi-Agent Development Platform</div>
      <div class="spinner"></div>
      <div class="status">Starting development servers...</div>
    </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
  
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
    splashWindow.center();
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createWindow() {
  // Get the icon path
  const iconPath = path.join(__dirname, '../assets/icon-256.png');
  console.log('🎨 Loading Kairo icon from:', iconPath);
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      zoomFactor: 0.9  // Scale down by 10%
    },
    icon: iconPath,
    title: 'Kairo',
    titleBarStyle: 'hiddenInset',
    // titleBarStyle: 'default',  // Use default title bar for dragging
    show: false // Don't show until ready
  });

  // Set up the menu
  createMenu();

  if (isDev) {
    // In development, start the Next.js dev server
    startDevServer().then(() => {
      mainWindow.loadURL(`http://localhost:${kairoPort}`);
      
      // Show window when ready
      mainWindow.once('ready-to-show', () => {
        // Close splash screen
        if (splashWindow) {
          splashWindow.close();
        }
        
        mainWindow.show();
        mainWindow.focus();
        
        // Set zoom level after content loads
        mainWindow.webContents.setZoomFactor(0.9);
        
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
      });
    });
  } else {
    // In production, load the built app
    mainWindow.loadFile(path.join(__dirname, '../apps/web/out/index.html'));
    
    mainWindow.once('ready-to-show', () => {
      // Close splash screen
      if (splashWindow) {
        splashWindow.close();
      }
      
      mainWindow.show();
      mainWindow.focus();
      
      // Set zoom level after content loads
      mainWindow.webContents.setZoomFactor(0.9);
    });
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    
    // Kill dev servers if running
    if (devServer) {
      devServer.kill();
    }
    if (testProjectServer) {
      testProjectServer.kill();
    }
  });
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    const testProjectPath1 = path.join(__dirname, '../../../kairo-test-project');
    const testProjectPath2 = path.join(__dirname, '../../../VibeStage');
    const kairoWebPath = path.join(__dirname, '../apps/web');
    const fs = require('fs');
    
    // Determine which test project to use (priority: VibeStage, then kairo-test-project)
    let testProjectPath = null;
    let testProjectName = null;
    
    if (fs.existsSync(testProjectPath2)) {
      testProjectPath = testProjectPath2;
      testProjectName = 'VibeStage';
    } else if (fs.existsSync(testProjectPath1)) {
      testProjectPath = testProjectPath1;
      testProjectName = 'kairo-test-project';
    }
    
    // Clean up any existing processes on our ports
    console.log('🧹 Cleaning up existing processes on ports 3000 and 3001...');
    const { execSync } = require('child_process');
    try {
      // Kill electron processes
      execSync('pkill -f electron || true', { stdio: 'ignore' });
      execSync('pkill -f "Electron" || true', { stdio: 'ignore' });
      // Kill port-specific processes
      execSync('pkill -f "port 3000" || true', { stdio: 'ignore' });
      execSync('pkill -f "port 3001" || true', { stdio: 'ignore' });
      execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
      execSync('lsof -ti:3001 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
    } catch (error) {
      // Ignore errors from kill commands
    }
    
    // Give a moment for ports to be freed
    setTimeout(() => {
      startServers();
    }, 1000);
    
    function startServers() {
      console.log('🔍 Debug: Checking kairo-test-project path:', testProjectPath1);
      console.log('🔍 Debug: kairo-test-project exists:', fs.existsSync(testProjectPath1));
      console.log('🔍 Debug: Checking VibeStage path:', testProjectPath2);
      console.log('🔍 Debug: VibeStage exists:', fs.existsSync(testProjectPath2));
      console.log('🔍 Debug: Selected project:', testProjectName || 'none');
      
      let serversStarted = 0;
      const totalServers = testProjectPath ? 2 : 1;
      
      function checkAllServersReady() {
        serversStarted++;
        if (serversStarted >= totalServers) {
          setTimeout(resolve, 3000); // Give servers 3 seconds to be fully ready
        }
      }
      
      // Always start Kairo on port 3001
      console.log('🚀 Starting Kairo development server on port 3001...');
      console.log('📁 Kairo path:', kairoWebPath);
      
      devServer = spawn('npm', ['run', 'dev'], {
        cwd: kairoWebPath,
        stdio: 'pipe',
        env: { ...process.env, PORT: kairoPort.toString() }
      });

      devServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Kairo:', output.trim());
        
        if ((output.includes('Local:') || output.includes('Ready in') || output.includes('localhost:')) && serversStarted === 0) {
          checkAllServersReady();
        }
      });

      devServer.stderr.on('data', (data) => {
        console.error('Kairo Error:', data.toString().trim());
      });

      devServer.on('error', (error) => {
        console.error('Failed to start Kairo dev server:', error);
        reject(error);
      });
      
      // Start test project if one exists
      if (testProjectPath) {
        console.log(`🚀 Starting ${testProjectName} web app on port 3000...`);
        console.log('📁 Test project path:', testProjectPath);
        
        // Add a small delay before starting test project to let Kairo settle
        setTimeout(() => {
          testProjectServer = spawn('yarn', ['turbo', 'dev', '--filter=web'], {
            cwd: testProjectPath,
            stdio: 'pipe'
          });

          testProjectServer.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`${testProjectName}:`, output.trim());
            
            if ((output.includes('Local:') || output.includes('Ready in') || output.includes('localhost:')) && serversStarted === 1) {
              checkAllServersReady();
            }
          });

          testProjectServer.stderr.on('data', (data) => {
            console.error(`${testProjectName} Error:`, data.toString().trim());
          });

          testProjectServer.on('error', (error) => {
            console.error(`Failed to start ${testProjectName} dev server:`, error);
            // Don't reject here, Kairo can still work without test project
          });
        }, 2000); // 2 second delay
      } else {
        console.log('📝 No test project found (checked kairo-test-project and VibeStage), preview will show Kairo interface');
      }

      // Timeout after 45 seconds
      setTimeout(() => {
        if (serversStarted < totalServers) {
          reject(new Error('Dev servers failed to start within 45 seconds'));
        }
      }, 45000);
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'Kairo',
      submenu: [
        {
          label: 'About Kairo',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Kairo',
              message: 'Kairo - Multi-Agent Development Platform',
              detail: 'AI-powered development platform with specialized agents for web development.\n\nCurrently previewing kairo-test-project\n\nBuilt with Electron and Next.js'
            });
          }
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://github.com/agility/kairo');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template[0].label = app.getName();
    
    // Window menu
    template[3].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set process title
  process.title = 'Kairo';
  
  // Set the app name again after ready
  app.setName('Kairo');
  
  // Set additional app info
  app.setAboutPanelOptions({
    applicationName: 'Kairo',
    applicationVersion: '1.0.0',
    copyright: '© 2024 Agility CMS',
    version: '1.0.0'
  });
  
  // Create splash screen first
  createSplashWindow();
  
  // Then create main window (which will be hidden initially)
  createWindow();

  // On macOS, set dock icon and try to force name update
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../assets/icon-256.png');
    app.dock.setIcon(iconPath);
    
    // Try to set dock menu with app name
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Kairo',
        submenu: [
          {
            label: 'Show Kairo',
            click() {
              if (mainWindow) {
                mainWindow.show();
              }
            }
          }
        ]
      }
    ]);
    app.dock.setMenu(dockMenu);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle deep links (for future use)
app.setAsDefaultProtocolClient('kairo');
