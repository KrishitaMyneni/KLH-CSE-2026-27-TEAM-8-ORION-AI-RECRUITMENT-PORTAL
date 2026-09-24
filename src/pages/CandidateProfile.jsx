
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getCandidates,
  updateCandidate,
} from "../services/candidateService";
import ResumeUpload from "../components/candidate/ResumeUpload";

function CandidateProfile() {
  const { user } = useAuth();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const candidates = await getCandidates();

        const currentCandidate = candidates.find(
          (item) => item.userId === user?.id
        );

        if (!currentCandidate) {
          setError("Candidate profile not found.");
          return;
        }

        setCandidate(currentCandidate);
      } catch {
        setError("Unable to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadCandidate();
    } else {
      setLoading(false);
      setError("You are not logged in.");
    }
  }, [user]);

  const handleChange = (event) => {
    setCandidate({
      ...candidate,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const updatedCandidate = await updateCandidate(
        candidate.id,
        candidate
      );

      setCandidate(updatedCandidate);
      setEditing(false);
    } catch {
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading profile...</h2>
      </DashboardLayout>
    );
  }

  if (error && !candidate) {
    return (
      <DashboardLayout>
        <h2>{error}</h2>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <p className="eyebrow">CANDIDATE PROFILE</p>

            <h1>{candidate.name}</h1>

            <p className="dashboard-subtitle">
              {candidate.email}
            </p>
          </div>

          {!editing ? (
            <button
              className="primary-button"
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="profile-actions">
              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                className="secondary-button"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="profile-grid">

          {/* Personal Information */}

          <div className="profile-card">
            <h2>Personal Information</h2>

            {editing ? (
              <>
                <div className="profile-field editing-field">
                  <label>Name</label>

                  <input
                    name="name"
                    value={candidate.name || ""}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="profile-field editing-field">
                  <label>Email</label>

                  <input
                    name="email"
                    value={candidate.email || ""}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="profile-field editing-field">
                  <label>Phone</label>

                  <input
                    name="phone"
                    value={candidate.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="profile-field">
                  <span>Name</span>

                  <strong>
                    {candidate.name || "Not provided"}
                  </strong>
                </div>

                <div className="profile-field">
                  <span>Email</span>

                  <strong>
                    {candidate.email || "Not provided"}
                  </strong>
                </div>

                <div className="profile-field">
                  <span>Phone</span>

                  <strong>
                    {candidate.phone || "Not provided"}
                  </strong>
                </div>
              </>
            )}
          </div>

          {/* Skills */}

          <div className="profile-card">
            <h2>Skills</h2>

            {editing ? (
              <div className="editing-field">
                <label>Your Skills</label>

                <input
                  name="skills"
                  value={candidate.skills || ""}
                  onChange={handleChange}
                  placeholder="Java, React, Spring Boot"
                />
              </div>
            ) : (
              <div className="profile-skills">
                {candidate.skills ? (
                  candidate.skills.split(",").map((skill) => (
                    <span key={skill.trim()}>
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <p>No skills added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Resume */}

          <div className="profile-card">
            <h2>Resume</h2>

            {editing ? (
              <ResumeUpload
                onUpload={(file) => {
                  if (file) {
                    setCandidate({
                      ...candidate,
                      resumeUrl: file.name,
                    });
                  }
                }}
              />
            ) : candidate.resumeUrl ? (
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                View Resume
              </a>
            ) : (
              <p className="profile-muted">
                No resume uploaded yet.
              </p>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default CandidateProfile;