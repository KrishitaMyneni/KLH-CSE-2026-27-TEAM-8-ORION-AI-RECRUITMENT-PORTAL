import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getApplications } from "../services/applicationService";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";
import { useAuth } from "../context/AuthContext";

function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const [applicationData, candidateData, jobData] =
          await Promise.all([
            getApplications(),
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

        const userApplications = applicationData.filter(
          (application) =>
            application.candidateId === currentCandidate.id
        );

        setCandidate(currentCandidate);
        setApplications(userApplications);
        setJobs(jobData);
      } catch {
        setError("Unable to load applications.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadApplications();
    } else {
      setLoading(false);
      setError("You are not logged in.");
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading applications...</h2>
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

  return (
    <DashboardLayout>
      <div className="applications-page">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">APPLICATIONS</p>
            <h1>My Applications</h1>
            <p className="dashboard-subtitle">
              Track the jobs you have applied for.
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="profile-card">
            <h2>No applications yet</h2>
            <p className="profile-muted">
              Apply to a job to see it here.
            </p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => {
              const job = jobs.find(
                (item) => item.id === application.jobId
              );

              return (
                <div
                  className="application-card"
                  key={application.id}
                >
                  <div className="application-info">
                    <div className="company-logo">
                      {job?.company?.charAt(0) || "?"}
                    </div>

                    <div>
                      <h2>
                        {job?.title || "Job unavailable"}
                      </h2>
                      <p>
                        {job?.company || "Unknown company"}
                      </p>
                      <span>
                        {job?.location || "Location unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="application-status">
                    {application.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Applications;