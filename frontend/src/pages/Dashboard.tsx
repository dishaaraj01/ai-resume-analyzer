

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {

  FileText,

  Target,

  Lightbulb,

  LogOut,

  BriefcaseBusiness,

} from "lucide-react";

import { subscribeToAuthChanges, logoutUser } from "../firebase/auth";

import { uploadResume } from "../services/resumeApi";

import { matchJob } from "../services/jobApi";

import { getAIFeedback } from "../services/aiFeedbackApi";
import { saveResumeHistory } from "../firebase/resumeHistory";


function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function FormattedFeedback({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed === "---" || trimmed === "***") {
          return <div key={index} className="h-1" />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={index} className="pt-2 text-base font-bold text-slate-900">
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={index} className="pt-2 text-lg font-bold text-slate-900">
              {renderInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
            </h4>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h4 key={index} className="pt-2 text-xl font-bold text-slate-900">
              {renderInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
            </h4>
          );
        }

        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span className="font-bold text-purple-600">•</span>
              <p className="min-w-0 flex-1">
                {renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""))}
              </p>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

function normalizeJobDescription(text: string) {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*[•▪◦]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "• ")
    .replace(/^\s*---+\s*$/gm, "")
    .trim();
}

interface ResumeAnalysis {

  ats_score: number;

  skills: string[];

  skill_count: number;

  word_count: number;

  recommendations: string[];

}

interface JobMatchResult {

  match_score: number;

  text_similarity: number;

  skill_match_score: number;

  matching_skills: string[];

  missing_skills: string[];

  job_skill_count: number;

}

export default function Dashboard() {

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const [resumeText, setResumeText] = useState("");

  const [uploadError, setUploadError] = useState("");

  const [jobDescription, setJobDescription] = useState("");

  const [matching, setMatching] = useState(false);

  const [jobResult, setJobResult] = useState<JobMatchResult | null>(null);

  const [jobError, setJobError] = useState("");

  const [aiFeedback, setAiFeedback] = useState("");

  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  const [aiFeedbackError, setAiFeedbackError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const unsubscribe = subscribeToAuthChanges((user) => {

      if (!user) {

        navigate("/login");

        return;

      }

      setUserEmail(user.email || "");
      setUserId(user.uid);

    });

    return () => unsubscribe();

  }, [navigate]);

  const handleResumeUpload = async () => {

    if (!selectedFile) {

      setUploadError("Please select a PDF or DOCX resume.");

      return;

    }

    setUploading(true);

    setUploadError("");

    setAnalysis(null);

    setResumeText("");

    setJobResult(null);

    setJobError("");

    try {

      const response = await uploadResume(selectedFile);

      setAnalysis(response.analysis);
      setResumeText(response.resume_text);
      setAiFeedback("");
      setJobResult(null);

      if (userId) {
        try {
          await saveResumeHistory({
            userId,
            resumeFileName: selectedFile.name,
            analysis: response.analysis,
            aiFeedback: "",
            jobDescription: "",
            jobMatch: null,
          });
          setHistoryError("");
        } catch (historySaveError) {
          console.error("Could not save resume history:", historySaveError);
          setHistoryError("Resume analyzed, but saving history failed. Check Firestore security rules and your connection.");
        }
      }

    } catch (error: unknown) {

      const message =

        typeof error === "object" &&

        error !== null &&

        "response" in error

          ? (error as {

              response?: { data?: { detail?: string } };

            }).response?.data?.detail

          : undefined;

      setUploadError(message || "Resume upload failed. Please try again.");

    } finally {

      setUploading(false);

    }

  };

  const handleJobMatch = async () => {

    if (!resumeText) {

      setJobError("Please upload and analyze your resume first.");

      return;

    }

    if (!jobDescription.trim()) {

      setJobError("Please paste a job description.");

      return;

    }

    setMatching(true);

    setJobError("");

    setJobResult(null);

    try {

      const response = await matchJob(resumeText, normalizeJobDescription(jobDescription));
      setJobResult(response.result);

      if (userId) {
        try {
          await saveResumeHistory({
            userId,
            resumeFileName: selectedFile?.name || "Resume",
            analysis,
            aiFeedback,
            jobDescription: normalizeJobDescription(jobDescription),
            jobMatch: response.result,
          });
          setHistoryError("");
        } catch (historySaveError) {
          console.error("Could not save job-match history:", historySaveError);
          setHistoryError("Job match completed, but saving history failed. Check Firestore security rules and your connection.");
        }
      }

    } catch (error: unknown) {

      const message =

        typeof error === "object" &&

        error !== null &&

        "response" in error

          ? (error as {

              response?: { data?: { detail?: string } };

            }).response?.data?.detail

          : undefined;

      setJobError(message || "Job matching failed. Please try again.");

    } finally {

      setMatching(false);

    }

  };

