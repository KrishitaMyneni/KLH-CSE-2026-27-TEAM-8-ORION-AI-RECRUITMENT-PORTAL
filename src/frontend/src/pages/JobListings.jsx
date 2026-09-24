import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getJobs } from "../services/jobService";
import JobCard from "../components/jobs/JobCard";

function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch {
        setError("Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading jobs...</h2>
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
      <div className="jobs-page">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">JOB DISCOVERY</p>
            <h1>Find your next opportunity</h1>
            <p className="dashboard-subtitle">
              Explore jobs and discover opportunities that match your skills.
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="profile-card">
            <h2>No jobs available</h2>
            <p className="profile-muted">
              Check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                company={job.company}
                title={job.title}
                location={job.location}
                type="Full-time"
                salary="Salary not specified"
                match={0}
                skills={
                  job.requiredSkills
                    ? job.requiredSkills
                        .split(",")
                        .map((skill) => skill.trim())
                    : []
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default JobListings;