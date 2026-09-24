import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getJobs } from "../services/jobService";
import { createJob, deleteJob } from "../services/recruiterService";
import { useAuth } from "../context/AuthContext";

const dummyJobs = [
  {
    id: 101,
    title: "Frontend Developer",
    company: "ORION Technologies",
    location: "Hyderabad",
    description:
      "Build modern and responsive web applications using React.",
    requiredSkills: "React, JavaScript, HTML, CSS",
  },
  {
    id: 102,
    title: "Java Backend Developer",
    company: "ORION Technologies",
    location: "Bangalore",
    description:
      "Develop scalable backend services and REST APIs using Spring Boot.",
    requiredSkills: "Java, Spring Boot, PostgreSQL",
  },
  {
    id: 103,
    title: "AI/ML Engineer",
    company: "ORION Technologies",
    location: "Remote",
    description:
      "Build machine learning pipelines and AI-powered recruitment systems.",
    requiredSkills: "Python, Machine Learning, FastAPI",
  },
];

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
        setJobs(data?.length ? data : dummyJobs);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs(dummyJobs);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

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

      const dummyJob = {
        id: Date.now(),
        ...form,
      };

      setJobs((currentJobs) => [...currentJobs, dummyJob]);

      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        requiredSkills: "",
      });

      setShowForm(false);
      setMessage("Demo job added.");
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
      // Allow dummy jobs to be removed from the UI.
      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== jobId)
      );

      setMessage("Job removed from demo view.");
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