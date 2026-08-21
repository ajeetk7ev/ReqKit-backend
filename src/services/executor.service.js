import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Proxy Executor Service
 * Safely executes live external HTTP requests via Axios to prevent CORS issues.
 */
export class ExecutorService {
  /**
   * Executes HTTP request and returns standardized response snapshot
   * @param {Object} executePayload 
   */
  static async execute({ method, url, headers = [], queryParams = [], auth = {}, body = {} }) {
    // 1. Process Query Parameters
    const params = {};
    if (Array.isArray(queryParams)) {
      queryParams.forEach((param) => {
        if (param.enabled && param.key) {
          params[param.key] = param.value || '';
        }
      });
    }

    // 2. Process Headers
    const requestHeaders = {};
    if (Array.isArray(headers)) {
      headers.forEach((header) => {
        if (header.enabled && header.key) {
          requestHeaders[header.key] = header.value || '';
        }
      });
    }

    // 3. Process Authentication
    if (auth && auth.type && auth.type !== 'none') {
      const config = auth.config || {};
      if (auth.type === 'bearer' && config.token) {
        requestHeaders['Authorization'] = `Bearer ${config.token}`;
      } else if (auth.type === 'basic' && config.username) {
        const credentials = Buffer.from(`${config.username}:${config.password || ''}`).toString('base64');
        requestHeaders['Authorization'] = `Basic ${credentials}`;
      } else if (auth.type === 'apikey' && config.key && config.value) {
        if (config.in === 'query') {
          params[config.key] = config.value;
        } else {
          requestHeaders[config.key] = config.value;
        }
      }
    }

    // 4. Process Body Payload
    let data = null;
    if (method !== 'GET' && method !== 'HEAD' && body) {
      if (body.type === 'json' && body.rawContent) {
        try {
          data = JSON.parse(body.rawContent);
          if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
            requestHeaders['Content-Type'] = 'application/json';
          }
        } catch (e) {
          data = body.rawContent;
        }
      } else if (body.type === 'x-www-form-urlencoded' && Array.isArray(body.formData)) {
        const urlParams = new URLSearchParams();
        body.formData.forEach((field) => {
          if (field.enabled && field.key) {
            urlParams.append(field.key, field.value || '');
          }
        });
        data = urlParams.toString();
        requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (body.type === 'raw') {
        data = body.rawContent;
      }
    }

    const startTime = Date.now();

    try {
      const response = await axios({
        method,
        url,
        params,
        headers: requestHeaders,
        data,
        timeout: 30000, // 30s timeout
        validateStatus: () => true, // Don't throw on 4xx/5xx status codes
      });

      const responseTimeMs = Date.now() - startTime;
      const responseBodyStr = typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data || '');
      const sizeBytes = Buffer.byteLength(responseBodyStr, 'utf8');

      return {
        statusCode: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: response.data,
        responseTimeMs,
        sizeBytes,
        isSuccess: response.status >= 200 && response.status < 400,
      };
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      logger.error(`Executor Exception: ${error.message}`);

      return {
        statusCode: error.response?.status || 500,
        statusText: error.response?.statusText || 'Network Error',
        headers: error.response?.headers || {},
        body: error.response?.data || { error: error.message },
        responseTimeMs,
        sizeBytes: 0,
        isSuccess: false,
      };
    }
  }
}
