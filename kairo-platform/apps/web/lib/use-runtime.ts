'use client';

import { useState, useEffect } from 'react';

export type RuntimeMode = 'proton' | 'web' | 'standalone';

export interface RuntimeInfo {
  mode: RuntimeMode;
  isProton: boolean;
  isWeb: boolean;
  isStandalone: boolean;
  features: {
    hotReload: boolean;
    streaming: boolean;
    multiAgent: boolean;
    livePreview: boolean;
  };
}

/**
 * Hook to get runtime configuration on the client side
 */
export function useRuntime(): RuntimeInfo {
  const [runtime, setRuntime] = useState<RuntimeInfo>({
    mode: 'web',
    isProton: false,
    isWeb: true,
    isStandalone: false,
    features: {
      hotReload: true,
      streaming: true,
      multiAgent: true,
      livePreview: true,
    },
  });

  useEffect(() => {
    // Client-side detection
    const detectMode = (): RuntimeMode => {
      // Check for Proton environment
      if (
        typeof window !== 'undefined' &&
        ((window as any).proton || 
         process.env.NEXT_PUBLIC_PROTON_MODE === 'true')
      ) {
        return 'proton';
      }

      // Check for standalone deployment
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        return 'standalone';
      }

      return 'web';
    };

    const mode = detectMode();
    
    setRuntime({
      mode,
      isProton: mode === 'proton',
      isWeb: mode === 'web',
      isStandalone: mode === 'standalone',
      features: {
        hotReload: mode !== 'standalone',
        streaming: true,
        multiAgent: true,
        livePreview: true,
      },
    });
  }, []);

  return runtime;
}

/**
 * Get runtime mode synchronously (returns 'web' during SSR)
 */
export function getRuntimeMode(): RuntimeMode {
  if (typeof window === 'undefined') {
    return 'web'; // SSR fallback
  }

  if ((window as any).proton || process.env.NEXT_PUBLIC_PROTON_MODE === 'true') {
    return 'proton';
  }

  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return 'standalone';
  }

  return 'web';
} 