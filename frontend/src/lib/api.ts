// frontend/src/lib/api.ts
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Always check for fresh token from both instance and localStorage
    const token = this.token || localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    
    const url = `${this.baseUrl.replace(/\/$/, "")}${endpoint}`;
    console.log(`[API] ${options.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      if (!response.ok) {
        const errorMessage =
          data?.detail ||
          data?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error(`[API Error] ${errorMessage}`);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
