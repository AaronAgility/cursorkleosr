# Agility CMS Apps SDK - Authentication

This document covers authentication patterns, OAuth integration, and secure data storage for Agility CMS Apps.

---

## 🔐 **Authentication Overview**

Apps SDK provides multiple authentication methods to securely integrate with external services while maintaining user privacy and data security.

### **Authentication Types**
- **OAuth 2.0** - Industry standard for third-party service integration
- **API Key Authentication** - Simple key-based authentication
- **JWT Tokens** - JSON Web Tokens for secure communication
- **Custom Authentication** - Proprietary authentication schemes

---

## 🔑 **OAuth 2.0 Integration**

### **OAuth Configuration**
```typescript
// services/OAuth.ts
interface OAuthConfig {
  clientId: string;
  clientSecret?: string; // Store server-side only
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export class OAuthService {
  private config: OAuthConfig;
  
  constructor(config: OAuthConfig) {
    this.config = config;
  }

  // Generate authorization URL
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      state: state || this.generateState()
    });

    return `${this.config.authUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return await response.json();
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}
```

### **Google OAuth Example**
```typescript
// services/GoogleOAuth.ts
import { OAuthService } from './OAuth';

export class GoogleOAuth extends OAuthService {
  constructor(clientId: string, clientSecret: string) {
    super({
      clientId,
      clientSecret,
      redirectUri: `${window.location.origin}/oauth/google/callback`,
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token'
    });
  }

  // Get user profile information
  async getUserProfile(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return await response.json();
  }
}
```

---

## 🔒 **Secure Storage**

### **Using App SDK Secure Storage**
```typescript
import { useAgility } from '@agility/app-sdk';

export const useSecureAuth = () => {
  const { app } = useAgility();

  const storeTokens = async (tokens: TokenResponse) => {
    // Store access token (encrypted)
    await app.setSecureStorage('access_token', tokens.access_token);
    
    // Store refresh token (encrypted)
    if (tokens.refresh_token) {
      await app.setSecureStorage('refresh_token', tokens.refresh_token);
    }
    
    // Store token expiry
    const expiresAt = Date.now() + (tokens.expires_in * 1000);
    await app.setSecureStorage('token_expires_at', expiresAt.toString());
  };

  const getValidToken = async (): Promise<string | null> => {
    try {
      const accessToken = await app.getSecureStorage('access_token');
      const expiresAt = await app.getSecureStorage('token_expires_at');
      
      if (!accessToken || !expiresAt) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiresAt)) {
        // Try to refresh the token
        const refreshToken = await app.getSecureStorage('refresh_token');
        if (refreshToken) {
          return await refreshAccessToken(refreshToken);
        }
        return null;
      }

      return accessToken;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
      const oauthService = new GoogleOAuth(
        installationParameters.clientId,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      const newTokens = await oauthService.refreshToken(refreshToken);
      await storeTokens(newTokens);
      
      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      await clearTokens();
      return null;
    }
  };

  const clearTokens = async () => {
    await app.clearSecureStorage('access_token');
    await app.clearSecureStorage('refresh_token');
    await app.clearSecureStorage('token_expires_at');
  };

  const isAuthenticated = async (): Promise<boolean> => {
    const token = await getValidToken();
    return !!token;
  };

  return {
    storeTokens,
    getValidToken,
    refreshAccessToken,
    clearTokens,
    isAuthenticated
  };
};
```

---

## 🎭 **Authentication Patterns**

### **React Hook for Authentication**
```typescript
// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useSecureAuth } from './useSecureAuth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
}

