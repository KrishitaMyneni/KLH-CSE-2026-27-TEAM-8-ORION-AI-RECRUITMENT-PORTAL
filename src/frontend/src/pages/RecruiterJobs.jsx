import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getJobs } from "../services/jobService";
import { createJob, deleteJob } from "../services/recruiterService";
import { useAuth } from "../context/AuthContext";

function RecruiterJobs() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requiredSkills: "",
  });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();

        const recruiterJobs = (data || []).filter(
          (job) => String(job.recruiterId) === String(user?.id)
        );

        setJobs(recruiterJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadJobs();
    }
  }, [user]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateJob = async (event) => {
    event.preventDefault();

    try {
      const newJob = await createJob({
        recruiterId: user?.id,
        title: form.title,
        company: form.company,
        location: form.location,
        description: form.description,
        requiredSkills: form.requiredSkills,
      });

      setJobs((currentJobs) => [...currentJobs, newJob]);

      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        requiredSkills: "",
      });

      setShowForm(false);
      setMessage("Job posted successfully!");
    } catch (error) {
      console.error("Job creation failed:", error);

      setMessage("Unable to create job.");
    }
  };

  const handleDelete = async (jobId) => {
    try {
      await deleteJob(jobId);

      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== jobId)
      );

      setMessage("Job deleted successfully.");
    } catch (error) {
      setMessage("Unable to delete job.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading jobs...</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="recruiter-dashboard">
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">RECRUITER</span>
            <h1>My Jobs</h1>
            <p>Create and manage your job postings.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Post a Job"}
          </button>
        </section>

        {message && (
          <p className="application-message">{message}</p>
        )}

        {showForm && (
          <form
            className="profile-card recruiter-form"
            onSubmit={handleCreateJob}
          >
            <h2>Post a New Job</h2>

            <div className="form-grid">
              <input
                name="title"
                placeholder="Job Title"
                value={form.title}
                onChange={handleChange}
                required
              />

              <input
                name="company"
                placeholder="Company"
                value={form.company}
                onChange={handleChange}
                required
              />

              <input
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
                required
              />

              <input
                name="requiredSkills"
                placeholder="Required Skills"
                value={form.requiredSkills}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="description"
              placeholder="Job Description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              required
            />

            <button type="submit" className="primary-button">
              Publish Job
            </button>
          </form>
        )}

        <section className="dashboard-section">
          <h2>Your Job Postings</h2>

          <div className="recruiter-job-list">
            {jobs.map((job) => (
              <div className="recruiter-job-card" key={job.id}>
                <div>
                  <h3>{job.title}</h3>

                  <p>
                    {job.company} • {job.location}
                  </p>

                  <small>
                    Skills: {job.requiredSkills}
                  </small>

                  {job.description && (
                    <p className="profile-muted">
                      {job.description}
                    </p>
                  )}
                </div>

                <button
                  className="secondary-button"
                  onClick={() => handleDelete(job.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default RecruiterJobs;