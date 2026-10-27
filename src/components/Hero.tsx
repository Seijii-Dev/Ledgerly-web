import { useState } from "react";
import { Download, Check, Upload, AlertCircle, Calendar, ArrowDown } from "lucide-react";
import { useApk } from "../context/ApkContext";
import { useAuth } from "../context/AuthContext";
import { formatReleaseDate } from "../utils/apkValidation";
import { LedgerPreview } from "./LedgerPreview";

export function Hero() {
  const { currentApk, openAdminModal, isLoading } = useApk();
  const { currentUser } = useAuth();
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownloadClick = () => {
    if (!currentApk) return;
    setDownloadStarted(true);
    window.setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <section id="top" className="hero" aria-labelledby="hero-heading">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 id="hero-heading" className="hero-heading">A clearer view of daily spending.</h1>
          <p className="hero-description">
            Ledgerly is an Android expense tracker that helps students record everyday spending, stay on budget, and make room for savings.
          </p>

          <div className="hero-actions">
            {isLoading ? (
              <button disabled className="btn btn-primary btn-large download-main-btn">
                <span className="btn-spinner" />
                <span>Checking for the latest release</span>
              </button>
            ) : currentApk ? (
              <a
                href={currentApk.downloadUrl}
                download={!currentApk.downloadUrl.startsWith("http") ? currentApk.fileName : undefined}
                target={currentApk.downloadUrl.startsWith("http") ? "_blank" : undefined}
                rel={currentApk.downloadUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={handleDownloadClick}
                className="btn btn-primary btn-large download-main-btn"
              >
                {downloadStarted ? <Check size={18} /> : <Download size={18} />}
                <span>{downloadStarted ? `Downloading ${currentApk.fileName}…` : "Download for Android"}</span>
              </a>
            ) : currentUser?.isAdmin ? (
              <button onClick={openAdminModal} className="btn btn-primary btn-large download-main-btn">
                <Upload size={18} />
                <span>Import an APK build</span>
              </button>
            ) : (
              <div className="release-unavailable">
                <button disabled className="btn btn-primary btn-large download-main-btn">
                  <AlertCircle size={18} />
                  <span>Release coming soon</span>
                </button>
                <p>No Android build has been published yet.</p>
              </div>
            )}

            <a className="hero-guide-link" href="#docs">
              Read the guide <ArrowDown size={15} />
            </a>
          </div>

          {currentApk && (
            <div className="release-details" aria-label="Release details">
              <span>Version {currentApk.version}</span>
              <span>{currentApk.fileSize}</span>
              {currentApk.updatedAt && <span><Calendar size={13} /> Updated {formatReleaseDate(currentApk.updatedAt)}</span>}
              <span>Android 8.0 or later</span>
            </div>
          )}

          {currentUser?.isAdmin && (
            <div className="admin-quick-bar">
              <span>Signed in as <strong>{currentUser.username}</strong> · {currentApk ? "Release active" : "No release published"}</span>
              <button onClick={openAdminModal} className="btn btn-secondary btn-sm">
                <Upload size={14} /> {currentApk ? "Manage release" : "Publish APK"}
              </button>
            </div>
          )}

          {downloadStarted && (
            <p className="download-started-alert" role="status">
              Your download has started. Open the APK file from your downloads to install Ledgerly.
            </p>
          )}
        </div>
        <div className="hero-demo-wrap">
          <LedgerPreview />
          <p className="hero-demo-caption">An example day · adjust the allowance</p>
        </div>
      </div>
    </section>
  );
}
