import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import LoaderPage from "./components/Loader.jsx";
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DashboardSectionPage from "./pages/DashboardSectionPage.jsx";
import TicketListPage from "./pages/TicketListPage.jsx";
import NewTicketPage from "./pages/NewTicketPage.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import UserTicketDashboardPage from "./pages/UserTicketDashboardPage.jsx";
import UserTicketDetailsPage from "./pages/UserTicketDetailsPage.jsx";
import TechnicianDashboardPage from "./pages/TechnicianDashboardPage.jsx";
import TechnicianSolutionPage from "./pages/TechnicianSolutionPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";


function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Show loader for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoaderPage loading={true} message="Loading SmartCampus..." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={<DashboardLayout />}
        >
          <Route index element={<DashboardPage />} />
          <Route path="facilities" element={<DashboardSectionPage title="Facilities" description="Manage campus facilities and resources." />} />
          <Route path="bookings" element={<DashboardSectionPage title="Bookings" description="View and manage booking requests." />} />
          <Route path="incidents" element={<TicketListPage />} />
          <Route path="incidents/new" element={<NewTicketPage />} />
          <Route path="incidents/:ticketId" element={<TicketDetailPage />} />
          <Route path="my-tickets" element={<UserTicketDashboardPage />} />
          <Route path="my-tickets/:ticketId" element={<UserTicketDetailsPage />} />
          <Route path="technician" element={<TechnicianDashboardPage />} />
          <Route path="technician/:ticketId/solve" element={<TechnicianSolutionPage />} />
          <Route path="notifications" element={<DashboardSectionPage title="Notifications" description="Review alerts and system updates." />} />
          <Route path="profile" element={<DashboardSectionPage title="Profile" description="Update profile preferences and account details." />} />
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/bookings"
            element={
              <LoaderPage
                loading={false}
                message="Booking management and approval workflows will appear here."
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;