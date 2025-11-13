const API_BASE_URL = "http://localhost:3000/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Thêm mã thông báo xác thực nếu có (bỏ qua cho đăng nhập)
    if (!options.skipAuth) {
      let token: string | null = null;
      try {
        const persisted = localStorage.getItem("auth-storage");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          token = parsed?.state?.token ?? parsed?.token ?? null;
        }
      } catch {}

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

  // Auth API
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  }

  async me() {
    return this.request("/auth/me");
  }

  // // Conversations API
  // async getConversations() {
  //   return this.request("/conversations");
  // }

  // async getConversationMessages(
  //   conversationId: number,
  //   limit = 50,
  //   offset = 0
  // ) {
  //   return this.request(
  //     `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
  //   );
  // }

  // async deleteMessage(messageId: number) {
  //   return this.request(`/conversations/messages/${messageId}`, {
  //     method: "DELETE",
  //   });
  // }

  // async hideMessage(messageId: number) {
  //   return this.request(`/conversations/messages/${messageId}/hide`, {
  //     method: "POST",
  //   });
  // }

  // async deleteConversation(conversationId: number) {
  //   return this.request(`/conversations/${conversationId}`, {
  //     method: "DELETE",
  //   });
  // }
}

export const apiClient = new ApiClient(API_BASE_URL);
