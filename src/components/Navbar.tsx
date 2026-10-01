import { useState, useEffect } from "react";
import { Download, LogOut, Upload, Shield, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApk } from "../context/ApkContext";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  const { currentUser, logout } = useAuth();
  const { currentApk, openAdminModal } = useApk();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar-wrapper ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container nav-container-wrap">
        <div className="navbar-glass-island">
          {/* Brand */}
          <a href="#" className="nav-brand">
            <div className="nav-logo-glass-frame">
              <img src="/icon.png" alt="Ledgerly" className="nav-logo" />
            </div>
            <span className="brand-name font-serif">Ledgerly</span>
          </a>


          {/* Actions (Responsive) */}
          <div className="nav-actions">
            {/* Feedback Link (Email) */}
            <a
              href="mailto:jonhobayan16@gmail.com?subject=Ledgerly%20Feedback"
              className="btn btn-secondary btn-sm nav-feedback-btn"
              title="Send Feedback to jonhobayan16@gmail.com"
            >
              <MessageSquare size={13} />
              <span>Feedback</span>
            </a>

            {/* Admin Tools Button if seiji is logged in */}
            {currentUser?.isAdmin && (
              <button
                onClick={openAdminModal}
                className="btn btn-secondary btn-sm admin-nav-btn"
                title="Import or update active APK"
              >
                <Upload size={14} className="admin-upload-icon" />
                <span className="btn-label-desktop">Import APK</span>
              </button>
            )}

            {/* Admin User Profile Pill (Only visible when logged in) */}
            {currentUser?.isAdmin && (
              <div className="user-profile-pill">
                <div className="user-info">
                  <span className="badge badge-admin">
                    <Shield size={11} />
                    <span className="admin-badge-text">Admin</span>
                  </span>
                  <span className="user-name">{currentUser.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="logout-btn"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Direct Download Button */}
            {currentApk ? (
              <a
                href={currentApk.downloadUrl}
                download={!currentApk.downloadUrl.startsWith("http") ? currentApk.fileName : undefined}
                target={currentApk.downloadUrl.startsWith("http") ? "_blank" : undefined}
                rel={currentApk.downloadUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="btn btn-primary btn-sm nav-download-btn"
              >
                <Download size={14} />
                <span>Download APK</span>
              </a>
            ) : (
              <a href="#docs" className="btn btn-secondary btn-sm nav-download-btn">
                <Sparkles size={13} />
                <span>Explore App</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
