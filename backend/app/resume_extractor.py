import fitz
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF resume."""

    text = ""

    document = fitz.open(file_path)

    for page in document:
        text += page.get_text()

    document.close()

    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX resume."""

    document = Document(file_path)

    text = "\n".join(
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    )

    return text.strip()


def extract_resume_text(file_path: str) -> str:
    """Extract text based on the resume file extension."""

    if file_path.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_path)

    if file_path.lower().endswith(".docx"):
        return extract_text_from_docx(file_path)

    raise ValueError("Unsupported file type. Use PDF or DOCX.")