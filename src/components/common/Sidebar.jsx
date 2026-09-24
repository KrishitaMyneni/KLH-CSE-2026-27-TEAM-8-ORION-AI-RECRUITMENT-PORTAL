import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const role = localStorage.getItem("orion_role") || "candidate";
  const isRecruiter = role === "recruiter";

  const userName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    (isRecruiter ? "Recruiter" : "Candidate");

  const initial = userName.charAt(0).toUpperCase();

  const candidateLinks = [
    { to: "/candidate/dashboard", label: "⌂ Home" },
    { to: "/jobs", label: "⌕ Find Jobs" },
    { to: "/applications", label: "☑ My Applications" },
    { to: "/match-analysis", label: "✦ Skill Growth" },
    { to: "/candidate/profile", label: "▣ Resume" },
    { to: "/notifications", label: "♧ Notifications" },
  ];

  const recruiterLinks = [
    { to: "/recruiter/dashboard", label: "⌂ Dashboard" },
    { to: "/recruiter/jobs", label: "▣ My Jobs" },
    { to: "/recruiter/applicants", label: "♙ Applicants" },
    { to: "/recruiter/screening", label: "✦ Screening" },
    { to: "/notifications", label: "♧ Notifications" },
  ];

  const links = isRecruiter ? recruiterLinks : candidateLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>◉</span> ORION
      </div>

      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <Link to={link.to} key={`${link.to}-${index}`}>
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        to={isRecruiter ? "/recruiter/dashboard" : "/candidate/profile"}
        className="sidebar-profile"
      >
        <div className="profile-avatar">{initial}</div>

        <div>
          <strong>{userName}</strong>
          <small>{isRecruiter ? "Recruiter" : "Candidate"}</small>
        </div>
      </Link>
    </aside>
  );
}

export default Sidebar;