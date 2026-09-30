import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getNotifications } from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();

        const userNotifications = (data || []).filter(
          (notification) =>
            String(notification.userId) === String(user?.id)
        );

        setNotifications(
          userNotifications.sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setMessage("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <h2>Loading notifications...</h2>
      </DashboardLayout>
    );
  }

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

        {message && (
          <p className="application-message">
            {message}
          </p>
        )}

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="profile-muted">
              No notifications yet.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                className={`notification-card ${
                  notification.readStatus
                    ? ""
                    : "notification-unread"
                }`}
                key={notification.id}
              >
                <div className="notification-icon">
                  ●
                </div>

                <div className="notification-content">
                  <strong>Notification</strong>

                  <p>{notification.message}</p>

                  <small>
                    {notification.readStatus
                      ? "Read"
                      : "Unread"}
                  </small>
                </div>

                {!notification.readStatus && (
                  <span className="notification-unread-dot">
                    ●
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;