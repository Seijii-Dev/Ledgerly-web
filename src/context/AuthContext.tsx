import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types/auth";

const ADMIN_ACCOUNT = {
  id: "admin-seiji",
  username: "seiji",
  email: "seiji@gmail.com",
  name: "Seiji (Admin)",
  isAdmin: true,
  password: "seijixinghe",
  createdAt: "2026-09-25T10:00:00Z",
};

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = "ledgerly_admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load existing admin session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(SESSION_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.isAdmin) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load admin session", e);
    }
  }, []);

  // Listen for direct admin link (#admin, ?admin, /admin)
  useEffect(() => {
    const checkDirectAdminAccess = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (
        hash === "#admin" ||
        hash === "#/admin" ||
        search.includes("admin") ||
        path === "/admin"
      ) {
        setIsAuthModalOpen(true);
      }
    };

    checkDirectAdminAccess();
    window.addEventListener("hashchange", checkDirectAdminAccess);
    window.addEventListener("popstate", checkDirectAdminAccess);
    return () => {
      window.removeEventListener("hashchange", checkDirectAdminAccess);
      window.removeEventListener("popstate", checkDirectAdminAccess);
    };
  }, []);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    // Clean up direct link hash if present
    if (window.location.hash === "#admin" || window.location.hash === "#/admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const login = (identifier: string, pass: string): { success: boolean; message?: string } => {
    const trimmedId = identifier.trim().toLowerCase();

    // Separate local gate for the web APK upload/release portal.
    // This is not connected to Ledgerly Backend user authentication.
    if (
      (trimmedId === ADMIN_ACCOUNT.username.toLowerCase() || trimmedId === ADMIN_ACCOUNT.email.toLowerCase()) &&
      pass === ADMIN_ACCOUNT.password
    ) {
      const adminUser: User = {
        id: ADMIN_ACCOUNT.id,
        username: ADMIN_ACCOUNT.username,
        email: ADMIN_ACCOUNT.email,
        name: ADMIN_ACCOUNT.name,
        isAdmin: true,
        createdAt: ADMIN_ACCOUNT.createdAt,
      };
      setCurrentUser(adminUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    return {
      success: false,
      message: "Access Denied. Invalid administrator credentials.",
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    if (window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
