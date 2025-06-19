# Google Analytics Dashboard App

This example demonstrates building a comprehensive Google Analytics dashboard app that displays page performance metrics within Agility CMS content items.

---

## 🎯 **App Overview**

### **Features**
- OAuth integration with Google Analytics
- Real-time page performance metrics
- Multiple date range options
- Responsive dashboard design
- Secure token management

### **Metrics Displayed**
- Page views
- Unique visitors
- Bounce rate
- Average session duration
- Top referral sources
- Device breakdown

---

## 🔧 **Setup & Configuration**

### **App Configuration**
```typescript
// src/index.tsx
import { App } from '@agility/app-sdk';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

const app = new App({
  name: 'Google Analytics Dashboard',
  version: '1.2.0',
  description: 'Display Google Analytics data for content pages',
  author: 'Your Company',
  
  installationParameters: [
    {
      name: 'googleClientId',
      type: 'string',
      label: 'Google Client ID',
      description: 'OAuth 2.0 Client ID from Google Cloud Console',
      required: true,
      secure: true
    },
    {
      name: 'googleAnalyticsViewId',
      type: 'string',
      label: 'Analytics View ID',
      description: 'Google Analytics View ID (Property ID)',
      required: true
    },
    {
      name: 'defaultDateRange',
      type: 'select',
      label: 'Default Date Range',
      description: 'Default time period for analytics data',
      options: [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' }
      ],
      defaultValue: '30d'
    }
  ],
  
  customFields: [
    {
      name: 'Analytics Dashboard',
      referenceName: 'AnalyticsDashboard',
      description: 'Display Google Analytics metrics for this page',
      component: AnalyticsDashboard
    }
  ]
});

app.start();
```

---

## 📊 **Main Dashboard Component**

### **Analytics Dashboard**
```typescript
// components/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAgility } from '@agility/app-sdk';
import { GoogleAuth } from '../services/GoogleAuth';
import { AnalyticsAPI } from '../services/AnalyticsAPI';
import { MetricsGrid } from './MetricsGrid';
import { ChartContainer } from './ChartContainer';
import { LoadingSpinner } from './LoadingSpinner';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topReferrers: Array<{
    source: string;
    visits: number;
  }>;
  deviceBreakdown: Array<{
    category: string;
    sessions: number;
    percentage: number;
  }>;
  dailyViews: Array<{
    date: string;
    views: number;
  }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const { contentItem, installationParameters } = useAgility();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState(
    installationParameters.defaultDateRange || '30d'
  );

  const googleAuth = new GoogleAuth({
    clientId: installationParameters.googleClientId,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });

  const analyticsAPI = new AnalyticsAPI();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated && contentItem?.slug) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, contentItem, dateRange]);

  const checkAuthentication = async () => {
    try {
      const token = await app.getSecureStorage('google_access_token');
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const authResult = await googleAuth.authorize();
      
      // Store tokens securely
      await app.setSecureStorage('google_access_token', authResult.accessToken);
      await app.setSecureStorage('google_refresh_token', authResult.refreshToken);
      
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setError('Failed to authenticate with Google Analytics');
      console.error('OAuth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    if (!contentItem?.slug) {
      setError('No page slug available for analytics');
      return;
    }

    setLoading(true);
    try {
      const accessToken = await app.getSecureStorage('google_access_token');
      
      const data = await analyticsAPI.getPageAnalytics({
        accessToken,
        viewId: installationParameters.googleAnalyticsViewId,
        pagePath: `/${contentItem.slug}`,
        dateRange,
        metrics: [
          'ga:pageviews',
          'ga:users', 
          'ga:bounceRate',
          'ga:avgSessionDuration'
        ],
        dimensions: [
          'ga:date',
          'ga:source',
          'ga:deviceCategory'
        ]
      });

      setAnalyticsData(processAnalyticsData(data));
      setError(null);
    } catch (error) {
      if (error.status === 401) {
        // Token expired, need to re-authenticate
        setIsAuthenticated(false);
        await app.clearSecureStorage('google_access_token');
      } else {
        setError('Failed to load analytics data');
      }
      console.error('Analytics load failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (rawData: any): AnalyticsData => {
    // Process the raw Google Analytics response
    const reports = rawData.reports[0];
    if (!reports?.data?.rows) {
      return {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        topReferrers: [],
        deviceBreakdown: [],
        dailyViews: []
      };
    }

    // Extract metrics and process data
    const rows = reports.data.rows;
    const totals = reports.data.totals[0].values;

    return {
      pageViews: parseInt(totals[0]) || 0,
      uniqueVisitors: parseInt(totals[1]) || 0,
      bounceRate: parseFloat(totals[2]) || 0,
      avgSessionDuration: parseFloat(totals[3]) || 0,
      topReferrers: extractTopReferrers(rows),
      deviceBreakdown: extractDeviceBreakdown(rows),
      dailyViews: extractDailyViews(rows)
    };
  };

  const extractTopReferrers = (rows: any[]) => {
    const referrerMap = new Map();
    
    rows.forEach(row => {
      const source = row.dimensions[1];
      const visits = parseInt(row.metrics[0].values[0]);
      
      if (referrerMap.has(source)) {
        referrerMap.set(source, referrerMap.get(source) + visits);
      } else {
        referrerMap.set(source, visits);
      }
    });

    return Array.from(referrerMap.entries())
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  };

  const extractDeviceBreakdown = (rows: any[]) => {
    const deviceMap = new Map();
    let totalSessions = 0;

    rows.forEach(row => {
      const device = row.dimensions[2];
      const sessions = parseInt(row.metrics[0].values[1]);
      
      deviceMap.set(device, (deviceMap.get(device) || 0) + sessions);
      totalSessions += sessions;
    });

    return Array.from(deviceMap.entries())
      .map(([category, sessions]) => ({
        category,
        sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0
      }))
      .sort((a, b) => b.sessions - a.sessions);
  };

  const extractDailyViews = (rows: any[]) => {
    const dailyMap = new Map();

    rows.forEach(row => {
      const date = row.dimensions[0];
      const views = parseInt(row.metrics[0].values[0]);
      
      dailyMap.set(date, (dailyMap.get(date) || 0) + views);
    });

    return Array.from(dailyMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  if (!isAuthenticated) {
    return (
      <div className="analytics-auth">
        <div className="auth-container">
          <h3>Google Analytics Integration</h3>
          <p>Connect your Google Analytics account to view page performance metrics.</p>
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Connecting...' : 'Connect Google Analytics'}
          </button>
          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h3>Analytics for: {contentItem?.fields?.title || 'Current Page'}</h3>
        <div className="dashboard-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-selector"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button 
            onClick={loadAnalyticsData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadAnalyticsData} className="btn btn-primary">
            Retry
          </button>
        </div>
      ) : analyticsData ? (
        <>
          <MetricsGrid data={analyticsData} />
          <ChartContainer data={analyticsData} />
        </>
      ) : null}
    </div>
  );
};
```

