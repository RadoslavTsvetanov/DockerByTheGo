import { apiClient  } from "./api";
import { cookies } from "./cookie_interacter";
export const ctx = {
  api: apiClient,
  cookies: cookies,
};