export const useAuth = (oauthService: OAuthService) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  const secureAuth = useSecureAuth();

  const checkAuthStatus = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isAuth = await secureAuth.isAuthenticated();
      
      if (isAuth) {
        const token = await secureAuth.getValidToken();
        if (token) {
          // Get user info if available
          const user = await getUserInfo(token);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error.message
      });
    }
  }, [secureAuth]);

  const login = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Generate auth URL and open popup
      const authUrl = oauthService.getAuthorizationUrl();
      const popup = window.open(authUrl, 'oauth', 'width=500,height=600');
      
      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          
          try {
            // Exchange code for tokens
            const tokens = await oauthService.exchangeCodeForToken(event.data.code);
            await secureAuth.storeTokens(tokens);
            await checkAuthStatus();
          } catch (error) {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Failed to complete authentication'
            }));
          }
        } else if (event.data.type === 'OAUTH_ERROR') {
          popup?.close();
          window.removeEventListener('message', handleMessage);
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: event.data.error
          }));
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Authentication was cancelled'
          }));
        }
      }, 1000);
      
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  }, [oauthService, secureAuth, checkAuthStatus]);

  const logout = useCallback(async () => {
    await secureAuth.clearTokens();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
  }, [secureAuth]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuthStatus,
    getToken: secureAuth.getValidToken
  };
};

async function getUserInfo(token: string) {
  // Implementation depends on the service
  // This is a placeholder
  return null;
}
```

### **Authentication Component**
```typescript
// components/AuthenticationWrapper.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleOAuth } from '../services/GoogleOAuth';

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  oauthConfig: {
    clientId: string;
    clientSecret: string;
  };
  fallback?: React.ReactNode;
}

export const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({
  children,
  oauthConfig,
  fallback
}) => {
  const oauthService = new GoogleOAuth(
    oauthConfig.clientId,
    oauthConfig.clientSecret
  );
  
  const { isAuthenticated, isLoading, error, login, user } = useAuth(oauthService);

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="auth-required">
        <div className="auth-card">
          <h3>Authentication Required</h3>
          <p>Please connect your account to continue.</p>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <button onClick={login} className="btn btn-primary">
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## 🔧 **API Key Authentication**

### **Simple API Key Pattern**
```typescript
// services/ApiKeyAuth.ts
export class ApiKeyAuth {
  private apiKey: string;
  private keyHeader: string;

  constructor(apiKey: string, keyHeader = 'X-API-Key') {
    this.apiKey = apiKey;
    this.keyHeader = keyHeader;
  }

  // Add authentication headers to requests
  getAuthHeaders(): Record<string, string> {
    return {
      [this.keyHeader]: this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  // Make authenticated request
  async authenticatedFetch(url: string, options: RequestInit = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  // Validate API key
  async validateKey(): Promise<boolean> {
    try {
      const response = await this.authenticatedFetch('/api/validate');
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

---

## 🛡️ **Security Best Practices**

### **Token Management**
```typescript
// utils/tokenSecurity.ts
export class TokenSecurity {
  // Encrypt sensitive data before storage
  static async encryptData(data: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      encoder.encode(data)
    );

    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Validate token format and expiry
  static validateJWT(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Generate secure random state for OAuth
  static generateSecureState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

### **Error Handling**
```typescript
// utils/authErrors.ts
export enum AuthErrorType {
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OAUTH_CANCELLED = 'OAUTH_CANCELLED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
}

export class AuthError extends Error {
  type: AuthErrorType;
  originalError?: Error;

  constructor(type: AuthErrorType, message: string, originalError?: Error) {
    super(message);
    this.type = type;
    this.originalError = originalError;
    this.name = 'AuthError';
  }

  static fromResponse(response: Response): AuthError {
    if (response.status === 401) {
      return new AuthError(
        AuthErrorType.INVALID_TOKEN,
        'Authentication token is invalid or expired'
      );
    }
    
    return new AuthError(
      AuthErrorType.NETWORK_ERROR,
      `Network error: ${response.statusText}`
    );
  }
}
```

---

## 🔗 **Related Documentation**

- **Core Concepts**: `apps-sdk/core-concepts.md`
- **Custom Fields**: `apps-sdk/custom-fields.md`
- **Examples**: `apps-sdk/examples/`
- **Deployment**: `apps-sdk/deployment.md`

---

This authentication guide provides secure patterns for integrating external services while maintaining user privacy and data security within Agility CMS Apps. 