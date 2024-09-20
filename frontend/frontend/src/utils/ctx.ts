
import { api, isResponseNotOk } from "./api";
import { cookies } from "./cookie_interacter";
export const ctx = {
  api: api,
  cookies: cookies,
  isResponseNotOk: isResponseNotOk,
};
