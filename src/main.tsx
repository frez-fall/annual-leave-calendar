/**
 * Test entry point for Calendar component
 * Renders the component in the browser for testing
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Calendar } from './Calendar';
import '../styles.css';

// Get configuration from URL parameters or form inputs
function getConfig() {
  const params = new URLSearchParams(window.location.search);
  
  return {
    siteId: params.get('siteId') || (document.getElementById('siteId') as HTMLInputElement)?.value || '',
    apiEndpoint: params.get('apiEndpoint') || (document.getElementById('apiEndpoint') as HTMLInputElement)?.value || '',
    defaultState: params.get('defaultState') || (document.getElementById('defaultState') as HTMLInputElement)?.value || '',
    locale: params.get('locale') || (document.getElementById('locale') as HTMLInputElement)?.value || 'en-US',
    theme: params.get('theme') || 'dark',
    useMockData: params.get('useMockData') === 'true' || (document.getElementById('useMockData') as HTMLInputElement)?.checked || false,
  };
}

// Load component function (called from HTML button)
(window as any).loadComponent = function() {
  const config = getConfig();
  
  // If using mock data, skip validation
  if (!config.useMockData) {
    if (!config.siteId) {
      alert('Please enter a Webflow Site ID');
      return;
    }
    
    if (!config.apiEndpoint) {
      alert('Please enter an API Endpoint (backend proxy)');
      return;
    }
  }
  
  // Clear previous render
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '';
    const root = ReactDOM.createRoot(rootElement);
    
    // Error Boundary Component
    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean; error: Error | null }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return (
            <div style={{padding: '20px', border: '2px solid red', backgroundColor: '#ffebee'}}>
              <h2>React Error</h2>
              <p>{this.state.error?.message}</p>
              <pre style={{fontSize: '12px', overflow: 'auto'}}>{this.state.error?.stack}</pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    try {
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <Calendar
              siteId={config.siteId || undefined}
              apiEndpoint={config.apiEndpoint || undefined}
              defaultState={config.defaultState || undefined}
              locale={config.locale}
              theme={config.theme as 'light' | 'dark'}
              useMockData={config.useMockData}
            />
          </ErrorBoundary>
        </React.StrictMode>
      );
    } catch (error) {
      console.error('Error rendering Calendar:', error);
    }
  }
};

// Auto-load if URL has parameters (siteId or useMockData)
if (window.location.search.includes('siteId=') || window.location.search.includes('useMockData=true')) {
  (window as any).loadComponent();
}

// Initial render with placeholder
const rootElement = document.getElementById('root');
if (rootElement && !window.location.search.includes('siteId=') && !window.location.search.includes('useMockData=true')) {
  rootElement.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #666;">
      <p>Enter your configuration above and click "Load Component" to test the Calendar component.</p>
      <p style="font-size: 14px; margin-top: 10px;">
        <strong>Quick Test:</strong> Check "Use Mock Data" to test with sample data (no API required)<br/><br/>
        Or pass parameters via URL:<br/>
        <code>?useMockData=true</code> (for mock data)<br/>
        <code>?siteId=YOUR_SITE_ID&apiEndpoint=YOUR_ENDPOINT</code> (for real API)
      </p>
    </div>
  `;
}

