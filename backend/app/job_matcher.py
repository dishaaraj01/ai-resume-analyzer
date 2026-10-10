import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.analyzer import SKILLS, normalize_text


def extract_job_skills(job_description: str) -> list[str]:
    """Find known technical skills in the job description."""

    normalized_job = normalize_text(job_description)

    found_skills = []

    for skill in SKILLS:
        skill_pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(skill_pattern, normalized_job):
            found_skills.append(skill)

    return found_skills


def calculate_similarity(
    resume_text: str,
    job_description: str,
) -> float:
    """Calculate text similarity using TF-IDF and cosine similarity."""

    documents = [
        normalize_text(resume_text),
        normalize_text(job_description),
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2],
    )[0][0]

    return round(float(similarity * 100), 2)


def match_job(
    resume_text: str,
    job_description: str,
) -> dict:
    """Compare a resume with a job description."""

    resume_skills = set(
        skill.lower()
        for skill in SKILLS
        if re.search(
            r"\b" + re.escape(skill.lower()) + r"\b",
            normalize_text(resume_text),
        )
    )

    job_skills = extract_job_skills(job_description)

    matching_skills = [
        skill
        for skill in job_skills
        if skill.lower() in resume_skills
    ]

    missing_skills = [
        skill
        for skill in job_skills
        if skill.lower() not in resume_skills
    ]

    similarity_score = calculate_similarity(
        resume_text,
        job_description,
    )

    # Combine text similarity and skill matching
    if job_skills:
        skill_match_score = (
            len(matching_skills) / len(job_skills)
        ) * 100
    else:
        skill_match_score = 0

    match_score = round(
        (similarity_score * 0.6)
        + (skill_match_score * 0.4),
        2,
    )

    return {
        "match_score": match_score,
        "text_similarity": similarity_score,
        "skill_match_score": round(skill_match_score, 2),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "job_skill_count": len(job_skills),
    }