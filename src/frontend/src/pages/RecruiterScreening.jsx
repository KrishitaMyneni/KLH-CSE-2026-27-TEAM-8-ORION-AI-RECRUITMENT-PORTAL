import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ApplicantTable from "../components/recruiter/ApplicantTable";
import {
  getApplications,
  updateApplicationStatus,
} from "../services/applicationService";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";
import {
  getScreenings,
  createScreening,
} from "../services/screeningService";
import { screenCandidates } from "../services/aiService";
import { useAuth } from "../context/AuthContext";

function RecruiterScreening() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [screenings, setScreenings] = useState([]);

  const [screeningMode, setScreeningMode] = useState("MANUAL");
  const [screeningMethod, setScreeningMethod] = useState("context");

  const [shortlistCount, setShortlistCount] = useState(10);
  const [screeningResults, setScreeningResults] = useState([]);
  const [screeningLoading, setScreeningLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  const [rankedStatus, setRankedStatus] = useState({});
  const [rankedScores, setRankedScores] = useState({});
  const [rankedFeedback, setRankedFeedback] = useState({});
  const [savingRanked, setSavingRanked] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          applicationData,
          candidateData,
          jobData,
          screeningData,
        ] = await Promise.all([
          getApplications(),
          getCandidates(),
          getJobs(),
          getScreenings(),
        ]);

        const recruiterJobs = (jobData || []).filter(
          (job) => String(job.recruiterId) === String(user?.id)
        );

        const recruiterJobIds = recruiterJobs.map((job) => job.id);

        const recruiterApplications = (applicationData || []).filter(
          (application) => recruiterJobIds.includes(application.jobId)
        );

        setApplications(recruiterApplications);
        setCandidates(candidateData || []);
        setJobs(recruiterJobs);
        setScreenings(screeningData || []);
      } catch (error) {
        console.error("Failed to load screening data:", error);
        setMessage("Unable to load screening data.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user]);

  const handleStatusUpdate = (updatedApplication) => {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application
      )
    );

    const key = `${updatedApplication.candidateId}-${updatedApplication.jobId}`;

    setRankedStatus((current) => ({
      ...current,
      [key]: updatedApplication.status,
    }));
  };

  const handleStartAiScreening = async () => {
    if (jobs.length === 0) {
      setMessage("No jobs available.");
      return;
    }

    if (!selectedJobId) {
      setMessage("Please select a job.");
      return;
    }

    if (!shortlistCount || shortlistCount <= 0) {
      setMessage("Please enter a valid number of candidates.");
      return;
    }

    try {
      setScreeningLoading(true);
      setMessage("");
      setScreeningResults([]);

      const result = await screenCandidates(
        screeningMethod,
        selectedJobId,
        shortlistCount
      );

      setScreeningResults(result.results || []);

      setMessage(
        `${result.mode} screening completed. ${
          result.results?.length || 0
        } candidates ranked.`
      );
    } catch (error) {
      console.error("Screening failed:", error);
      setMessage("AI screening failed.");
    } finally {
      setScreeningLoading(false);
    }
  };

  const selectedJobApplications = selectedJobId
    ? applications.filter(
        (application) =>
          Number(application.jobId) === Number(selectedJobId)
      )
    : applications;

  const rankedCandidateIds = new Set(
    screeningResults.map((candidate) => Number(candidate.candidate_id))
  );

  const otherApplicants = selectedJobApplications.filter(
    (application) =>
      !rankedCandidateIds.has(Number(application.candidateId))
  );

  const getCandidate = (candidateId) =>
    candidates.find(
      (candidate) => Number(candidate.id) === Number(candidateId)
    );

  const getApplication = (candidateId, jobId) =>
    applications.find(
      (application) =>
        Number(application.candidateId) === Number(candidateId) &&
        Number(application.jobId) === Number(jobId)
    );

  const getScreening = (candidateId, jobId) =>
    screenings.find(
      (screening) =>
        Number(screening.candidateId) === Number(candidateId) &&
        Number(screening.jobId) === Number(jobId)
    );

  const handleRankedStatusChange = async (
    applicationId,
    candidateId,
    jobId,
    status
  ) => {
    try {
      const key = `${candidateId}-${jobId}`;

      setSavingRanked(key);

      const updatedApplication = await updateApplicationStatus(
        applicationId,
        status
      );

      handleStatusUpdate(updatedApplication);
    } catch (error) {
      console.error("Status update failed:", error);
      setMessage("Unable to update application status.");
    } finally {
      setSavingRanked(null);
    }
  };

  const handleRankedScreeningSave = async (
    candidateId,
    jobId
  ) => {
    const key = `${candidateId}-${jobId}`;

    const score = rankedScores[key];
    const feedback = rankedFeedback[key] || "";

    if (score === undefined || score === "") {
      setMessage("Please enter a screening score.");
      return;
    }

    try {
      setSavingRanked(key);

      const existingScreening = getScreening(
        candidateId,
        jobId
      );

      const screening = await createScreening({
        candidateId,
        jobId,
        status: existingScreening?.status || "SCREENED",
        score: Number(score),
        feedback,
      });

      setScreenings((current) => {
        const filtered = current.filter(
          (item) =>
            !(
              Number(item.candidateId) === Number(candidateId) &&
              Number(item.jobId) === Number(jobId)
            )
        );

        return [...filtered, screening];
      });

      setMessage("Screening information saved.");
    } catch (error) {
      console.error("Screening save failed:", error);
      setMessage("Unable to save screening information.");
    } finally {
      setSavingRanked(null);
    }
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
            <span className="dashboard-eyebrow">
              RECRUITER
            </span>

            <h1>Candidate Screening</h1>

            <p>
              Screen and evaluate candidates for your job postings.
            </p>
          </div>
        </section>

        {message && (
          <p className="application-message">
            {message}
          </p>
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

              <span>
                Use AI to analyze and rank candidates.
              </span>
            </button>

            <button
              type="button"
              className={`screening-option ${
                screeningMode === "MANUAL" ? "active" : ""
              }`}
              onClick={() => setScreeningMode("MANUAL")}
            >
              <strong>Manual Screening</strong>

              <span>
                Review candidates manually.
              </span>
            </button>

            <button
              type="button"
              className={`screening-option ${
                screeningMode === "AI_MANUAL" ? "active" : ""
              }`}
              onClick={() => setScreeningMode("AI_MANUAL")}
            >
              <strong>AI + Manual</strong>

              <span>
                Use AI insights with manual evaluation.
              </span>
            </button>

          </div>
        </section>

        {(screeningMode === "AI" ||
          screeningMode === "AI_MANUAL") && (
          <section className="dashboard-section screening-settings">

            <h2>AI Screening Settings</h2>

            <select
              value={selectedJobId}
              onChange={(event) =>
                setSelectedJobId(
                  event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                )
              }
            >
              <option value="">
                Select a job
              </option>

              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={screeningMethod}
              onChange={(event) =>
                setScreeningMethod(event.target.value)
              }
            >
              <option value="context">
                Context-Based AI
              </option>

              <option value="keyword">
                Keyword-Based
              </option>
            </select>

            <input
              type="number"
              min="1"
              value={shortlistCount}
              onChange={(event) =>
                setShortlistCount(
                  Number(event.target.value)
                )
              }
              placeholder="Number of candidates"
            />

            <button
              type="button"
              className="primary-button"
              onClick={handleStartAiScreening}
              disabled={screeningLoading}
            >
              {screeningLoading
                ? "Screening..."
                : "Start AI Screening"}
            </button>

          </section>
        )}

        {screeningMode === "MANUAL" && (
          <section className="dashboard-section screening-settings">

            <h2>Select Job</h2>

            <select
              value={selectedJobId}
              onChange={(event) =>
                setSelectedJobId(
                  event.target.value === ""
                    ? ""
                    : Number(event.target.value)
                )
              }
            >
              <option value="">
                Select a job
              </option>

              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title}
                </option>
              ))}
            </select>

          </section>
        )}

        {screeningResults.length > 0 && (
          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h2>AI Screening Results</h2>

                <p>
                  Top {screeningResults.length} candidates selected
                  by AI.
                </p>
              </div>
            </div>

            <div className="orion-screening-results">

              {screeningResults.map(
                (candidate, index) => {

                  const score =
                    screeningMethod === "context"
                      ? candidate.match_score
                      : candidate.keyword_score;

                  const application = getApplication(
                    candidate.candidate_id,
                    selectedJobId
                  );

                  const screening = getScreening(
                    candidate.candidate_id,
                    selectedJobId
                  );

                  const key =
                    `${candidate.candidate_id}-${selectedJobId}`;

                  const currentStatus =
                    rankedStatus[key] ??
                    application?.status ??
                    "APPLIED";

                  return (
                    <article
                      className="orion-screening-card"
                      key={candidate.candidate_id}
                    >

                      <div className="orion-screening-main">

                        <div className="orion-candidate-heading">

                          <div className="orion-rank">
                            #{index + 1}
                          </div>

                          <div className="orion-candidate-details">
                            <h3>
                              {candidate.candidate_name}
                            </h3>

                            <span>
                              Candidate ID:{" "}
                              {candidate.candidate_id}
                            </span>
                          </div>

                        </div>

                        <div className="orion-score-section">

                          <div className="orion-score-label">
                            AI Match Score
                          </div>

                          <div className="orion-score-bar">
                            <div
                              style={{
                                width: `${score}%`,
                              }}
                            />
                          </div>

                        </div>

                        <div className="orion-ai-score">
                          <strong>
                            {score}%
                          </strong>

                          <span>
                            {screeningMethod === "context"
                              ? "MATCH SCORE"
                              : "KEYWORD SCORE"}
                          </span>
                        </div>

                        {screeningMethod === "keyword" && (
                          <div className="orion-keywords">

                            <div className="orion-keyword-group">

                              <span className="orion-keyword-title matched">
                                Matched Skills
                              </span>

                              <div className="orion-keyword-list">
                                {candidate.matched_keywords?.map(
                                  (keyword) => (
                                    <span key={keyword}>
                                      {keyword}
                                    </span>
                                  )
                                )}
                              </div>

                            </div>

                            <div className="orion-keyword-group">

                              <span className="orion-keyword-title missing">
                                Missing Skills
                              </span>

                              <div className="orion-keyword-list">
                                {candidate.missing_keywords?.map(
                                  (keyword) => (
                                    <span key={keyword}>
                                      {keyword}
                                    </span>
                                  )
                                )}
                              </div>

                            </div>

                          </div>
                        )}

                      </div>

                      <div className="orion-screening-editor">

                        <div className="orion-editor-title">
                          Recruiter Evaluation
                        </div>

                        <div className="orion-editor-field">

                          <label>
                            Status
                          </label>

                          <select
                            value={currentStatus}
                            disabled={
                              savingRanked === key ||
                              !application
                            }
                            onChange={(event) =>
                              handleRankedStatusChange(
                                application.id,
                                candidate.candidate_id,
                                selectedJobId,
                                event.target.value
                              )
                            }
                          >
                            <option value="APPLIED">
                              Applied
                            </option>

                            <option value="SHORTLISTED">
                              Shortlisted
                            </option>

                            <option value="INTERVIEW">
                              Interview
                            </option>

                            <option value="REJECTED">
                              Rejected
                            </option>
                          </select>

                        </div>

                        <div className="orion-editor-field">

                          <label>
                            Screening Score
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              rankedScores[key] ??
                              screening?.score ??
                              ""
                            }
                            onChange={(event) =>
                              setRankedScores((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            placeholder="Score /100"
                          />

                        </div>

                        <div className="orion-editor-field">

                          <label>
                            Feedback
                          </label>

                          <textarea
                            value={
                              rankedFeedback[key] ??
                              screening?.feedback ??
                              ""
                            }
                            onChange={(event) =>
                              setRankedFeedback((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            placeholder="Add recruiter feedback..."
                            rows="3"
                          />

                        </div>

                        <button
                          type="button"
                          className="orion-save-button"
                          disabled={
                            savingRanked === key
                          }
                          onClick={() =>
                            handleRankedScreeningSave(
                              candidate.candidate_id,
                              selectedJobId
                            )
                          }
                        >
                          {savingRanked === key
                            ? "Saving..."
                            : "Save Evaluation"}
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </section>
        )}

        {screeningResults.length > 0 &&
          otherApplicants.length > 0 && (
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <h2>Other Applicants</h2>

                  <p>
                    Applicants outside the selected Top-N results.
                  </p>
                </div>
              </div>

              <div className="screening-other-applicants">

                {otherApplicants.map((application) => {

                  const candidate = getCandidate(
                    application.candidateId
                  );

                  return (
                    <div
                      className="screening-other-card"
                      key={application.id}
                    >

                      <div className="screening-other-info">

                        <div className="applicant-avatar">
                          {candidate?.name?.charAt(0) || "?"}
                        </div>

                        <div>
                          <strong>
                            {candidate?.name ||
                              "Unknown Candidate"}
                          </strong>

                          <span>
                            Candidate ID:{" "}
                            {application.candidateId}
                          </span>
                        </div>

                      </div>

                      <span className="not-shortlisted">
                        Not shortlisted by AI
                      </span>

                    </div>
                  );
                })}

              </div>

            </section>
          )}

        {screeningResults.length === 0 && (
          <section className="dashboard-section">

            <h2>Applicants</h2>

            <ApplicantTable
              applications={selectedJobApplications}
              candidates={candidates}
              jobs={jobs}
              screeningMode={screeningMode}
              onStatusUpdate={handleStatusUpdate}
            />

          </section>
        )}

      </div>
    </DashboardLayout>
  );
}

export default RecruiterScreening;