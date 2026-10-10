
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  BrainCircuit,
  Clock,
  LoaderCircle,
} from "lucide-react";
import { subscribeToAuthChanges } from "../firebase/auth";
import {
  getResumeHistory,
  type ResumeHistoryRecord,
} from "../firebase/resumeHistory";

function renderInlineMarkdown(text: string) {
  return text
    .split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}

function FormattedFeedback({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-700">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed || /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          return <div key={index} className="h-1" />;
        }

        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);

        if (headingMatch) {
          const headingText = renderInlineMarkdown(headingMatch[2]);
          const level = headingMatch[1].length;

          if (level <= 2) {
            return (
              <h3
                key={index}
                className="pt-3 text-lg font-bold text-slate-900"
              >
                {headingText}
              </h3>
            );
          }

          return (
            <h4
              key={index}
              className="pt-2 text-base font-semibold text-slate-900"
            >
              {headingText}
            </h4>
          );
        }

        if (/^[-*+]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span className="font-bold text-purple-600">•</span>
              <p className="min-w-0 flex-1">
                {renderInlineMarkdown(trimmed.replace(/^[-*+]\s+/, ""))}
              </p>
            </div>
          );
        }

        if (/^\d+[.)]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2 pl-1">
              <span className="font-semibold text-purple-700">
                {trimmed.match(/^\d+[.)]/)?.[0]}
              </span>
              <p className="min-w-0 flex-1">
                {renderInlineMarkdown(trimmed.replace(/^\d+[.)]\s+/, ""))}
              </p>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

export default function ResumeHistory() {
  const [records, setRecords] = useState<ResumeHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const history = await getResumeHistory(user.uid);
        setRecords(history);
      } catch (err) {
        console.error("Failed to load resume history:", err);
        setError(
          "Unable to load your history. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const formatDate = (timestamp: unknown) => {
    if (
      timestamp &&
      typeof timestamp === "object" &&
      "toDate" in timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      return timestamp.toDate().toLocaleString();
    }

    return "Date unavailable";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            ResumeIQ
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Resume History
        </h1>

        <p className="mt-2 text-slate-600">
          Review your previous resume analyses, AI feedback, and job matches.
        </p>

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-slate-600">
            <LoaderCircle className="animate-spin" />
            Loading your history...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <FileText
              className="mx-auto text-slate-400"
              size={40}
            />

            <h2 className="mt-4 text-xl font-semibold">
              No history yet
            </h2>

            <p className="mt-2 text-slate-600">
              Analyze a resume to see your saved results here.
            </p>

            <Link
              to="/dashboard"
              className="mt-5 inline-block rounded-lg bg-slate-900 px-5 py-3 text-white"
            >
              Analyze a Resume
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {records.map((record) => {
            const analysis =
              record.analysis && typeof record.analysis === "object"
                ? (record.analysis as Record<string, unknown>)
                : null;

            const jobMatch =
              record.jobMatch && typeof record.jobMatch === "object"
                ? (record.jobMatch as Record<string, unknown>)
                : null;

            return (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
                      <FileText size={24} />
                    </div>

                    <div>
                      <h2 className="break-all text-lg font-semibold text-slate-900">
                        {record.resumeFileName || "Resume analysis"}
                      </h2>

                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <Clock size={14} />
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>

                  {analysis && typeof analysis.ats_score === "number" && (
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-sm text-slate-500">
                        ATS-style score
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {analysis.ats_score}/100
                      </p>
                    </div>
                  )}
                </div>

                {analysis &&
                  Array.isArray(analysis.skills) && (
                    <div className="mt-5">
                      <h3 className="font-semibold text-slate-900">
                        Detected skills
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.skills.map((skill, index) => (
                          <span
                            key={`${String(skill)}-${index}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                          >
                            {String(skill)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {record.aiFeedback && (
                  <details className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <summary className="cursor-pointer font-semibold text-purple-900">
                      <BrainCircuit
                        className="mr-2 inline"
                        size={18}
                      />
                      View AI feedback
                    </summary>

                    <div className="mt-4 border-t border-purple-100 pt-3">
                      <FormattedFeedback text={record.aiFeedback} />
                    </div>
                  </details>
                )}

                {jobMatch &&
                  typeof jobMatch.match_score === "number" && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <h3 className="font-semibold text-slate-900">
                        <Target className="mr-2 inline" size={18} />
                        Job match: {jobMatch.match_score}%
                      </h3>

                      {Array.isArray(jobMatch.matching_skills) && (
                        <p className="mt-2 text-sm text-slate-600">
                          <strong>Matching skills:</strong>{" "}
                          {jobMatch.matching_skills.map(String).join(", ") ||
                            "None detected"}
                        </p>
                      )}

                      {Array.isArray(jobMatch.missing_skills) && (
                        <p className="mt-2 text-sm text-slate-600">
                          <strong>Skills to develop:</strong>{" "}
                          {jobMatch.missing_skills.map(String).join(", ") ||
                            "None detected"}
                        </p>
                      )}
                    </div>
                  )}

                {record.jobDescription && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700">
                      View saved job description
                    </summary>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {record.jobDescription}
                    </p>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
