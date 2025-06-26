/**
 * Kairo Runtime Configuration
 * Automatically adapts to Proton or Web environments
 */

// Extend global interface for Kairo runtime
declare global {
  var __KAIRO_RUNTIME__: RuntimeConfig | undefined;
  var proton: any | undefined;
}

export interface RuntimeConfig {
  mode: 'proton' | 'web' | 'standalone';
  platform: {
    name: string;
    version: string;
    features: string[];
  };
  services: {
    agents: {
      url: string;
      port: number;
    };
    web: {
      url: string;
      port: number;
    };
    docs: {
      url: string;
      port: number;
    };
  };
  features: {
    hotReload: boolean;
    streaming: boolean;
    multiAgent: boolean;
    livePreview: boolean;
  };
}

/**
 * Detect current runtime environment
 */
export function detectRuntime(): 'proton' | 'web' | 'standalone' {
  // Check for Proton environment variables
  if (
    process.env.PROTON_MODE === 'true' || 
    process.env.PROTON_RUNTIME === 'true' ||
    (typeof globalThis !== 'undefined' && typeof globalThis.proton !== 'undefined')
  ) {
    return 'proton';
  }

  // Check for standalone deployment
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return 'standalone';
  }

  // Default to web mode
  return 'web';
}

/**
 * Get runtime configuration based on environment
 */
export function getRuntimeConfig(): RuntimeConfig {
  const mode = detectRuntime();

  const baseConfig: RuntimeConfig = {
    mode,
    platform: {
      name: 'Kairo',
      version: '1.0.0',
      features: ['multi-agent', 'live-preview', 'ai-powered']
    },
    services: {
      agents: {
        url: 'http://localhost:3002',
        port: 3002
      },
      web: {
        url: 'http://localhost:3001',
        port: 3001
      },
      docs: {
        url: 'http://localhost:4001',
        port: 4001
      }
    },
    features: {
      hotReload: true,
      streaming: true,
      multiAgent: true,
      livePreview: true
    }
  };

  // Proton-specific optimizations
  if (mode === 'proton') {
    baseConfig.platform.features.push('proton-optimized', 'edge-functions');
    baseConfig.services.agents.url = 'proton://agents';
  }

  // Production optimizations
  if (mode === 'standalone') {
    baseConfig.features.hotReload = false;
    baseConfig.platform.features.push('production-optimized');
  }

  return baseConfig;
}

/**
 * Initialize runtime-specific features
 */
export function initializeRuntime(config: RuntimeConfig): RuntimeConfig {
  console.log(`🚀 Initializing Kairo in ${config.mode} mode`);
  
  // Set global runtime info (only in browser/Node.js environments)
  if (typeof globalThis !== 'undefined') {
    globalThis.__KAIRO_RUNTIME__ = config;
  }

  // Proton-specific initialization
  if (config.mode === 'proton') {
    console.log('⚡ Proton features enabled');
    // Initialize Proton-specific features
  }

  // Web-specific initialization
  if (config.mode === 'web') {
    console.log('🌐 Web mode active');
    // Initialize web-specific features
  }

  return config;
}

// Auto-initialize on import
export const RUNTIME_CONFIG = initializeRuntime(getRuntimeConfig()); 