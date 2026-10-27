import { Download, LogOut, Upload, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApk } from "../context/ApkContext";

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { currentApk, openAdminModal } = useApk();

  return (
    <header className="navbar-wrapper">
      <div className="container nav-container-wrap">
        <nav className="navbar-glass-island" aria-label="Main navigation">
          <a href="#top" className="nav-brand" aria-label="Ledgerly home">
            <img src="/icon.png" alt="" className="nav-logo" />
            <span className="brand-name">Ledgerly</span>
          </a>

          <div className="nav-links">
            <a className="nav-link" href="#docs">Guide</a>
            <a className="nav-link nav-feedback-link" href="mailto:jonhobayan16@gmail.com?subject=Ledgerly%20Feedback">
              <MessageSquare size={15} /> Feedback
            </a>
          </div>

          <div className="nav-actions">
            {currentUser?.isAdmin && (
              <>
                <button onClick={openAdminModal} className="btn btn-secondary btn-sm admin-nav-btn">
                  <Upload size={15} /> <span>Manage release</span>
                </button>
                <div className="user-profile-pill">
                  <span className="user-name">{currentUser.username}</span>
                  <button onClick={logout} className="logout-btn" title="Sign out" aria-label="Sign out">
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            )}
            {currentApk ? (
              <a
                href={currentApk.downloadUrl}
                download={!currentApk.downloadUrl.startsWith("http") ? currentApk.fileName : undefined}
                target={currentApk.downloadUrl.startsWith("http") ? "_blank" : undefined}
                rel={currentApk.downloadUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="btn btn-primary btn-sm nav-download-btn"
              >
                <Download size={15} /> <span>Download APK</span>
              </a>
            ) : (
              <a href="#docs" className="btn btn-primary btn-sm nav-download-btn">Explore Ledgerly</a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
