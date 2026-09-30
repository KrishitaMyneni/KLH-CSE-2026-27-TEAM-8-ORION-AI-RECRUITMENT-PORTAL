import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <header className="navbar">
      <div className="search-container">
        <span>⌕</span>
        <input
          type="text"
          placeholder="Search jobs, companies or skills..."
        />
      </div>

      <div className="navbar-actions">
        <button>☾</button>
        <button>⚙</button>

        <div className="navbar-avatar">
          {userInitial}
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;