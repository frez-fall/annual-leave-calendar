/**
 * Vercel backend proxy client for Webflow API requests
 * Handles secure API calls through backend proxy
 */

/**
 * Make a request to the Vercel backend proxy
 * @param {string} apiEndpoint - Backend proxy endpoint URL
 * @param {string} siteId - Webflow site ID
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - API path (e.g., "collections", "collections/{id}/items")
 * @param {object} params - Query parameters or request body
 * @returns {Promise<any>} API response
 */
export async function proxyRequest(apiEndpoint, siteId, method, path, params = {}) {
  // Handle both cases: full path or base URL
  // If apiEndpoint already includes /api/webflow-proxy, use it as-is
  // Otherwise, append /api/webflow-proxy
  let url = apiEndpoint.replace(/\/$/, ''); // Remove trailing slash
  if (!url.includes('/api/webflow-proxy')) {
    url = `${url}/api/webflow-proxy`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId,
        method,
        path,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach backend proxy. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Make a GET request through the proxy
 * @param {string} apiEndpoint - Backend proxy endpoint URL
 * @param {string} siteId - Webflow site ID
 * @param {string} path - API path
 * @param {object} queryParams - Query parameters
 * @returns {Promise<any>} API response
 */
export async function proxyGet(apiEndpoint, siteId, path, queryParams = {}) {
  return proxyRequest(apiEndpoint, siteId, 'GET', path, queryParams);
}

/**
 * Make a POST request through the proxy
 * @param {string} apiEndpoint - Backend proxy endpoint URL
 * @param {string} siteId - Webflow site ID
 * @param {string} path - API path
 * @param {object} body - Request body
 * @returns {Promise<any>} API response
 */
export async function proxyPost(apiEndpoint, siteId, path, body = {}) {
  return proxyRequest(apiEndpoint, siteId, 'POST', path, body);
}

