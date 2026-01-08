/**
 * Webflow Data API client
 * Supports both direct API calls and Vercel backend proxy
 */

import { proxyGet, proxyRequest } from './api-proxy.js';

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';

/**
 * Make a direct API request to Webflow (development/testing only)
 * @param {string} apiToken - Webflow API token
 * @param {string} method - HTTP method
 * @param {string} url - Full API URL
 * @param {object} params - Query parameters or body
 * @returns {Promise<any>} API response
 */
async function directApiRequest(apiToken, method, url, params = {}) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'accept-version': '1.0.0',
    },
  };

  if (method === 'GET' && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  } else if (method !== 'GET' && Object.keys(params).length > 0) {
    options.body = JSON.stringify(params);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // CORS error - browser blocks cross-origin requests
      throw new Error('CORS error: Browser is blocking the request to Webflow API. This is expected when using direct API calls from a browser. Please use the Vercel backend proxy (apiEndpoint) instead of direct API token (apiToken) for browser-based testing.');
    }
    throw error;
  }
}

/**
 * Webflow API client class
 */
export class WebflowApiClient {
  constructor(config) {
    this.siteId = config.siteId;
    this.apiEndpoint = config.apiEndpoint; // Vercel proxy endpoint
    this.apiToken = config.apiToken; // Direct API token (dev only)
    this.useProxy = !!config.apiEndpoint;
  }

  /**
   * Make an API request
   * @param {string} method - HTTP method
   * @param {string} path - API path (relative to /v2)
   * @param {object} params - Query parameters or body
   * @returns {Promise<any>} API response
   */
  async request(method, path, params = {}) {
    if (this.useProxy) {
      return proxyRequest(this.apiEndpoint, this.siteId, method, path, params);
    } else if (this.apiToken) {
      const url = `${WEBFLOW_API_BASE}/${path}`;
      return directApiRequest(this.apiToken, method, url, params);
    } else {
      throw new Error('No API endpoint or token provided. Please configure apiEndpoint or apiToken.');
    }
  }

  /**
   * List all collections for a site
   * @returns {Promise<Array>} Array of collection objects
   */
  async listCollections() {
    const response = await this.request('GET', `sites/${this.siteId}/collections`);
    return response.collections || [];
  }

  /**
   * Get collection schema/details
   * @param {string} collectionId - Collection ID
   * @returns {Promise<object>} Collection schema
   */
  async getCollection(collectionId) {
    return await this.request('GET', `collections/${collectionId}`);
  }

  /**
   * List items in a collection with pagination
   * @param {string} collectionId - Collection ID
   * @param {object} options - Pagination options
   * @param {number} options.limit - Items per page (default: 100)
   * @param {number} options.offset - Offset for pagination (default: 0)
   * @returns {Promise<object>} Response with items array
   */
  async listCollectionItems(collectionId, options = {}) {
    const { limit = 100, offset = 0 } = options;
    return await this.request('GET', `collections/${collectionId}/items`, {
      limit,
      offset,
    });
  }

  /**
   * Fetch all items from a collection (handles pagination automatically)
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Array>} Array of all items
   */
  async fetchAllCollectionItems(collectionId) {
    const allItems = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listCollectionItems(collectionId, { limit, offset });
      const items = response.items || [];
      allItems.push(...items);

      // Check if there are more items
      hasMore = items.length === limit;
      offset += limit;
    }

    return allItems;
  }
}

