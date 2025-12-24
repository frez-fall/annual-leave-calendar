/**
 * Vercel serverless function for Webflow API proxy
 * Securely handles Webflow API requests with server-side authentication
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load .env.local manually for local development (Vercel dev doesn't always load it automatically)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    // Try to find .env.local in project root (go up from api/webflow-proxy/ to project root)
    const projectRoot = join(__dirname, '../..');
    const envPath = join(projectRoot, '.env.local');
    
    try {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const equalIndex = trimmed.indexOf('=');
          if (equalIndex > 0) {
            const key = trimmed.substring(0, equalIndex).trim();
            const value = trimmed.substring(equalIndex + 1).trim();
            if (key && value && !process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
      console.log('✅ Loaded .env.local file from:', envPath);
    } catch (readErr) {
      console.warn('⚠️ Could not read .env.local:', readErr.message);
    }
  } catch (err) {
    console.warn('⚠️ Could not load .env.local:', err.message);
  }
}

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  return {
    'Access-Control-Allow-Origin': '*', // In production, restrict to specific Webflow domains
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported',
    });
  }

  try {
    const { siteId, method, path, params } = req.body;

    // Validate required fields
    if (!siteId) {
      return res.status(400).json({
        error: 'Missing siteId',
        message: 'siteId is required',
      });
    }

    if (!path) {
      return res.status(400).json({
        error: 'Missing path',
        message: 'API path is required',
      });
    }

    // Get API token from environment variable
    const apiToken = process.env.WEBFLOW_API_TOKEN;
    if (!apiToken) {
      console.error('WEBFLOW_API_TOKEN environment variable is not set');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'API token not configured',
      });
    }

    // Construct Webflow API URL
    // Handle both paths with and without siteId prefix
    let apiPath = path;
    if (!path.startsWith('sites/') && !path.startsWith('collections/')) {
      apiPath = `sites/${siteId}/${path}`;
    } else if (path.startsWith('sites/')) {
      // Path already includes siteId
      apiPath = path;
    } else if (path.startsWith('collections/')) {
      // Collections path doesn't need siteId
      apiPath = path;
    }

    let apiUrl = `${WEBFLOW_API_BASE}/${apiPath}`;

    // Build request options
    const requestOptions = {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0',
      },
    };

    // Add query parameters for GET requests
    if ((method || 'GET') === 'GET' && params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      apiUrl += `?${queryString}`;
    } else if (params && Object.keys(params).length > 0) {
      // Add body for non-GET requests
      requestOptions.body = JSON.stringify(params);
    }

    // Make request to Webflow API
    const response = await fetch(apiUrl, requestOptions);

    // Get response data
    const data = await response.json().catch(() => ({
      error: 'Invalid JSON response',
    }));

    // Return response with CORS headers
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