---

## 📈 **Supporting Components**

### **Metrics Grid**
```typescript
// components/MetricsGrid.tsx
import React from 'react';

interface MetricsGridProps {
  data: AnalyticsData;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ data }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon">👁️</div>
        <div className="metric-content">
          <h4>Page Views</h4>
          <div className="metric-value">{formatNumber(data.pageViews)}</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">👥</div>
        <div className="metric-content">
          <h4>Unique Visitors</h4>
          <div className="metric-value">{formatNumber(data.uniqueVisitors)}</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">📊</div>
        <div className="metric-content">
          <h4>Bounce Rate</h4>
          <div className="metric-value">{data.bounceRate.toFixed(1)}%</div>
        </div>
      </div>
      
      <div className="metric-card">
        <div className="metric-icon">⏱️</div>
        <div className="metric-content">
          <h4>Avg. Session Duration</h4>
          <div className="metric-value">{formatDuration(data.avgSessionDuration)}</div>
        </div>
      </div>
    </div>
  );
};
```

### **Chart Container**
```typescript
// components/ChartContainer.tsx
import React from 'react';
import { LineChart } from './charts/LineChart';
import { PieChart } from './charts/PieChart';
import { BarChart } from './charts/BarChart';

interface ChartContainerProps {
  data: AnalyticsData;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ data }) => {
  return (
    <div className="charts-container">
      <div className="chart-section">
        <h4>Daily Page Views</h4>
        <LineChart 
          data={data.dailyViews}
          xKey="date"
          yKey="views"
          height={200}
        />
      </div>
      
      <div className="chart-section">
        <h4>Device Breakdown</h4>
        <PieChart 
          data={data.deviceBreakdown}
          labelKey="category"
          valueKey="sessions"
          height={200}
        />
      </div>
      
      <div className="chart-section">
        <h4>Top Referrers</h4>
        <BarChart 
          data={data.topReferrers}
          xKey="source"
          yKey="visits"
          height={200}
        />
      </div>
    </div>
  );
};
```

