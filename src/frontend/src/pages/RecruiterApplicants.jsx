import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ApplicantTable from "../components/recruiter/ApplicantTable";
import { getApplications } from "../services/applicationService";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";
import { useAuth } from "../context/AuthContext";

function RecruiterApplicants() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
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

        const recruiterJobs = (jobData || []).filter(
          (job) => String(job.recruiterId) === String(user?.id)
        );

        setJobs(recruiterJobs);
        setCandidates(candidateData || []);

        const recruiterJobIds = recruiterJobs.map((job) => job.id);

        setApplications(
          (applicationData || []).filter((application) =>
            recruiterJobIds.includes(application.jobId)
          )
        );
      } catch (error) {
        console.error("Failed to load applicants:", error);
        setMessage("Unable to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadApplicants();
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
  };

  const selectedJobApplications = selectedJobId
    ? applications.filter(
        (application) =>
          Number(application.jobId) === Number(selectedJobId)
      )
    : applications;

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
            <option value="">Select a job</option>

            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </section>

        <section className="dashboard-section">
          <h2>
            {selectedJobId
              ? "Applicants for Selected Job"
              : "Candidate Applications"}
          </h2>

          <ApplicantTable
            applications={selectedJobApplications}
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