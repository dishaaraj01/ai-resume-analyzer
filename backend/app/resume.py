import os
import shutil

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.resume_extractor import extract_resume_text
from app.analyzer import analyze_resume


router = APIRouter(prefix="/api/resume", tags=["Resume"])

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    allowed_extensions = {".pdf", ".docx"}

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = extract_resume_text(file_path)

        if not text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the resume.",
            )

        analysis = analyze_resume(text)

        return {
    "filename": file.filename,
    "message": "Resume analyzed successfully",
    "resume_text": text,
    "analysis": analysis,
}

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(error)}",
        )