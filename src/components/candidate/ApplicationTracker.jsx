function ApplicationTracker({ applications = [] }) {
  if (applications.length === 0) {
    return (
      <div className="profile-card">
        <h3>Application Tracker</h3>
        <p className="profile-muted">
          You haven't applied to any jobs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h3>Application Tracker</h3>

      <div className="application-tracker">
        {applications.map((application) => (
          <div
            className="application-tracker-item"
            key={application.id}
          >
            <div>
              <strong>
                {application.jobTitle || `Application #${application.id}`}
              </strong>

              <span>
                Status:{" "}
                {application.status || "APPLIED"}
              </span>
            </div>

            <span
              className={`tracker-status tracker-${(
                application.status || "APPLIED"
              ).toLowerCase()}`}
            >
              {application.status || "APPLIED"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationTracker;