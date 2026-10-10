from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.job_matcher import match_job


router = APIRouter(
    prefix="/api/job",
    tags=["Job Matching"],
)


class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str


@router.post("/match")
async def match_resume_to_job(request: JobMatchRequest):
    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty.",
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty.",
        )

    result = match_job(
        request.resume_text,
        request.job_description,
    )

    return {
        "message": "Job matching completed successfully",
        "result": result,
    }