import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./components/Toast";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ReleasePackages from "./pages/ReleasePackages";
import CreateReleasePackage from "./pages/CreateReleasePackage";
import ReleaseDetail from "./pages/ReleaseDetail";
import Analysis from "./pages/Analysis";
import GeneratedSummaries from "./pages/GeneratedSummaries";
import VersionHistory from "./pages/VersionHistory";
import CompareVersions from "./pages/CompareVersions";
import FinalReview from "./pages/FinalReview";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function AuthedRoutes() {
  const { currentPackage } = useApp();
  const releaseName = currentPackage?.name;
  const versionBadge = currentPackage?.version;

  return (
    <DashboardLayout releaseName={releaseName} versionBadge={versionBadge}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/packages" element={<ReleasePackages />} />
        <Route path="/packages/new" element={<CreateReleasePackage />} />
        <Route path="/packages/:id" element={<ReleaseDetail />} />
        <Route path="/packages/:id/edit" element={<CreateReleasePackage />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/analysis/:id" element={<Analysis />} />
        <Route path="/summaries/:id" element={<GeneratedSummaries />} />
        <Route path="/versions" element={<VersionHistory />} />
        <Route path="/versions/:id" element={<VersionHistory />} />
        <Route path="/compare" element={<CompareVersions />} />
        <Route path="/compare/:id" element={<CompareVersions />} />
        <Route path="/final-review/:id" element={<FinalReview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Dashboard />} />
        <Route path="/signup" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </DashboardLayout>
  );
}

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3 text-neutral-500">
          <svg className="h-6 w-6 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <AppProvider>
      <AuthedRoutes />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </ToastProvider>
  );
}
