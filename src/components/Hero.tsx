import { useState } from "react";
import { Download, Check, Upload, AlertCircle, Calendar } from "lucide-react";
import { useApk } from "../context/ApkContext";
import { useAuth } from "../context/AuthContext";
import { formatReleaseDate } from "../utils/apkValidation";

export function Hero() {
  const { currentApk, openAdminModal, isLoading } = useApk();
  const { currentUser } = useAuth();
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadClick = () => {
    if (!currentApk) return;
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <section className="hero">
      <div className="container hero-inner">
        {/* Hero Title & Subtitle */}
        <h1 className="hero-heading">
          Download Ledgerly
        </h1>
        <p className="hero-description">
          Smart Spending & Savings Tracker is a simple and convenient tool to manage daily expenses and habits. It allows us to understand where spending goes, so saving becomes easier and more manageable.
        </p>

        {/* Primary Download Glass Chamber */}
        <div className="hero-download-box hero-glass-chamber">
          <div className="glass-chamber-specular-edge" />
          <div className="primary-action-wrap">
            {isLoading ? (
              <button disabled className="btn btn-secondary btn-large download-main-btn glass-btn-disabled">
                <span className="btn-spinner" />
                <span>Checking release status...</span>
              </button>
            ) : currentApk ? (
              <a
                href={currentApk.downloadUrl}
                download={!currentApk.downloadUrl.startsWith("http") ? currentApk.fileName : undefined}
                target={currentApk.downloadUrl.startsWith("http") ? "_blank" : undefined}
                rel={currentApk.downloadUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={handleDownloadClick}
                className="btn btn-primary btn-large download-main-btn liquid-download-btn"
              >
                {downloadStarted ? (
                  <>
                    <Check size={20} className="check-animated" />
                    <span>Downloading {currentApk.fileName}...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} className="download-bounce" />
                    <span>Download for Android (APK)</span>
                  </>
                )}
              </a>
            ) : currentUser?.isAdmin ? (
              <button
                onClick={openAdminModal}
                className="btn btn-primary btn-large download-main-btn liquid-download-btn"
              >
                <Upload size={18} />
                <span>Import APK Build (Admin)</span>
              </button>
            ) : (
              <div className="no-release-box">
                <button
                  disabled
                  className="btn btn-secondary btn-large download-main-btn disabled-btn"
                >
                  <AlertCircle size={18} />
                  <span>Awaiting APK Release</span>
                </button>
                <p className="no-release-note">
                  No APK build has been published yet. Please check back soon.
                </p>
              </div>
            )}

            {currentApk && (
              <div className="download-meta-glass">
                <span className="meta-pill font-mono">
                  <span className="meta-indicator" />
                  v{currentApk.version}
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-pill font-mono">{currentApk.fileSize}</span>
                {currentApk.updatedAt && (
                  <>
                    <span className="meta-dot">•</span>
                    <span className="meta-pill font-mono" title={`Updated: ${currentApk.updatedAt}`}>
                      <Calendar size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "4px" }} />
                      {formatReleaseDate(currentApk.updatedAt)}
                    </span>
                  </>
                )}
                <span className="meta-dot">•</span>
                <span className="meta-pill font-mono">Android 8.0+</span>
              </div>
            )}
          </div>

          {/* Admin quick bar when seiji is logged in */}
          {currentUser?.isAdmin && (
            <div className="admin-quick-bar-glass">
              <span className="admin-quick-text">
                Admin: <strong>{currentUser.username}</strong> — {currentApk ? "Build Active" : "No Build Published"}
              </span>
              <button onClick={openAdminModal} className="btn btn-secondary btn-sm admin-quick-btn">
                <Upload size={13} />
                <span>{currentApk ? "Update / Replace APK" : "Import APK Now"}</span>
              </button>
            </div>
          )}

          {/* Download Notification Banner when clicked */}
          {downloadStarted && (
            <div className="download-started-alert-glass">
              <span className="alert-ping-ring">
                <span className="alert-ping-dot" />
              </span>
              <span>Your download has started. To install, tap the file in your downloads folder.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
