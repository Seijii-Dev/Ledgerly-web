import { Shield, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApk } from "../context/ApkContext";

export function Footer() {
  const { currentUser, openAuthModal } = useAuth();
  const { openAdminModal } = useApk();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <div className="footer-brand-row">
            <img src="/icon.png" alt="Ledgerly" className="footer-logo" />
            <span className="footer-brand font-serif">Ledgerly</span>
          </div>
          <p className="footer-desc">
            Smart Spending & Savings Tracker. Developed by Group 6.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="copyright-text">
          © {new Date().getFullYear()} Ledgerly. Hosted by Group 6.
        </span>

        <div className="footer-admin-link-wrap">
          {currentUser?.isAdmin ? (
            <button
              type="button"
              onClick={openAdminModal}
              className="footer-admin-btn"
              title="Manage APK Releases"
            >
              <Settings size={12} />
              <span>APK Console ({currentUser.username})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="footer-admin-btn"
              title="Admin Portal Login"
            >
              <Shield size={12} />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
