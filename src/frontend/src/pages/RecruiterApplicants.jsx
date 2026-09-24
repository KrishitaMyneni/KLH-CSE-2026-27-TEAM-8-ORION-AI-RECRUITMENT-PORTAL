import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ApplicantTable from "../components/recruiter/ApplicantTable";
import { getApplications } from "../services/applicationService";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";

function RecruiterApplicants() {
  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        const [applicationData, candidateData, jobData] = await Promise.all([
          getApplications(),
          getCandidates(),
          getJobs(),
        ]);

        setApplications(applicationData);
        setCandidates(candidateData);
        setJobs(jobData);
      } catch (error) {
        console.error("Failed to load applicants:", error);
        setMessage("Unable to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
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

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading applicants...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="recruiter-dashboard">
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">RECRUITER</span>
            <h1>Applicants</h1>
            <p>Review and manage candidate applications.</p>
          </div>
        </section>

        {message && (
          <p className="application-message">{message}</p>
        )}

        <section className="dashboard-section">
          <h2>Candidate Applications</h2>

          <ApplicantTable
            applications={applications}
            candidates={candidates}
            jobs={jobs}
            screeningMode=""
            onStatusUpdate={handleStatusUpdate}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterApplicants;