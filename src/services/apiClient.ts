/**
 * API Client for centralized HTTP requests
 * Provides consistent error handling and request/response processing
 */

import { API_CONFIG } from "../config/api";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>("GET", endpoint);
  }

  /**
   * Make a POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>("POST", endpoint, data);
  }

  /**
   * Make a POST request with FormData
   */
  async postFormData<T = unknown>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw this.createError(response);
    }

    const result = await response.json();
    return this.processResponse(result);
  }

  /**
   * Make a generic HTTP request
   */
  private async request<T = unknown>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw this.createError(response);
    }

    const result = await response.json();
    return this.processResponse(result);
  }

  /**
   * Create standardized error from response
   */
  private createError(response: Response): ApiError {
    const error = new Error(
      `API error: ${response.status} ${response.statusText}`
    ) as ApiError;
    error.status = response.status;
    error.statusText = response.statusText;
    return error;
  }

  /**
   * Process API response and handle success/error format
   */
  private processResponse<T>(result: ApiResponse<T>): T {
    if (!result.success) {
      throw new Error(result.error || "API request failed");
    }
    return result.data as T;
  }

  /**
   * Check if backend is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get(API_CONFIG.ENDPOINTS.HEALTH);
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
