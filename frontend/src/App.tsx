import { useEffect, useState } from "react";
import { FileSearch, CheckCircle, XCircle, LoaderCircle } from "lucide-react";
import { getHealth } from "./services/api";

type BackendStatus = "checking" | "online" | "offline";

function App() {
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>("checking");

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus("online"))
      .catch(() => setBackendStatus("offline"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <FileSearch size={24} />
            ResumeIQ
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Log in
            </button>

            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            AI-powered career assistant
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            Make your resume
            <span className="text-indigo-600"> job-ready.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Analyze your resume, discover missing skills, and see how well
            your resume matches any job description.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700">
              Analyze My Resume
            </button>

            <button className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              See How It Works
            </button>
          </div>

          {/* Backend status */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
              {backendStatus === "checking" && (
                <>
                  <LoaderCircle className="animate-spin" size={16} />
                  Backend: checking...
                </>
              )}

              {backendStatus === "online" && (
                <>
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-700">
                    Backend: online
                  </span>
                </>
              )}

              {backendStatus === "offline" && (
                <>
                  <XCircle size={16} className="text-red-600" />
                  <span className="text-red-700">
                    Backend: offline
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            <FeatureCard
              title="AI Resume Analysis"
              description="Understand your resume strengths, weaknesses, skills, and improvement opportunities."
            />

            <FeatureCard
              title="ATS-Style Score"
              description="Get an explainable compatibility score based on skills, keywords, structure, and relevance."
            />

            <FeatureCard
              title="Job Matching"
              description="Compare your resume with a job description and discover missing skills and keyword gaps."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default App;