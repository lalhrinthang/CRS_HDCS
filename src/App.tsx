import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import MapView from "@/pages/MapView";
import PublicDashboard from "@/pages/PublicDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AddReport from "@/pages/AddReport";
import ViewReportDetails from "@/pages/ViewReportDetails";
import EditReport from "@/pages/EditReport";
import Alerts from "@/pages/Alerts";
import About from "@/pages/About";

// Create a React Query client (for future API integration)
const queryClient = new QueryClient();

function App() {
  // Auth state — shared across all pages
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes — anyone can access */}
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/about" element={<About />} />

          {/* Auth route */}
          <Route path="/login" element={<Login onLogin={login} />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route
            path="/admin"
            element={
              <AdminDashboard
                isAuthenticated={isAuthenticated}
                onLogout={logout}
              />
            }
          />
          <Route
            path="/admin/add-report"
            element={
              <AddReport
                isAuthenticated={isAuthenticated}
                onLogout={logout}
              />
            }
          />
          <Route
            path="/admin/report/:id"
            element={
              <ViewReportDetails
                isAuthenticated={isAuthenticated}
                onLogout={logout}
              />
            }
          />
          <Route
            path="/admin/report/:id/edit"
            element={
              <EditReport
                isAuthenticated={isAuthenticated}
                onLogout={logout}
              />
            }
          />

          {/* 404 — catch all unmatched routes */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-2">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>

        {/* Toast notifications — renders at the top-right of the screen */}
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;