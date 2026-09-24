import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { getJobById } from "../services/jobService";
import { useAuth } from "../context/AuthContext";
import { getCandidates } from "../services/candidateService";
import { createApplication } from "../services/applicationService";
function JobDetails() {
  const { user } = useAuth();
const [applying, setApplying] = useState(false);
const [applicationMessage, setApplicationMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch {
        setError("Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);
const handleApply = async () => {
  try {
    setApplying(true);
    setApplicationMessage("");

    const candidates = await getCandidates();

    const candidate = candidates.find(
      (item) => item.userId === user?.id
    );

    if (!candidate) {
      setApplicationMessage("Candidate profile not found.");
      return;
    }

    await createApplication({
      candidateId: candidate.id,
      jobId: job.id,
      status: "APPLIED",
    });

    setApplicationMessage("Application submitted successfully!");
  } catch {
    setApplicationMessage("Unable to submit application.");
  } finally {
    setApplying(false);
  }
};
  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading job...</h2>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <h2>{error}</h2>
      </DashboardLayout>
    );
  }

  const skills = job.requiredSkills
    ? job.requiredSkills
        .split(",")
        .map((skill) => skill.trim())
    : [];

  return (
    <DashboardLayout>
      <div className="job-details-page">
        <button
          className="secondary-button"
          onClick={() => navigate("/jobs")}
        >
          ← Back to Jobs
        </button>

        <div className="job-details-card">
          <div className="job-details-header">
            <div className="company-logo">
              {job.company?.charAt(0)}
            </div>

            <div>
              <p className="eyebrow">JOB OPPORTUNITY</p>
              <h1>{job.title}</h1>
              <p className="company-name">{job.company}</p>
            </div>
          </div>

          <div className="job-details-meta">
            <span>⌖ {job.location}</span>
            <span>◷ Full-time</span>
          </div>

          <div className="job-details-section">
            <h2>About the Role</h2>
            <p>{job.description}</p>
          </div>

          <div className="job-details-section">
            <h2>Required Skills</h2>

            <div className="job-skills">
              {skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <button
  className="primary-button"
  onClick={handleApply}
  disabled={applying}
>
  {applying ? "Applying..." : "Apply Now"}
</button>

{applicationMessage && (
  <p className="application-message">
    {applicationMessage}
  </p>
)}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default JobDetails;