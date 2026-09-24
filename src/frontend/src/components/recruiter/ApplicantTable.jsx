import { useEffect, useState } from "react";
import { updateApplicationStatus } from "../../services/applicationService";
import {
  getScreenings,
  createScreening,
} from "../../services/screeningService";
import { analyzeCandidateJob } from "../../services/aiService";

function ApplicantTable({
  applications,
  candidates,
  jobs,
  screeningMode,
  onStatusUpdate,
}) {
  const [updating, setUpdating] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [screeningLoading, setScreeningLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [saving, setSaving] = useState(null);
  const [aiData, setAiData] = useState({});
  const [aiLoading, setAiLoading] = useState({});

  const getCandidate = (candidateId) =>
    candidates.find((candidate) => candidate.id === candidateId);

  const getJob = (jobId) =>
    jobs.find((job) => job.id === jobId);

  const getScreening = (candidateId, jobId) =>
    screenings.find(
      (screening) =>
        screening.candidateId === candidateId &&
        screening.jobId === jobId
    );

  useEffect(() => {
    const loadScreenings = async () => {
      try {
        const data = await getScreenings();
        setScreenings(data);
      } catch (error) {
        console.error("Failed to load screenings:", error);
      } finally {
        setScreeningLoading(false);
      }
    };

    loadScreenings();
  }, []);

  const handleStatusChange = async (applicationId, status) => {
    try {
      setUpdating(applicationId);

      const updated = await updateApplicationStatus(
        applicationId,
        status
      );

      onStatusUpdate(updated);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleAiSummary = async (candidateId, jobId) => {
    const key = `${candidateId}-${jobId}`;

    try {
      setAiLoading((current) => ({
        ...current,
        [key]: true,
      }));

      const data = await analyzeCandidateJob(candidateId, jobId);

      setAiData((current) => ({
        ...current,
        [key]: data,
      }));
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setAiLoading((current) => ({
        ...current,
        [key]: false,
      }));
    }
  };

  const handleSaveScreening = async (candidateId, jobId) => {
    const key = `${candidateId}-${jobId}`;
    const score = scores[key];

    if (score === undefined || score === "") {
      return;
    }

    try {
      setSaving(key);

      const screening = await createScreening({
        candidateId,
        jobId,
        status: "SCREENED",
        score: Number(score),
        feedback: feedbacks[key] || "",
      });

      setScreenings((current) => [...current, screening]);
    } catch (error) {
      console.error("Screening failed:", error);
    } finally {
      setSaving(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="profile-card">
        <h2>No applicants yet</h2>
        <p className="profile-muted">
          Applications will appear here when candidates apply.
        </p>
      </div>
    );
  }

  return (
    <div className="applicant-table-wrapper">
      <table className="applicant-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Job</th>
            <th>Location</th>
            <th>Status</th>
            <th>Screening</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((application) => {
            const candidate = getCandidate(application.candidateId);
            const job = getJob(application.jobId);

            const screening = getScreening(
              application.candidateId,
              application.jobId
            );

            const key = `${application.candidateId}-${application.jobId}`;
            const ai = aiData[key];

            return (
              <tr key={application.id}>
                <td>
                  <div className="applicant-name">
                    <div className="applicant-avatar">
                      {candidate?.name?.charAt(0) || "?"}
                    </div>

                    <div>
                      <strong>
                        {candidate?.name || "Unknown Candidate"}
                      </strong>
                      <small>
                        {candidate?.email || "No email"}
                      </small>

                      {candidate?.resumeUrl && (
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                <td>{job?.title || "Unknown Job"}</td>

                <td>{job?.location || "Not specified"}</td>

                <td>
                  <select
                    className={`status-select status-${application.status?.toLowerCase()}`}
                    value={application.status || "APPLIED"}
                    disabled={updating === application.id}
                    onChange={(event) =>
                      handleStatusChange(
                        application.id,
                        event.target.value
                      )
                    }
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>

                <td>
                  {screeningLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <div className="manual-screening">
                      {(screeningMode === "MANUAL" ||
                        screeningMode === "AI_MANUAL") && (
                        <>
                          <button
                            className="secondary-button"
                            onClick={() =>
                              handleAiSummary(
                                application.candidateId,
                                application.jobId
                              )
                            }
                          >
                            {aiLoading[key]
                              ? "Analyzing..."
                              : "AI Summary"}
                          </button>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Score /100"
                            value={scores[key] ?? ""}
                            onChange={(event) =>
                              setScores((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                          />

                          <input
                            type="text"
                            placeholder="Feedback"
                            value={feedbacks[key] ?? ""}
                            onChange={(event) =>
                              setFeedbacks((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                          />

                          {!screening && (
                            <button
                              className="primary-button"
                              disabled={saving === key}
                              onClick={() =>
                                handleSaveScreening(
                                  application.candidateId,
                                  application.jobId
                                )
                              }
                            >
                              {saving === key ? "Saving..." : "Save"}
                            </button>
                          )}

                          {ai && (
                            <div className="ai-screening-summary">
                              <strong>
                                AI Match: {ai.match_score ?? "—"}
                              </strong>

                              <small>
                                Skills covered:{" "}
                                {ai.skill_coverage ?? "—"}
                              </small>

                              {ai.missing_skills?.length > 0 && (
                                <small>
                                  Missing:{" "}
                                  {ai.missing_skills.join(", ")}
                                </small>
                              )}
                            </div>
                          )}

                          {screening && (
                            <div className="screening-result">
                              Saved Score: {screening.score}/100
                              <small>
                                {screening.feedback || "No feedback"}
                              </small>
                            </div>
                          )}
                        </>
                      )}

                      {screeningMode === "AI" && (
                        <span>
                          AI screening will rank this applicant.
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicantTable;