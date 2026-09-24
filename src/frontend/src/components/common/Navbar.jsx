function Navbar() {
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
        <div className="navbar-avatar">K</div>
      </div>
    </header>
  );
}

export default Navbar;