import "./redesign.css";
import { AuthProvider } from "./context/AuthContext";
import { ApkProvider } from "./context/ApkContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductDetails } from "./components/ProductDetails";
import { Documentation } from "./components/Documentation";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";
import { AdminApkModal } from "./components/AdminApkModal";

function App() {
  return (
    <AuthProvider>
      <ApkProvider>
        <div className="page-wrapper">
          <Navbar />
          <main>
            <Hero />
            <ProductDetails />
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
