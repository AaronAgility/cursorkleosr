'use client';

import { useState, useEffect } from 'react';

export type RuntimeMode = 'electron' | 'web';

export interface RuntimeInfo {
  mode: RuntimeMode;
  isElectron: boolean;
  isWeb: boolean;
  userAgent: string;
  platform: string;
}

const defaultRuntimeInfo: RuntimeInfo = {
  mode: 'web',
  isElectron: false,
  isWeb: true,
  userAgent: '',
  platform: 'unknown',
};

/**
 * Hook to get runtime configuration on the client side
 */
export function useRuntime(): RuntimeInfo {
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo>(defaultRuntimeInfo);

  useEffect(() => {
    // Detect runtime environment
    const mode = detectRuntimeMode();
    
    setRuntimeInfo({
      mode,
      isElectron: mode === 'electron',
      isWeb: mode === 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    });
  }, []);

  return runtimeInfo;
}

function detectRuntimeMode(): RuntimeMode {
  // Check if we're in Electron
  if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron')) {
    return 'electron';
  }

  // Default to web
  return 'web';
}

// Utility function to check if we're in Electron
export function isElectronEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.navigator.userAgent.includes('Electron');
}

// Utility function to get runtime mode
export function getRuntimeMode(): RuntimeMode {
  return detectRuntimeMode();
} 