import { useNavigate } from "react-router-dom";

function SelectRole() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("orion_role", role);

    if (role === "candidate") {
      navigate("/candidate/dashboard");
    } else {
      navigate("/recruiter/dashboard");
    }
  };

  return (
    <div className="role-page">
      <div className="role-window">
        <div className="role-browser-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="role-container">
          <section className="role-panel recruiter-panel">
            <div className="role-content">
              <div className="role-illustration recruiter-illustration">
                💼
              </div>

              <h1>I'm here for Hiring</h1>
              <p>Build your team with ORION</p>

              <button
                className="role-button"
                onClick={() => handleRoleSelect("recruiter")}
              >
                CONTINUE AS RECRUITER
              </button>

              <span className="role-login-text">
                Manage jobs, applicants & screening
              </span>
            </div>
          </section>

          <section className="role-panel candidate-panel">
            <div className="role-content">
              <div className="role-illustration candidate-illustration">
                👤
              </div>

              <h1>I'm here Seeking Job</h1>
              <p>Find your next opportunity with ORION</p>

              <button
                className="role-button"
                onClick={() => handleRoleSelect("candidate")}
              >
                CONTINUE AS CANDIDATE
              </button>

              <span className="role-login-text">
                Find jobs, apply & grow your skills
              </span>
            </div>
          </section>

          <div className="role-brand">
            <span>◉</span>
            ORION
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectRole;