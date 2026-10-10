
import os

from dotenv import load_dotenv
from google import genai

# Load environment variables from backend/.env
load_dotenv(
    os.path.join(os.path.dirname(__file__), "..", ".env")
)


def generate_resume_feedback(
    resume_text: str,
    job_description: str = "",
) -> str:
    """Generate personalized AI feedback for a resume."""

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is missing from backend/.env"
        )

    if not resume_text or not resume_text.strip():
        raise ValueError("Please provide resume text.")

    client = genai.Client(api_key=api_key)

    has_job_description = bool(job_description.strip())

    if has_job_description:
        review_mode = """
The candidate has provided a job description.

Review the resume for general quality AND its relevance to
the specific job. Identify relevant skills, genuine skill gaps,
relevant keywords, and projects or experience worth highlighting.

Only recommend keywords and skills that are relevant to the role.
Clearly distinguish skills the candidate already demonstrates
from skills they may need to learn.
"""
    else:
        review_mode = """
No job description has been provided.

Act as a supportive, honest resume coach for a student,
recent graduate, or entry-level job seeker preparing for
internships and software engineering placements.

Give useful feedback even without a target job description.
Focus on:
- Resume structure, readability, and important missing sections.
- Technical skills and how clearly they are presented.
- Academic, personal, and internship projects.
- How to describe project contributions and technologies used.
- Strong action verbs and clear, concise bullet points.
- Education, certifications, achievements, and relevant experience.
- Practical improvements that can make the resume more effective
  for entry-level opportunities.

Do not criticize the candidate for lacking professional experience.
Suggest relevant improvements appropriate to their actual background.
"""

    prompt = f"""
You are an experienced resume reviewer and career coach.

Review the resume carefully and provide personalized,
practical, honest, and constructive feedback.

REVIEW MODE:
{review_mode}

RESUME:
{resume_text[:12000]}

JOB DESCRIPTION:
{
    job_description[:6000]
    if has_job_description
    else "Not provided. Give a general resume review."
}

FORMAT YOUR RESPONSE USING THESE SECTIONS:

## 1. Overall Resume Assessment
Give a short assessment of the resume and its current strengths.

## 2. Resume Strengths
Identify specific positive points from the supplied resume.

## 3. Areas for Improvement
Explain what needs improvement and why.

## 4. Skills and Experience Gaps
Identify missing or weak information based on the resume.
If a job description is provided, also identify relevant job requirements
that the resume does not currently demonstrate.

## 5. Project and Bullet Point Improvements
Give concrete suggestions for describing projects, responsibilities,
and achievements more effectively.
When useful, provide an example of how to rewrite a bullet point.
Never invent results or claim the candidate achieved something
that is not supported by the resume.

## 6. Action Plan
Give a prioritized list of practical next steps.

## 7. Final Advice
Provide encouraging, realistic advice appropriate to the candidate.

IMPORTANT RULES:
- Base your feedback on the supplied resume.
- Never invent qualifications, work experience, skills, or achievements.
- Do not assume the candidate has professional experience.
- Do not treat a skill as missing merely because it is not in a
  job description or because the resume is brief.
- If information is absent, say what the candidate could add
  if it is true.
- Do not recommend adding technologies or keywords dishonestly.
- Be specific rather than giving generic advice.
- Use clear headings, short paragraphs, and bullet points.
- Do not provide a numerical ATS score unless explicitly requested.
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )

    feedback = response.text

    if not feedback:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return feedback.strip()
