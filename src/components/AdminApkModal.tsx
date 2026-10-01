import { useState, type FormEvent, type ChangeEvent } from "react";
import {
  X,
  Upload,
  Link,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Download,
  Copy,
  Check,
  Calendar,
  Hash,
} from "lucide-react";
import { useApk } from "../context/ApkContext";
import { useAuth } from "../context/AuthContext";
import { validateApkFile, formatReleaseDate } from "../utils/apkValidation";

export function AdminApkModal() {
  const { currentUser } = useAuth();
  const {
    currentApk,
    isServerConnected,
    isAdminModalOpen,
    closeAdminModal,
    importApkFile,
    updateApkUrl,
    syncWithGitHubReleases,
    restoreGlobalRelease,
    removeRelease,
  } = useApk();

  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionInput, setVersionInput] = useState(currentApk?.version || "1.0.0");
  const [validationPreview, setValidationPreview] = useState<{
    valid: boolean;
    error?: string;
    size?: string;
    hash?: string;
  } | null>(null);

  // URL state
  const [urlInput, setUrlInput] = useState(currentApk?.downloadUrl || "");
  const [urlVersion, setUrlVersion] = useState(currentApk?.version || "1.0.0");
  const [urlSize, setUrlSize] = useState(currentApk?.fileSize || "~38.4 MB");
  const [urlHash, setUrlHash] = useState(currentApk?.sha256Hash || "");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Only render if admin modal is open and user is admin
  if (!isAdminModalOpen || !currentUser?.isAdmin) return null;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmDelete(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setStatusMsg(null);

      // Validate immediately on selection
      setIsProcessing(true);
      const res = await validateApkFile(file);
      setIsProcessing(false);

      if (!res.valid) {
        setValidationPreview({ valid: false, error: res.error });
        setStatusMsg({ type: "error", text: res.error || "Invalid APK file." });
      } else {
        setValidationPreview({
          valid: true,
          size: res.fileSizeFormatted,
          hash: res.sha256,
        });
        if (res.suggestedVersion) {
          setVersionInput(res.suggestedVersion);
        }
      }
    }
  };

  const handleFileImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMsg({ type: "error", text: "Please select an .apk file to import." });
      return;
    }

    if (validationPreview && !validationPreview.valid) {
      setStatusMsg({ type: "error", text: validationPreview.error || "Cannot publish an invalid APK file." });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    const res = await importApkFile(selectedFile, versionInput);
    setIsProcessing(false);

    if (res.success) {
      setStatusMsg({
        type: "success",
        text: res.message || `Successfully published "${selectedFile.name}" as the active build!`,
      });
      setSelectedFile(null);
      setValidationPreview(null);
    } else {
      setStatusMsg({
        type: "error",
        text: res.message || "Failed to process and publish APK file. Please try again.",
      });
    }
  };

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setStatusMsg({ type: "error", text: "Please provide a valid download URL." });
      return;
    }

    updateApkUrl(urlInput, urlVersion, urlSize, urlHash);
    setStatusMsg({
      type: "success",
      text: "Global APK download URL and release specifications updated successfully!",
    });
  };

  const handleGitHubSync = async () => {
    setIsSyncing(true);
    setStatusMsg(null);
    const res = await syncWithGitHubReleases();
    setIsSyncing(false);

    setStatusMsg({
      type: res.success ? "success" : "error",
      text: res.message,
    });
  };

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setStatusMsg({
        type: "info",
        text: "Are you sure? Click 'Confirm Delete' to remove the active APK and unpublish the release.",
      });
      return;
    }

    setIsProcessing(true);
    const res = await removeRelease();
    setIsProcessing(false);
    setConfirmDelete(false);

    setStatusMsg({
      type: "success",
      text: res.message || "Active APK build has been removed. Website is now in unreleased state.",
    });
  };

  const handleCopyHash = (hash: string) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadReleaseJson = () => {
    if (!currentApk) return;
    const jsonStr = JSON.stringify(currentApk, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "release.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={closeAdminModal}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <div className="admin-shield-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="modal-title font-serif">APK Management Portal</span>
              <span className="admin-user-tag">
                Admin: <strong>{currentUser.username}</strong>
                {isServerConnected ? (
                  <span style={{ color: "#34d399", marginLeft: "8px" }}>
                    • Server Storage Connected
                  </span>
                ) : (
                  <span style={{ color: "#94a3b8", marginLeft: "8px" }}>
                    • Browser Storage Mode
                  </span>
                )}
              </span>
            </div>
          </div>
          <button onClick={closeAdminModal} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Current Active APK Specs Card */}
        <div className="current-apk-summary">
          <div className="summary-col">
            <span className="summary-label">Active Build</span>
            <strong className="summary-val" title={currentApk?.fileName || "None"}>
              {currentApk?.fileName || "None (Unreleased)"}
            </strong>
          </div>
          <div className="summary-col">
            <span className="summary-label">Version</span>
            <strong className="summary-val">{currentApk ? `v${currentApk.version}` : "—"}</strong>
          </div>
          <div className="summary-col">
            <span className="summary-label">Size</span>
            <strong className="summary-val">{currentApk?.fileSize || "—"}</strong>
          </div>
          <div className="summary-col">
            <span className="summary-label">Status</span>
            <span className={`badge ${currentApk ? "badge-custom" : "badge-subtle"}`}>
              {currentApk ? "Published Live" : "No Release"}
            </span>
          </div>
        </div>

        {/* Extended metadata details when an APK is published */}
        {currentApk && (
          <div
            style={{
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                <Calendar size={13} />
                <span>Uploaded: <strong>{formatReleaseDate(currentApk.updatedAt)}</strong></span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={currentApk.downloadUrl}
                  download={currentApk.fileName}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  title="Test download of the active build"
                >
                  <Download size={12} />
                  <span>Test Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownloadReleaseJson}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  title="Export active release.json config"
                >
                  <span>Export release.json</span>
                </button>
              </div>
            </div>

            {currentApk.sha256Hash && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                <Hash size={13} style={{ flexShrink: 0 }} />
                <span className="font-mono" style={{ fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  SHA-256: {currentApk.sha256Hash}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(currentApk.sha256Hash)}
                  style={{
                    background: "none",
                    border: "none",
                    color: copiedHash ? "#34d399" : "var(--text-secondary)",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Copy SHA-256 checksum"
                >
                  {copiedHash ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Global Public Status Notice */}
        {currentApk && (
          <div
            className="admin-status-banner-live"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.9)" }}>
              <strong style={{ color: "#34d399" }}>Live & Public:</strong> This build is the active download. Anyone who visits this website from any computer, phone, or tablet can download this APK directly.
            </div>
            <button
              type="button"
              onClick={async () => {
                await restoreGlobalRelease();
                setStatusMsg({ type: "success", text: "Reset release status to server default." });
              }}
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: "nowrap", fontSize: "11px" }}
              title="Reset to default release configuration"
            >
              Reset Build
            </button>
          </div>
        )}

        {/* Notification Alert */}
        {statusMsg && (
          <div
            className={`auth-alert ${
              statusMsg.type === "success"
                ? "alert-success"
                : statusMsg.type === "info"
                ? "alert-info"
                : "alert-error"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : statusMsg.type === "info" ? (
              <AlertCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="auth-tab-bar">
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setStatusMsg(null);
            }}
            className={`auth-tab-btn ${activeTab === "file" ? "active" : ""}`}
          >
            <Upload size={14} />
            <span>Upload APK File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("url");
              setStatusMsg(null);
            }}
            className={`auth-tab-btn ${activeTab === "url" ? "active" : ""}`}
          >
            <Link size={14} />
            <span>MediaFire / Cloud Link</span>
          </button>
        </div>

        {/* TAB 1: LOCAL FILE UPLOAD & REPLACEMENT */}
        {activeTab === "file" && (
          <form onSubmit={handleFileImport} className="admin-form">
            <div className="file-dropzone">
              <input
                type="file"
                id="apk-file-input"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleFileChange}
                className="hidden-file-input"
              />
              <label htmlFor="apk-file-input" className="dropzone-label">
                <FileCode size={34} className="dropzone-icon" />
                {selectedFile ? (
                  <div className="file-info-box">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size font-mono">
                      {validationPreview?.size || (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB"}
                    </span>
                    {validationPreview?.valid && (
                      <span style={{ fontSize: "11.5px", color: "#34d399", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <CheckCircle2 size={13} /> Verified Android APK Package
                      </span>
                    )}
                    {validationPreview && !validationPreview.valid && (
                      <span style={{ fontSize: "11.5px", color: "#f87171", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <AlertCircle size={13} /> Validation Failed: {validationPreview.error}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="dropzone-text">
                      Click or drag an <strong>.apk</strong> file from your computer
                    </span>
                    <span className="dropzone-sub">
                      Android package validation (magic byte header & checksum) performed automatically
                    </span>
                  </div>
                )}
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="version-input">
                Release Version Tag
              </label>
              <input
                id="version-input"
                type="text"
                placeholder="e.g. 1.0.1"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
                className="form-input"
                required
              />
              <span className="input-hint">
                When you publish, this build will cleanly replace the currently active APK without duplicate files.
              </span>
            </div>

            <div className="admin-btn-row">
              <button
                type="submit"
                disabled={isProcessing || !selectedFile || (validationPreview !== null && !validationPreview.valid)}
                className="btn btn-primary"
              >
                {isProcessing
                  ? "Validating & Publishing..."
                  : currentApk
                  ? "Publish & Replace Active APK"
                  : "Publish APK as Active Build"}
              </button>

              {currentApk && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isProcessing}
                  className="btn btn-secondary btn-sm danger-btn"
                  title="Remove/delete currently published APK"
                >
                  <Trash2 size={14} />
                  <span>{confirmDelete ? "Confirm Delete" : "Remove / Unpublish"}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: MEDIAFIRE & CLOUD URL CONFIGURATION */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlSubmit} className="admin-form">
            <div className="form-group">
              <label className="form-label" htmlFor="apk-url">
                MediaFire / Cloud Download URL
              </label>
              <input
                id="apk-url"
                type="url"
                placeholder="https://www.mediafire.com/file/.../ledgerly.apk"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="form-input"
                required
              />
              <span className="input-hint">
                Paste your MediaFire link, Google Drive link, or direct CDN URL. This allows anyone on any phone or device to download your APK directly from Netlify.
              </span>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="url-version">
                  Version Tag
                </label>
                <input
                  id="url-version"
                  type="text"
                  placeholder="1.0.0"
                  value={urlVersion}
                  onChange={(e) => setUrlVersion(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="url-size">
                  File Size
                </label>
                <input
                  id="url-size"
                  type="text"
                  placeholder="~38.4 MB"
                  value={urlSize}
                  onChange={(e) => setUrlSize(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="url-hash">
                SHA-256 Checksum (Optional)
              </label>
              <input
                id="url-hash"
                type="text"
                placeholder="64-character hex checksum"
                value={urlHash}
                onChange={(e) => setUrlHash(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div className="admin-btn-row">
              <button type="submit" className="btn btn-primary">
                Save & Publish URL
              </button>
              {currentApk && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="btn btn-secondary btn-sm danger-btn"
                  title="Remove active release"
                >
                  <Trash2 size={14} />
                  <span>{confirmDelete ? "Confirm Delete" : "Unpublish"}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Auto-sync from GitHub bar */}
        <div className="admin-sync-bar" style={{ marginTop: "20px" }}>
          <div className="sync-left">
            <span className="sync-title">Scan GitHub Releases</span>
            <span className="sync-sub">Auto-detect latest .apk asset from Ledgerly repository</span>
          </div>
          <button
            type="button"
            onClick={handleGitHubSync}
            disabled={isSyncing}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={13} className={isSyncing ? "spin-icon" : ""} />
            <span>{isSyncing ? "Scanning..." : "Sync GitHub"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
