# AI Resume Analyzer & Job Matcher

An AI-powered web application that analyzes resumes, evaluates ATS-style compatibility, identifies skills, and helps users match their resumes with job descriptions.

**Live Demo:** [Open Application](https://ai-resume-analyzer-alpha-hazel.vercel.app/)

## Overview

AI Resume Analyzer & Job Matcher helps job seekers understand their resumes and identify opportunities for improvement. Users can upload a resume, review its analysis, and compare their qualifications against a job description.

## Features

- **Resume Analysis:** Upload PDF or DOCX resumes for analysis.
- **ATS-Style Scoring:** View a score based on the application's resume analysis.
- **Skill Analysis:** Identify skills present in the resume and potential skill gaps.
- **AI-Powered Feedback:** Generate resume feedback using Gemini AI.
- **Job Matching:** Compare resume information with a job description.
- **User Authentication:** Register and log in using Firebase Authentication.
- **Responsive Interface:** Use the application on desktop and mobile devices.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| Authentication | Firebase Authentication |
| API Communication | REST API |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## Architecture

1. The user interacts with the React frontend.
2. Firebase Authentication manages user login and registration.
3. The frontend sends resume uploads and job-matching requests to the FastAPI backend.
4. The backend processes the request and performs the relevant analysis.
5. Gemini AI provides feedback when the AI-feedback feature is used.
6. The results are returned to the frontend and displayed to the user.

## Project Structure

```text
ai-resume-analyzer/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── .gitignore
└── README.md
```

*The structure above is illustrative. Update it to match the actual files in your repository.*

## Run Locally

### Prerequisites

- Node.js and npm
- Python
- Git
- Firebase project credentials
- Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/dishaaraj01/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
```

Activate the environment on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required backend environment variables in a local `.env` file. Refer to your backend configuration and `.env.example` for the exact variable names.

Start the backend from the `backend` directory:

```bash
uvicorn app.main:app --reload
```

API documentation: http://127.0.0.1:8000/docs

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a local `.env` file containing the required Firebase configuration and API URL:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Use your own Firebase project values. Do not commit private credentials.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed in the terminal.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render

The deployed frontend communicates with the FastAPI backend through its configured API URL.

## Security

- Keep the Gemini API key on the backend.
- Never commit `.env` files, passwords, service-account private keys, or other secrets.
- Use environment variables for deployment configuration.
- Restrict API access and configure Firebase security rules appropriately.

## Future Improvements

- Improve resume-to-job matching and skill-gap analysis.
- Add downloadable analysis reports.
- Improve automated testing and error handling.
- Add more detailed interview preparation recommendations.

## Author

**Dishaa**

GitHub: [@dishaaraj01](https://github.com/dishaaraj01)

---

*Built as a portfolio project to explore full-stack development, AI integration, authentication, and deployment.*
