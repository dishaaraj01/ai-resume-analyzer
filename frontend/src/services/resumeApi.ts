
import { api } from "./api";

export interface ResumeAnalysis {
  ats_score: number;
  skills: string[];
  skill_count: number;
  word_count: number;
  recommendations: string[];
}

export interface ResumeUploadResponse {
  filename: string;
  message: string;
  resume_text: string;
  analysis: ResumeAnalysis;
}

export const uploadResume = async (
  file: File
): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ResumeUploadResponse>(
    "/api/resume/upload",
    formData
  );

  return data;
};
