import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

/**
 * API Client Configuration
 *
 * Centralised HTTP client for making API requests to the FastAPI backend.
 * Automatically uses the correct base URL based on environment (dev/prod).
 *
 * Features:
 * - Environment-aware base URL configuration
 * - Built-in error handling and logging
 * - Request/response interceptors for auth tokens
 * - TypeScript support with proper typing
 * - Automatic JSON handling
 */

// API Response Types
export interface ApiError {
  message: string;
  status: number;
  detail?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Get base URL from environment variables
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        // Get auth token from localStorage or your auth provider
        // Example: const token = localStorage.getItem('auth_token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        // Log requests in development
        if (import.meta.env.DEV) {
          console.log(
            `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
            {
              params: config.params,
              data: config.data,
            },
          );
        }

        return config;
      },
      (error) => {
        console.error("[API Request Error]", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor - handle responses and errors globally
    this.client.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (import.meta.env.DEV) {
          console.log(
            `[API Response] ${response.status} ${response.config.url}`,
            response.data,
          );
        }
        return response;
      },
      (error: AxiosError) => {
        return this.handleError(error);
      },
    );
  }

  /**
   * Global error handler
   */
  private handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: "An unexpected error occurred",
      status: 0,
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      apiError.detail = error.response.data;

      switch (error.response.status) {
        case 400:
          apiError.message = "Bad request - please check your input";
          break;
        case 401:
          apiError.message = "Unauthorized - please log in";
          break;
        case 403:
          apiError.message = "Forbidden - you do not have permission";
          break;
        case 404:
          apiError.message = "Resource not found";
          break;
        case 422:
          apiError.message = "Validation error - please check your input";
          break;
        case 500:
          apiError.message = "Server error - please try again later";
          break;
        default:
          apiError.message = `Request failed with status ${error.response.status}`;
      }

      // If backend provides a detail message, use it
      if (error.response.data && typeof error.response.data === "object") {
        const data = error.response.data as any;
        if (data.detail) {
          apiError.message =
            typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail);
        } else if (data.message) {
          apiError.message = data.message;
        }
      }
    } else if (error.request) {
      // Request made but no response received
      apiError.message = "Network error - please check your connection";
      apiError.status = 0;
    } else {
      // Error setting up the request
      apiError.message = error.message || "Failed to make request";
    }

    console.error("[API Error]", apiError);
    return Promise.reject(apiError);
  }

  /**
   * GET request
   * @param url - The endpoint URL (relative to base URL)
   * @param config - Optional axios config
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * POST request
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request body data
   * @param config - Optional axios config
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config,
    );
    return response.data;
  }

  /**
   * PUT request
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request body data
   * @param config - Optional axios config
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   * @param url - The endpoint URL (relative to base URL)
   * @param data - Request body data
   * @param config - Optional axios config
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config,
    );
    return response.data;
  }

  /**
   * DELETE request
   * @param url - The endpoint URL (relative to base URL)
   * @param config - Optional axios config
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Set authorization token
   * @param token - The auth token to set
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Get the axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Get the current base URL
   */
  getBaseURL(): string {
    return this.client.defaults.baseURL || "";
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;
