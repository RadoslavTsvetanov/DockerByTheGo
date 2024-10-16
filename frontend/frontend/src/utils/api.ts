import axios, {type AxiosResponse } from "axios";
import { response_not_ok } from "./consts";
class Api {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  private async makeRequest<V>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: object,
    headers?: object,
  ): Promise<{
    status: number;
    data: V | null;
    err: object | null;
  }> {
    // TODO make it accept a generic with the response data parameter type and see how ypu can make it better
    try {
      const response: AxiosResponse = await axios({
        url,
        method,
        data: method === "GET" ? undefined : data, // Only include data if method is not GET
        headers: {
          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
          Accept: "*/*",
          ...headers,
        },
      });
      return { status: response.status, data: response.data, err: null };
    } catch (err) {
      console.error("Error making request:", err);
      return {
        status: response_not_ok,
        data: null,
        err: err,
      };
    }
  }

  async get() {
    return await this.makeRequest<{ user: string }>(
      `${this.url}`,
      "GET",
      undefined, // No body for GET requests
      {}, // No additional headers needed for GET
    );
  }

  async post(data: object) {
    return await this.makeRequest(
      `${this.url}/user`,
      "POST",
      data, // Include body data for POST requests
      { "Content-Type": "application/json" }, // Set appropriate headers
    );
  }
}

export const api = new Api("http://localhost:6000");
export const isResponseNotOk = (response: number) => {
  return response === response_not_ok;
};
