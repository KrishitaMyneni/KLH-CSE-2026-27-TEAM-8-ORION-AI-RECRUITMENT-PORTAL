
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import JobCard from "../components/jobs/JobCard";
import ApplicationTracker from "../components/candidate/ApplicationTracker";
import { useAuth } from "../context/AuthContext";
import { getCandidates } from "../services/candidateService";
import { getJobs } from "../services/jobService";
import { getApplications } from "../services/applicationService";
import { analyzeCandidateJob } from "../services/aiService";
import MatchScore from "../components/candidate/MatchScore";
import SkillComparison from "../components/candidate/SkillComparison";
function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [candidateData, jobData, applicationData] =
          await Promise.all([
            getCandidates(),
            getJobs(),
            getApplications(),
          ]);

        const currentCandidate = candidateData.find(
          (item) => item.userId === user?.id
        );

        if (!currentCandidate) {
          setLoading(false);
          return;
        }

        setCandidate(currentCandidate);

        const userApplications = applicationData.filter(
          (application) =>
            application.candidateId === currentCandidate.id
        );

        setApplications(userApplications);
        setJobs(jobData);

        const matches = await Promise.all(
          jobData.map(async (job) => {
            try {
              const analysis = await analyzeCandidateJob(
                currentCandidate.id,
                job.id
              );

              return {
                job,
                match: Math.round(analysis.match_score),
                analysis,
              };
            } catch {
              return {
                job,
                match: 0,
              };
            }
          })
        );

        setJobMatches(
          matches
            .filter((item) => item.match > 0)
            .sort((a, b) => b.match - a.match)
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading dashboard...</h2>
      </DashboardLayout>
    );
  }

  const profileFields = [
    candidate?.name,
    candidate?.email,
    candidate?.phone,
    candidate?.skills,
    candidate?.resumeUrl,
  ];

  const completedFields = profileFields.filter(
    (field) => field && field.trim()
  ).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const highestMatch =
    jobMatches.length > 0 ? jobMatches[0].match : 0;

  const trackedApplications = applications.map((application) => {
    const job = jobs.find((item) => item.id === application.jobId);

    return {
      ...application,
      jobTitle: job?.title || `Application #${application.id}`,
    };
  });

  return (
    <DashboardLayout>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">CANDIDATE DASHBOARD</p>

          <h1>
            Hi, {user?.name || candidate?.name || "there"} 👋
          </h1>

          <p className="dashboard-subtitle">
            Find opportunities that match your skills and career goals.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/candidate/profile")}
        >
          Complete Profile
        </button>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✦</div>
          <div>
            <span>Best AI Match</span>
            <strong>{highestMatch}%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◈</div>
          <div>
            <span>Profile Completion</span>
            <strong>{profileCompletion}%</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">▣</div>
          <div>
            <span>Applications</span>
            <strong>{applications.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⌕</div>
          <div>
            <span>Jobs Available</span>
            <strong>{jobs.length}</strong>
          </div>
        </div>
      </section>

      {/* Recommended Jobs */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recommended for you</h2>

            <p>
              AI-powered opportunities based on your profile.
            </p>
          </div>

          <a href="/jobs">View all →</a>
        </div>

        {jobMatches.length === 0 ? (
          <div className="profile-card">
            <h2>No recommendations yet</h2>

            <p className="profile-muted">
              Add more skills to your profile to get AI-powered
              recommendations.
            </p>
          </div>
        ) : (
          <div className="job-grid">
            {jobMatches.map(({ job, match }) => (
              <div className="recommended-job" key={job.id}>
                <JobCard
                  id={job.id}
                  company={job.company}
                  title={job.title}
                  location={job.location}
                  type="Full-time"
                  salary="Salary not specified"
                  match={match}
                  skills={
                    job.requiredSkills
                      ? job.requiredSkills
                          .split(",")
                          .map((skill) => skill.trim())
                      : []
                  }
                />

                <MatchScore score={match} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI Skill Comparison */}

      {jobMatches.length > 0 && (
        <section className="dashboard-section">
          <SkillComparison
            matchedSkills={[
              ...(jobMatches[0].analysis?.strong_matches || []),
              ...(jobMatches[0].analysis?.partial_matches || []),
            ]}
            missingSkills={
              jobMatches[0].analysis?.missing_skills || []
            }
          />
        </section>
      )}

      {/* Application Tracker */}

      <section className="dashboard-section">
        <ApplicationTracker
          applications={trackedApplications}
        />
      </section>
    </DashboardLayout>
  );
}

export default CandidateDashboard;