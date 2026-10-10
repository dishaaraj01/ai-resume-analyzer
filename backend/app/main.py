from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import get_settings
from app.resume import router as resume_router
from app.job import router as job_router
from app.gemini_service import generate_resume_feedback

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0"
)

app.include_router(resume_router)
app.include_router(job_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "0.1.0"
    }



class AIFeedbackRequest(BaseModel):
    resume_text: str
    job_description: str = ""


@app.post("/api/resume/ai-feedback")
def get_ai_feedback(request: AIFeedbackRequest):
    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty.",
        )
    
    try:
        feedback = generate_resume_feedback(
            resume_text=request.resume_text,
            job_description=request.job_description,
        )
        return {"feedback": feedback}

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    except Exception as error:
        print("Gemini API error:", repr(error))
        raise HTTPException(
            status_code=502,
            detail=str(error),
        )
