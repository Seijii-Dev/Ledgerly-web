import { useState, type FormEvent } from "react";
import { X, Lock, Shield, User as UserIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    const res = login(username, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage("Administrator authenticated successfully!");
      setTimeout(() => {
        closeAuthModal();
      }, 500);
    } else {
      setErrorMessage(res.message || "Invalid administrator credentials.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="auth-modal admin-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-brand">
            <div className="admin-portal-icon">
              <Shield size={18} />
            </div>
            <div>
              <span className="modal-title font-serif">Admin Portal</span>
              <span className="admin-portal-sub">Restricted System Access</span>
            </div>
          </div>
          <button onClick={closeAuthModal} className="modal-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="auth-alert alert-error">
            <AlertCircle size={15} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert alert-success">
            <CheckCircle2 size={15} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-user">
              Admin Username
            </label>
            <div className="input-wrap">
              <UserIcon size={16} className="input-icon" />
              <input
                id="admin-user"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                autoComplete="username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-pass">
              Admin Password
            </label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary auth-submit-btn">
            {isLoading ? "Verifying..." : "Sign In to Admin Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
