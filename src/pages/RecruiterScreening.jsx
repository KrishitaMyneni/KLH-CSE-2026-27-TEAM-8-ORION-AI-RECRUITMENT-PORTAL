import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ApplicantTable from "../components/recruiter/ApplicantTable";
import { getApplications } from "../services/applicationService";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";

function RecruiterScreening() {
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [screeningMode, setScreeningMode] = useState("MANUAL");
  const [shortlistCount, setShortlistCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [applicationData, candidateData, jobData] =
          await Promise.all([
            getApplications(),
            getCandidates(),
            getJobs(),
          ]);

        setApplications(applicationData);
        setCandidates(candidateData);
        setJobs(jobData);
      } catch (error) {
        console.error("Failed to load screening data:", error);
        setMessage("Unable to load screening data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusUpdate = (updatedApplication) => {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application
      )
    );
  };

  const handleStartAiScreening = () => {
    setMessage(
      `AI screening started for the top ${shortlistCount} candidates.`
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading screening...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="recruiter-dashboard">
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">RECRUITER</span>
            <h1>Candidate Screening</h1>
            <p>Screen and evaluate candidates for your job postings.</p>
          </div>
        </section>

        {message && (
          <p className="application-message">{message}</p>
        )}

        <section className="dashboard-section">
          <h2>Screening Method</h2>

          <div className="screening-options">
            <button
              type="button"
              className={`screening-option ${
                screeningMode === "AI" ? "active" : ""
              }`}
              onClick={() => setScreeningMode("AI")}
            >
              <strong>AI Screening</strong>
              <span>Use AI to analyze and rank candidates.</span>
            </button>

            <button
              type="button"
              className={`screening-option ${
                screeningMode === "MANUAL" ? "active" : ""
              }`}
              onClick={() => setScreeningMode("MANUAL")}
            >
              <strong>Manual Screening</strong>
              <span>Review candidates manually.</span>
            </button>

            <button
              type="button"
              className={`screening-option ${
                screeningMode === "AI_MANUAL" ? "active" : ""
              }`}
              onClick={() => setScreeningMode("AI_MANUAL")}
            >
              <strong>AI + Manual</strong>
              <span>Use AI insights with manual evaluation.</span>
            </button>
          </div>
        </section>

        {(screeningMode === "AI" ||
          screeningMode === "AI_MANUAL") && (
          <section className="dashboard-section screening-settings">
            <h2>AI Screening Settings</h2>

            <select
              value={shortlistCount}
              onChange={(event) =>
                setShortlistCount(Number(event.target.value))
              }
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>

            <button
              type="button"
              className="primary-button"
              onClick={handleStartAiScreening}
            >
              Start AI Screening
            </button>
          </section>
        )}

        <section className="dashboard-section">
          <h2>Applicants</h2>

          <ApplicantTable
            applications={applications}
            candidates={candidates}
            jobs={jobs}
            screeningMode={screeningMode}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterScreening;