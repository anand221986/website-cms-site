import axios from "axios";

// const API_BASE_URL =
//     "http://34.31.149.20:3002";

    const API_BASE_URL =
    "http://localhost:3002";
 

    // const API_BASE_URL =
    // "http://api.amyntasmedia.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
