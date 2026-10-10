
import { api } from "./api";

export interface JobMatchResult {
  match_score: number;
  text_similarity: number;
  skill_match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  job_skill_count: number;
}

export interface JobMatchResponse {
  message: string;
  result: JobMatchResult;
}

export const matchJob = async (
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResponse> => {
  const { data } = await api.post<JobMatchResponse>(
    "/api/job/match",
    {
      resume_text: resumeText,
      job_description: jobDescription,
    }
  );

  return data;
};
