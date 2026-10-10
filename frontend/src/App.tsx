
import Dashboard from "./pages/Dashboard";
import ResumeHistory from "./pages/ResumeHistory";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            ResumeIQ
          </Link>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          Make your resume job-ready.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Analyze your resume, discover missing skills, and match your profile
          with job descriptions using AI.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-800"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume-history" element={<ResumeHistory />} />
      </Routes>
    </BrowserRouter>
  );
}
