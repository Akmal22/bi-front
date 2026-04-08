// Direct requests to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/bi';

export class ApiClient {
  private baseUrl: string;
  private isCheckingAuth = false;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async checkAuthAndUpdateUser(): Promise<void> {
    // Prevent multiple simultaneous auth checks
    if (this.isCheckingAuth) {
      return;
    }

    this.isCheckingAuth = true;
    try {
      // Check /auth/current endpoint
      const cleanEndpoint = 'auth/current';
      const url = `${this.baseUrl}/${cleanEndpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        // User is authenticated, update user info
        const userData = await response.json();
        if (userData.status === 'SUCCESS' && userData.username && userData.role) {
          // Normalize role format (ROLE_ADMIN -> ADMIN, ROLE_MANAGER -> MANAGER, ROLE_USER -> USER)
          let normalizedRole = userData.role;
          if (normalizedRole.startsWith('ROLE_')) {
            normalizedRole = normalizedRole.replace('ROLE_', '');
          }
          
          // Update session storage and trigger page update
          if (typeof window !== 'undefined') {
            const userInfo = {
              username: userData.username,
              role: normalizedRole,
            };
            sessionStorage.setItem('user', JSON.stringify(userInfo));
            // Dispatch custom event to update AuthContext
            window.dispatchEvent(new CustomEvent('auth-update', { detail: userInfo }));
          }
        }
      } else if (response.status === 401) {
        // User is not authenticated, redirect to login
        this.redirectToLogin();
      }
    } catch (error) {
      // On network error, redirect to login if not already there
      this.redirectToLogin();
    } finally {
      this.isCheckingAuth = false;
    }
  }

  private redirectToLogin(): void {
    // Only redirect if we're not already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}/${cleanEndpoint}`;
    
    try {
      // Prepare headers - only add Content-Type for requests with body
      const headers = new Headers(options.headers);
      if (options.body) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for session-based auth
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - check /auth/current endpoint
        if (response.status === 401) {
          // Don't check /auth/current if we're already calling it
          if (!cleanEndpoint.includes('auth/current')) {
            await this.checkAuthAndUpdateUser();
          } else {
            // If /auth/current itself returns 401, redirect to login
            this.redirectToLogin();
          }
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetails: any = null;
        
        try {
          const errorData = await response.json();
          errorDetails = errorData;
          // Try to extract meaningful error message
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.description) {
            errorMessage = errorData.description;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (textError) {
            // Keep default error message
          }
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = errorDetails;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Get response text first to check if there's content
      const text = await response.text();
      
      // If response is empty, return empty object
      if (!text || text.trim() === '') {
        return {} as T;
      }

      // Try to parse as JSON, but handle parsing errors gracefully
      try {
        return JSON.parse(text);
      } catch (e) {
        // If JSON parsing fails but response was successful, return empty object
        // This handles cases where backend returns success with non-JSON content
        return {} as T;
      }
    } catch (error: any) {
      // Re-throw if it's already our custom error
      if (error.message && error.status) {
        throw error;
      }
      
      // Handle network errors, CORS errors, etc.
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${url}. Make sure the backend is running.`);
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, data?: any): Promise<T> {
    // Convert data object to query parameters for GET requests
    let url = endpoint;
    if (data) {
      const params = new URLSearchParams();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          params.append(key, String(data[key]));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
