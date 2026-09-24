import { useNavigate } from "react-router-dom";

function JobCard({
  id,
  company,
  title,
  location,
  type,
  salary,
  match,
  skills,
}) {
  const navigate = useNavigate();

  return (
    <div className="job-card">
      <div className="job-card-top">
        <div className="company-logo">
          {company?.charAt(0)}
        </div>

        {match > 0 && (
          <div className="match-badge">
            {match}% Match
          </div>
        )}
      </div>

      <h3>{title}</h3>

      <p className="company-name">{company}</p>

      <div className="job-meta">
        <span>⌖ {location}</span>
        <span>◷ {type}</span>
      </div>

      <div className="job-salary">
        {salary}
      </div>

      <div className="job-skills">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="job-card-bottom">
        <button
          className="view-job-button"
          onClick={() => navigate(`/jobs/${id}`)}
        >
          View Job
        </button>

        <button className="save-job-button">
          ♡
        </button>
      </div>
    </div>
  );
}

export default JobCard;