const handleAIFeedback = async () => {

  if (!resumeText.trim()) {

    setAiFeedbackError("Please upload and analyze your resume first.");

    return;

  }

  setGeneratingFeedback(true);

  setAiFeedbackError("");

  setAiFeedback("");

  try {

    const response = await getAIFeedback(
      resumeText,
      normalizeJobDescription(jobDescription)
    );

    setAiFeedback(response.feedback);

    if (userId) {
      try {
        await saveResumeHistory({
          userId,
          resumeFileName: selectedFile?.name || "Resume",
          analysis,
          aiFeedback: response.feedback,
          jobDescription: normalizeJobDescription(jobDescription),
          jobMatch: jobResult,
        });
        setHistoryError("");
      } catch (historySaveError) {
        console.error("Could not save AI-feedback history:", historySaveError);
        setHistoryError("AI feedback generated, but saving history failed. Check Firestore security rules and your connection.");
      }
    }

  } catch (error: unknown) {

    const message =

      typeof error === "object" &&

      error !== null &&

      "response" in error

        ? (

            error as {

              response?: { data?: { detail?: string } };

            }

          ).response?.data?.detail

        : undefined;

    setAiFeedbackError(

      message || "AI feedback failed. Please try again."

    );

  } finally {

    setGeneratingFeedback(false);

  }

};

  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };

  return (

    <div className="min-h-screen bg-slate-50">

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <Link to="/" className="text-2xl font-bold text-slate-900">

            ResumeIQ

          </Link>

          <div className="flex items-center gap-3">

            <Link
              to="/resume-history"
              className="flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50"
            >
              <FileText size={16} />
              Resume History
            </Link>

            <span className="text-sm text-slate-500">{userEmail}</span>

            <button

              onClick={handleLogout}

              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"

            >

              <LogOut size={16} />

              Logout

            </button>

          </div>

        </div>

      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">

        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-2 text-slate-600">

          Analyze your resume and find the right opportunities.

        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <FileText size={28} />

            <h2 className="mt-5 text-xl font-semibold">Resume Analysis</h2>
            <p className="mt-2 text-sm text-slate-500">

              Upload a PDF or DOCX resume to get an ATS-style analysis.

            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-purple-400 hover:bg-purple-50">
              <FileText size={30} className="mb-2 text-slate-500" />
              <span className="font-semibold text-slate-800">Choose your resume</span>
              <span className="mt-1 text-xs text-slate-500">PDF or DOCX</span>
              <span className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">Browse files</span>
              <input type="file" accept=".pdf,.docx" onChange={(event) => { setSelectedFile(event.target.files?.[0] || null); setUploadError(""); }} className="sr-only" />
            </label>

            {selectedFile && (

              <p className="mt-2 break-all text-sm text-slate-600">

                Selected: {selectedFile.name}

              </p>

            )}

            {uploadError && (

              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">

                {uploadError}

              </p>

            )}

            <button

              onClick={handleResumeUpload}

              disabled={uploading}

              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"

            >

              {uploading ? "Analyzing..." : "Analyze Resume"}

            </button>

          </section>

        </div>

        {analysis && (

          <section className="mt-6 rounded-2xl bg-white p-8 shadow-sm">

            <h2 className="text-2xl font-bold">Resume Analysis Results</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">ATS Score</p>

                <p className="mt-2 text-4xl font-bold">{analysis.ats_score}</p>

                <p className="text-xs text-slate-500">out of 100</p>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">Skills Found</p>

                <p className="mt-2 text-4xl font-bold">{analysis.skill_count}</p>

              </div>

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-sm text-slate-500">Word Count</p>

                <p className="mt-2 text-4xl font-bold">{analysis.word_count}</p>

              </div>

            </div>

            <h3 className="mt-8 text-lg font-semibold">Detected Skills</h3>

            <div className="mt-3 flex flex-wrap gap-2">

              {analysis.skills.map((skill) => (

                <span

                  key={skill}

                  className="rounded-full bg-slate-100 px-3 py-1 text-sm"

                >

                  {skill}

                </span>

              ))}

            </div>

            <h3 className="mt-8 text-lg font-semibold">Recommendations</h3>

            <ul className="mt-3 space-y-2">

              {analysis.recommendations.map((item, index) => (

                <li

                  key={index}

                  className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600"

                >

                  {item}

                </li>

              ))}

            </ul>

          </section>

        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <section className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-3">
              <Target size={28} />
              <h2 className="text-xl font-semibold">Job Matching</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">Paste the job description to compare its requirements with your resume.</p>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              onPaste={(event) => {
                event.preventDefault();
                const pastedText = event.clipboardData.getData("text");
                setJobDescription(normalizeJobDescription(pastedText));
                setJobError("");
                setJobResult(null);
              }}
              placeholder="Paste the full job description here..."
              rows={6}
              className="mt-5 w-full rounded-xl border border-slate-300 p-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">Markdown headings and bold markers are removed when you paste or clean the text.</p>
              <button
                type="button"
                onClick={() => {
                  setJobDescription(normalizeJobDescription(jobDescription));
                  setJobError("");
                  setJobResult(null);
                }}
                className="text-sm font-medium text-purple-700 underline underline-offset-2 hover:text-purple-900"
              >
                Clean formatting
              </button>
            </div>
            {jobError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{jobError}</p>}
            <button onClick={handleJobMatch} disabled={matching || !jobDescription.trim()} className="mt-4 rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{matching ? "Analyzing Job Match..." : "Analyze Job Match"}</button>
            {jobResult && <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900">Job Match Analysis</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Overall Match</p><p className="mt-2 text-3xl font-bold">{jobResult.match_score}%</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Text Similarity</p><p className="mt-2 text-3xl font-bold">{jobResult.text_similarity}%</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Skill Match</p><p className="mt-2 text-3xl font-bold">{jobResult.skill_match_score}%</p></div>
              </div>
              <h4 className="mt-6 font-semibold">Matching Skills</h4><div className="mt-3 flex flex-wrap gap-2">{jobResult.matching_skills.length ? jobResult.matching_skills.map((skill) => <span key={skill} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">{skill}</span>) : <p className="text-sm text-slate-500">No matching skills detected.</p>}</div>
              <h4 className="mt-6 font-semibold">Skills to Develop</h4><div className="mt-3 flex flex-wrap gap-2">{jobResult.missing_skills.length ? jobResult.missing_skills.map((skill) => <span key={skill} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800">{skill}</span>) : <p className="text-sm text-slate-500">No missing skills detected from the current skill list.</p>}</div>
            </div>}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">

            <Lightbulb size={28} />

            <h2 className="mt-5 text-xl font-semibold">Recommendations</h2>

            <p className="mt-2 text-sm text-slate-500">

              Get suggestions to improve your resume and skills.

            </p>

            <p className="mt-4 text-sm text-slate-600">

              {analysis

                ? `${analysis.recommendations.length} recommendation(s) available below.`

                : "Upload a resume to see recommendations."}

            </p>

          </section>

        </div>



          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">

              AI-Powered Resume Feedback

            </h2>

            <p className="mt-2 text-sm text-slate-600">

              Get personalized resume improvement suggestions powered by Gemini AI.

              Add a job description above to receive more targeted feedback.

            </p>

          </div>

          <button

            onClick={handleAIFeedback}

            disabled={generatingFeedback || !resumeText.trim()}

            className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"

          >

            {generatingFeedback

              ? "Generating Feedback..."

              : "Generate AI Feedback"}

          </button>

          {!resumeText.trim() && (

            <p className="mt-3 text-sm text-slate-500">

              Upload and analyze your resume first to generate feedback.

            </p>

          )}

          {aiFeedbackError && (

            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">

              {aiFeedbackError}

            </div>

          )}

          {aiFeedback && (

            <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-5">

              <h3 className="mb-3 font-semibold text-slate-900">

                Your AI Feedback

              </h3>

              <FormattedFeedback text={aiFeedback} />

            </div>

          )}

        </section>

</main>

    </div>

  );

}
