type User = {
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
} | null;

interface NavbarProps {
  toggleSidebar?: () => void;
  user: User;
}

export default function Navbar({ toggleSidebar, user }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {toggleSidebar && (
            <button onClick={toggleSidebar} className="sidebar-toggle-btn">
              &#9776;
            </button>
          )}
          <a href="/workspaces" className="navbar-brand">
            Bloxion
          </a>
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <div className="user-info">
                {user.avatarUrl && <img src={user.avatarUrl} alt="User Avatar" />}
                <span>
                  {user.displayName || user.username} (@{user.username})
                </span>
              </div>
              <a href="/api/auth/logout" className="navbar-logout">
                Logout
              </a>
            </>
          ) : (
            <a href="/api/auth/redirect" className="lf--submit" style={{ textDecoration: 'none' }}>
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}