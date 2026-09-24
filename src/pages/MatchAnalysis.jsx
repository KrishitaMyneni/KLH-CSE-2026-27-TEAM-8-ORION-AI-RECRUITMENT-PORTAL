import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";
import { analyzeCandidateJob } from "../services/aiService";

const previewAnalysis = {
  match_score: 82,
  skill_coverage: 78,
  strong_matches: [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
  ],
  partial_matches: [
    "TypeScript",
    "REST APIs",
    "Git",
  ],
  missing_skills: [
    "Next.js",
    "Docker",
  ],
  learning_suggestions: [
    "Learn Next.js fundamentals",
    "Learn Docker basics",
    "Improve TypeScript skills",
  ],
};

function MatchAnalysis() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [candidateData, jobData] = await Promise.all([
          getCandidates(),
          getJobs(),
        ]);

        const currentCandidate = candidateData.find(
          (item) => item.userId === user?.id
        );

        if (!currentCandidate) {
          setError("Candidate profile not found.");
          return;
        }

        setCandidate(currentCandidate);
        setJobs(jobData);

        if (jobData.length > 0) {
          setSelectedJob(String(jobData[0].id));
        }
      } catch {
        setError("Unable to load AI analysis data.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
      setError("You are not logged in.");
    }
  }, [user]);

  const handleAnalyze = async () => {
    if (!candidate || !selectedJob) {
      return;
    }

    try {
      setAnalyzing(true);
      setError("");

      const result = await analyzeCandidateJob(
        candidate.id,
        Number(selectedJob)
      );

      setAnalysis(result);
    } catch (error) {
      console.error("AI analysis error:", error);
      setError("Unable to analyze this job.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading AI analysis...</h2>
      </DashboardLayout>
    );
  }

  if (error && !candidate) {
    return (
      <DashboardLayout>
        <h2>{error}</h2>
      </DashboardLayout>
    );
  }

  const currentJob = jobs.find(
    (job) => job.id === Number(selectedJob)
  );

  /*
   * Preview is shown until the real AI result arrives.
   */
  const displayAnalysis = analysis || previewAnalysis;

  const matchScore = Math.round(displayAnalysis.match_score);
  const skillCoverage = Math.round(displayAnalysis.skill_coverage);

  return (
    <DashboardLayout>
      <div className="match-analysis-page">

        {/* HEADER */}

        <div className="ai-page-header">
          <div>
            <p className="eyebrow">AI CAREER INSIGHTS</p>

            <h1>Job Match Analysis</h1>

            <p>
              Understand how your skills match the requirements of a role.
            </p>
          </div>

          <div className="ai-job-selector">
            <select
              value={selectedJob}
              onChange={(event) => {
                setSelectedJob(event.target.value);
                setAnalysis(null);
              }}
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.company}
                </option>
              ))}
            </select>

            <button
              className="primary-button"
              onClick={handleAnalyze}
              disabled={analyzing || !selectedJob}
            >
              {analyzing ? "Analyzing..." : "Analyze Match"}
            </button>
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {/* PREVIEW NOTICE */}

        {!analysis && (
          <div className="ai-preview-notice">
            <span>✦</span>

            <div>
              <strong>Preview</strong>
              <p>
                This is a sample match analysis. Your actual results will
                appear after AI analysis.
              </p>
            </div>
          </div>
        )}

        {/* JOB */}

        <div className="ai-job-banner">
          <div className="company-logo">
            {currentJob?.company?.charAt(0) || "O"}
          </div>

          <div>
            <span>ANALYZING ROLE</span>

            <h2>
              {currentJob?.title || "Frontend Developer"}
            </h2>

            <p>
              {currentJob?.company || "ORION Technologies"} ·{" "}
              {currentJob?.location || "Hyderabad"}
            </p>
          </div>
        </div>

        {/* TOP */}

        <div className="ai-top-grid">

          {/* MATCH CIRCLE */}

          <div className="ai-score-card">
            <p className="card-label">YOUR MATCH SCORE</p>

            <div
              className="match-circle"
              style={{
                "--score": `${matchScore * 3.6}deg`,
              }}
            >
              <div>
                <strong>{matchScore}%</strong>
                <span>Match</span>
              </div>
            </div>

            <p className="score-description">
              Based on your profile and the requirements of this role.
            </p>
          </div>

          {/* WHY MATCH */}

          <div className="why-match-card">
            <div className="card-title-row">
              <div>
                <p className="card-label">EXPLAINABILITY</p>

                <h2>Why this match?</h2>
              </div>

              <span className="sparkle-icon">✦</span>
            </div>

            <p>
              Your profile was compared with the skills required for{" "}
              <strong>
                {currentJob?.title || "this role"}
              </strong>
              .
            </p>

            <div className="coverage-row">
              <div>
                <span>Skill Coverage</span>

                <strong>{skillCoverage}%</strong>
              </div>

              <div className="coverage-bar">
                <div
                  style={{
                    width: `${skillCoverage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS */}

        <div className="ai-section-grid">

          {/* STRONG */}

          <div className="ai-skill-card strong">
            <div className="skill-card-header">
              <div className="skill-icon">✓</div>

              <div>
                <h2>Strong Matches</h2>

                <p>
                  Skills that strongly match the role.
                </p>
              </div>
            </div>

            <div className="ai-skill-list">
              {displayAnalysis.strong_matches.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          {/* PARTIAL */}

          <div className="ai-skill-card partial">
            <div className="skill-card-header">
              <div className="skill-icon">~</div>

              <div>
                <h2>Partial Matches</h2>

                <p>
                  Skills where you have some relevant experience.
                </p>
              </div>
            </div>

            <div className="ai-skill-list">
              {displayAnalysis.partial_matches.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          {/* MISSING */}

          <div className="ai-skill-card missing">
            <div className="skill-card-header">
              <div className="skill-icon">!</div>

              <div>
                <h2>Missing Skills</h2>

                <p>
                  Skills you may want to develop.
                </p>
              </div>
            </div>

            <div className="ai-skill-list">
              {displayAnalysis.missing_skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* LEARNING */}

        <div className="learning-section">
          <div className="section-heading">
            <div>
              <p className="card-label">
                SKILL DEVELOPMENT
              </p>

              <h2>Learning Suggestions</h2>

              <p>
                Focus on these areas to strengthen your profile.
              </p>
            </div>
          </div>

          <div className="learning-grid">
            {displayAnalysis.learning_suggestions.map(
              (suggestion, index) => (
                <div
                  className="learning-card"
                  key={suggestion}
                >
                  <div className="learning-number">
                    {index + 1}
                  </div>

                  <div>
                    <h3>
                      {suggestion.replace("Learn ", "")}
                    </h3>

                    <p>{suggestion}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default MatchAnalysis;