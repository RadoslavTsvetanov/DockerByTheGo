import { KeyCodes } from "./../canvas/utils/keycodes";
// apiClient.ts

import axios, { AxiosInstance, AxiosResponse } from "axios";
import { cookies } from "./cookie_interacter";

const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
apiBaseUrl;
interface User {
  username: string;
  password: string;
  k8sToken: string;
}

interface LoginResponse {
  token: string;
}

interface K8sTokenResponse {
  k8sToken: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  public token: string | null = null; // To store the session token for protected routes

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Set the authorization token in headers
  private setAuthToken() {
    if (this.token) {
      this.axiosInstance.defaults.headers.Authorization = this.token;
    }
  }

  async signup(username: string, password: string) {
    await this.axiosInstance.post("/signup", { username, password });
  }

  // Login function
  async login(username: string, password: string) {
    const response: AxiosResponse<LoginResponse> =
      await this.axiosInstance.post("/login", { username, password });
    this.token = response.data.token; // Store the token for subsequent requests
    return response;
  }

  // Get Kubernetes token function (protected)
  async getK8sToken(username: string) {
    this.token = cookies.auth.get()!;

    if (!this.token) {
      throw new Error("User not logged in");
    }

    const response: AxiosResponse<K8sTokenResponse> =
      await this.axiosInstance.get(`/getK8sToken/${username}`, {
        headers: { Authorization: this.token + "==" },
      });
    return response.data;
  }

  // Set Kubernetes token function (protected)
  async setK8sToken(username: string, k8sToken: string): Promise<void> {
    this.token = cookies.auth.get()!;
    if (!this.token) {
      throw new Error("User not logged in");
    }

    await this.axiosInstance.post(
      `/setK8sToken/${username}`,
      { k8sToken },
      {
        headers: {
          Authorization: this.token + "==",
        },
      },
    );
  }
}

// Example usage
export const apiClient = new ApiClient();
