import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import LoaderPage from "./components/Loader.jsx";
import Login from "./components/Login.jsx";
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DashboardSectionPage from "./pages/DashboardSectionPage.jsx";
import TicketListPage from "./pages/tickets/admin/AdiminTicketlistpage.jsx";
import NewTicketPage from "./pages/tickets/user/UserNewticketPage.jsx";
import TicketDetailPage from "./pages/tickets/admin/AdminTicketDetailsPage.jsx";
import UserTicketDashboardPage from "./pages/tickets/user/UserTicketDashboardPage.jsx";
import UserTicketDetailsPage from "./pages/tickets/user/UserTicketDetailsPage.jsx";
import TechnicianDashboardPage from "./pages/tickets/technician/TechnicianDashboardPage.jsx";
import TechnicianSolutionPage from "./pages/tickets/technician/TechnicianSolutionPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoaderPage loading={true} message="Loading SmartCampus..." />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!appReady) {
    return <LoaderPage loading={true} message="Loading SmartCampus..." />;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />

        {/* ── Dashboard (protected) ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="facilities"    element={<DashboardSectionPage title="Facilities"    description="Manage campus facilities and resources." />} />
          <Route path="bookings"      element={<DashboardSectionPage title="Bookings"      description="View and manage booking requests." />} />
          <Route path="notifications" element={<DashboardSectionPage title="Notifications" description="Review alerts and system updates." />} />
          <Route path="profile"       element={<DashboardSectionPage title="Profile"       description="Update profile preferences and account details." />} />

          {/* Admin */}
          <Route path="incidents"            element={<TicketListPage />} />
          <Route path="incidents/new"        element={<NewTicketPage />} />
          <Route path="incidents/:ticketId"  element={<TicketDetailPage />} />

          {/* User */}
          <Route path="my-tickets"           element={<UserTicketDashboardPage />} />
          <Route path="my-tickets/:ticketId" element={<UserTicketDetailsPage />} />

          {/* Technician */}
          <Route path="technician"                    element={<TechnicianDashboardPage />} />
          <Route path="technician/:ticketId/solve"    element={<TechnicianSolutionPage />} />
        </Route>

        {/* ── Public ── */}
        <Route element={<Layout />}>
          <Route path="/"        element={<HomePage />} />
          <Route path="/about"   element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/bookings"
            element={<LoaderPage loading={false} message="Booking management will appear here." />}
          />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
