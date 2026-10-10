
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 60000,
});

export interface HealthResponse {
  status: string;
  environment: string;
  version: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
};