---

## 🔐 **Authentication Service**

### **Google OAuth Integration**
```typescript
// services/GoogleAuth.ts
interface GoogleAuthConfig {
  clientId: string;
  scopes: string[];
  redirectUri?: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class GoogleAuth {
  private config: GoogleAuthConfig;
  
  constructor(config: GoogleAuthConfig) {
    this.config = {
      ...config,
      redirectUri: config.redirectUri || `${window.location.origin}/oauth/callback`
    };
  }

  async authorize(): Promise<AuthResult> {
    return new Promise((resolve, reject) => {
      // Create OAuth URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', this.config.clientId);
      authUrl.searchParams.set('redirect_uri', this.config.redirectUri!);
      authUrl.searchParams.set('scope', this.config.scopes.join(' '));
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      // Open popup window
      const popup = window.open(
        authUrl.toString(),
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for popup messages
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OAUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup?.close();
          
          try {
            // Exchange code for tokens
            const tokens = await this.exchangeCodeForTokens(event.data.code);
            resolve(tokens);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'OAUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup?.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('OAuth popup was closed'));
        }
      }, 1000);
    });
  }

  private async exchangeCodeForTokens(code: string): Promise<AuthResult> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!, // Store securely
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    return data.access_token;
  }
}
```

---

## 📡 **Analytics API Service**

### **Google Analytics API Integration**
```typescript
// services/AnalyticsAPI.ts
interface AnalyticsRequest {
  accessToken: string;
  viewId: string;
  pagePath: string;
  dateRange: string;
  metrics: string[];
  dimensions: string[];
}

export class AnalyticsAPI {
  private baseUrl = 'https://analyticsreporting.googleapis.com/v4/reports:batchGet';

  async getPageAnalytics(request: AnalyticsRequest) {
    const { accessToken, viewId, pagePath, dateRange, metrics, dimensions } = request;
    
    const startDate = this.getStartDate(dateRange);
    
    const requestBody = {
      reportRequests: [{
        viewId,
        dateRanges: [{ startDate, endDate: 'today' }],
        metrics: metrics.map(expression => ({ expression })),
        dimensions: dimensions.map(name => ({ name })),
        dimensionFilterClauses: [{
          filters: [{
            dimensionName: 'ga:pagePath',
            operator: 'EXACT',
            expressions: [pagePath]
          }]
        }],
        orderBys: [{ fieldName: 'ga:date', sortOrder: 'ASCENDING' }]
      }]
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private getStartDate(dateRange: string): string {
    const date = new Date();
    const days = parseInt(dateRange.replace('d', ''));
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }
}
```

---

## 🎨 **Styling**

### **Dashboard Styles**
```css
/* styles/analytics-dashboard.css */
.analytics-dashboard {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.dashboard-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.25rem;
  font-weight: 600;
}

.dashboard-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-range-selector {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.metric-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chart-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.analytics-auth {
  text-align: center;
  padding: 3rem 1rem;
}

.auth-container {
  max-width: 400px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 0.875rem;
}

.error-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .dashboard-controls {
    justify-content: center;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}
```

---

## 🚀 **Deployment Configuration**

### **App Manifest**
```json
{
  "name": "Google Analytics Dashboard",
  "version": "1.2.0",
  "description": "Display Google Analytics metrics within Agility CMS",
  "author": "Your Company",
  "homepage": "https://yourapp.com/analytics",
  "repository": "https://github.com/yourcompany/agility-analytics-app",
  "license": "MIT",
  "keywords": ["analytics", "google", "dashboard", "metrics"],
  "icon": "https://yourapp.com/icon.png",
  "screenshots": [
    "https://yourapp.com/screenshot1.png",
    "https://yourapp.com/screenshot2.png"
  ],
  "installationParameters": [
    {
      "name": "googleClientId",
      "type": "string",
      "label": "Google Client ID",
      "required": true,
      "secure": true
    },
    {
      "name": "googleAnalyticsViewId",
      "type": "string", 
      "label": "Analytics View ID",
      "required": true
    }
  ],
  "permissions": [
    "content:read"
  ],
  "customFields": [
    {
      "name": "Analytics Dashboard",
      "referenceName": "AnalyticsDashboard",
      "description": "Display Google Analytics metrics for this page"
    }
  ]
}
```

This comprehensive example demonstrates how to build a production-ready Google Analytics dashboard app for Agility CMS, complete with OAuth authentication, real-time data fetching, and responsive design. 