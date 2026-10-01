import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ApkProvider } from "./context/ApkContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Documentation } from "./components/Documentation";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { AdminApkModal } from "./components/AdminApkModal";

function App() {
  return (
    <AuthProvider>
      <ApkProvider>
        <div className="page-wrapper">
          {/* Ambient Liquid Light Canvas (Refracted by glass surfaces) */}
          <div className="liquid-ambient-canvas" aria-hidden="true">
            <div className="liquid-orb liquid-orb-1" />
            <div className="liquid-orb liquid-orb-2" />
            <div className="liquid-orb liquid-orb-3" />
            <div className="liquid-orb liquid-orb-4" />
            <div className="liquid-mesh-grid" />
          </div>

          <Navbar />
          <main>
            <Hero />
            <Documentation />
          </main>
          <Footer />

          {/* Authentication Modal (Login / Register with Gmail) */}
          <AuthModal />

          {/* Admin APK Import & Management Portal (seiji only) */}
          <AdminApkModal />
        </div>
      </ApkProvider>
    </AuthProvider>
  );
}

export default App;
