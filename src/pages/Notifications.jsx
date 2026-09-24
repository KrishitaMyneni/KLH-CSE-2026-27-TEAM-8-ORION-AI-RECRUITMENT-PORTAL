import DashboardLayout from "../layouts/DashboardLayout";

function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "Application shortlisted",
      message: "Your application for Full Stack Developer has been shortlisted.",
      time: "10 minutes ago",
      type: "success",
    },
    {
      id: 2,
      title: "Application status updated",
      message: "Your application status has been moved to Interview.",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 3,
      title: "New job recommendation",
      message: "A new job matches your skills and profile.",
      time: "Yesterday",
      type: "match",
    },
  ];

  return (
    <DashboardLayout>
      <div className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NOTIFICATIONS</p>
            <h1>Your Notifications</h1>
            <p>
              Stay updated with your applications and recommendations.
            </p>
          </div>
        </div>

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card notification-${notification.type}`}
              key={notification.id}
            >
              <div className="notification-icon">●</div>

              <div className="notification-content">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{notification.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;