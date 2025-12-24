/**
 * Next.js API route for Webflow API proxy
 * Securely handles Webflow API requests with server-side authentication
 * Deployed on Webflow Cloud
 * 
 * Next.js automatically loads .env.local files, so manual loading is not needed
 */

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';

/**
 * Set CORS headers for the response
 * @param {object} res - Next.js response object
 */
function setCORSHeaders(res) {
  // In production, you may want to restrict to specific Webflow domains
  // For now, allowing all origins for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Main API route handler
 * @param {object} req - Next.js request object
 * @param {object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Set CORS headers
  setCORSHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported',
    });
  }

  try {
    // Parse request body - Next.js automatically parses JSON, but handle edge cases
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Body parsing failed
      }
    }
    
    const { siteId, method, path, params } = body || {};

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
    // Next.js automatically loads .env.local and environment variables
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

