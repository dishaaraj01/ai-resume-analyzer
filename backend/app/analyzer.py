import re


# Common skills that recruiters/ATS systems look for
SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C++",
    "C",
    "SQL",
    "HTML",
    "CSS",
    "React",
    "Angular",
    "Node.js",
    "Flask",
    "FastAPI",
    "Django",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Firebase",
    "Machine Learning",
    "Deep Learning",
    "Data Science",
    "Artificial Intelligence",
    "NLP",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "MySQL",
    "MongoDB",
    "PostgreSQL",
    "REST API",
]


def normalize_text(text: str) -> str:
    """Clean resume text for analysis."""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_skills(text: str) -> list[str]:
    """Find known technical skills in the resume."""

    normalized_text = normalize_text(text)

    found_skills = []

    for skill in SKILLS:
        skill_pattern = r"\b" + re.escape(skill.lower()) + r"\b"

        if re.search(skill_pattern, normalized_text):
            found_skills.append(skill)

    return found_skills


def calculate_ats_score(text: str, skills: list[str]) -> int:
    """Calculate a basic ATS-style score."""

    score = 0

    # Resume has useful amount of content
    word_count = len(text.split())

    if word_count >= 300:
        score += 30
    elif word_count >= 150:
        score += 20
    elif word_count >= 75:
        score += 10

    # Technical skills
    skill_score = min(len(skills) * 4, 40)
    score += skill_score

    # Important resume sections
    normalized_text = normalize_text(text)

    sections = [
        "education",
        "experience",
        "skills",
        "projects",
    ]

    section_score = sum(
        7.5 for section in sections
        if section in normalized_text
    )

    score += int(section_score)

    return min(score, 100)


def generate_recommendations(
    text: str,
    skills: list[str],
) -> list[str]:
    """Generate basic resume improvement suggestions."""

    recommendations = []

    normalized_text = normalize_text(text)

    important_sections = {
        "education": "Add an Education section.",
        "experience": "Add an Experience section if applicable.",
        "skills": "Add a clearly labelled Skills section.",
        "projects": "Add a Projects section with measurable results.",
    }

    for section, recommendation in important_sections.items():
        if section not in normalized_text:
            recommendations.append(recommendation)

    if len(skills) < 5:
        recommendations.append(
            "Add more relevant technical skills that match your target jobs."
        )

    if len(text.split()) < 150:
        recommendations.append(
            "Your resume appears short. Add more relevant details about projects, experience, and achievements."
        )

    if not recommendations:
        recommendations.append(
            "Your resume has a good basic structure. Focus on tailoring it to each job description."
        )

    return recommendations


def analyze_resume(text: str) -> dict:
    """Perform complete basic ATS analysis."""

    skills = extract_skills(text)
    score = calculate_ats_score(text, skills)
    recommendations = generate_recommendations(text, skills)

    return {
        "ats_score": score,
        "skills": skills,
        "skill_count": len(skills),
        "word_count": len(text.split()),
        "recommendations": recommendations,
    }