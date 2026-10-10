
import { api } from "./api";

export interface AIFeedbackResponse {
  feedback: string;
}

export const getAIFeedback = async (
  resumeText: string,
  jobDescription: string = ""
): Promise<AIFeedbackResponse> => {
  const { data } = await api.post<AIFeedbackResponse>(
    "/api/resume/ai-feedback",
    {
      resume_text: resumeText,
      job_description: jobDescription,
    }
  );

  return data;
};
