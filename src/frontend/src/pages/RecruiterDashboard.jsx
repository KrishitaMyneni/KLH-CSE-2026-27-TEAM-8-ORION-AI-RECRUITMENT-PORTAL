import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getJobs } from "../services/jobService";
import { getApplications } from "../services/applicationService";

const dummyJobs = [
  {
    id: 101,
    title: "Frontend Developer",
    company: "ORION Technologies",
    location: "Hyderabad",
    requiredSkills: "React, JavaScript, HTML, CSS",
  },
  {
    id: 102,
    title: "Java Backend Developer",
    company: "ORION Technologies",
    location: "Bangalore",
    requiredSkills: "Java, Spring Boot, PostgreSQL",
  },
  {
    id: 103,
    title: "AI/ML Engineer",
    company: "ORION Technologies",
    location: "Remote",
    requiredSkills: "Python, Machine Learning, FastAPI",
  },
];

const dummyApplications = [
  {
    id: 201,
    candidateId: 1,
    jobId: 101,
    status: "APPLIED",
  },
  {
    id: 202,
    candidateId: 2,
    jobId: 101,
    status: "SHORTLISTED",
  },
  {
    id: 203,
    candidateId: 3,
    jobId: 102,
    status: "INTERVIEW",
  },
  {
    id: 204,
    candidateId: 4,
    jobId: 103,
    status: "APPLIED",
  },
  {
    id: 205,
    candidateId: 5,
    jobId: 102,
    status: "SHORTLISTED",
  },
];

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [jobData, applicationData] = await Promise.all([
          getJobs(),
          getApplications(),
        ]);

        setJobs(jobData?.length ? jobData : dummyJobs);
        setApplications(
          applicationData?.length ? applicationData : dummyApplications
        );
      } catch (error) {
        console.error("Recruiter dashboard error:", error);

        setJobs(dummyJobs);
        setApplications(dummyApplications);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeApplications = applications.filter(
    (application) => application.status !== "REJECTED"
  ).length;

  const shortlistedApplications = applications.filter(
    (application) => application.status === "SHORTLISTED"
  ).length;

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading recruiter dashboard...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="recruiter-dashboard">
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">RECRUITER DASHBOARD</span>
            <h1>Recruiter Overview</h1>
            <p>Manage your recruitment activity from one place.</p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Job Postings</span>
            <strong>{jobs.length}</strong>
          </div>

          <div className="stat-card">
            <span>Total Applications</span>
            <strong>{applications.length}</strong>
          </div>

          <div className="stat-card">
            <span>Active Applications</span>
            <strong>{activeApplications}</strong>
          </div>

          <div className="stat-card">
            <span>Shortlisted</span>
            <strong>{shortlistedApplications}</strong>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recent Job Postings</h2>

          <div className="recruiter-job-list">
            {jobs.slice(0, 3).map((job) => (
              <div className="recruiter-job-card" key={job.id}>
                <div>
                  <h3>{job.title}</h3>
                  <p>
                    {job.company} • {job.location}
                  </p>
                  <small>{job.requiredSkills}</small>
                </div>

                <span className="status-badge status-active">
                  Active
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Recruiter Workspace</h2>
          <p className="profile-muted">
            Manage jobs, review applicants, and run candidate screening from
            the sidebar.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterDashboard;