
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LoaderPage from "./components/Loader.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";


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
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Welcome"
                description="Use the navigation menu to open Dashboard, Tickets, About, or Contact sections."
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Dashboard widgets and analytics are loading in this workspace configuration."
              />
            }
          />
          <Route
            path="/tickets"
            element={
              <PlaceholderPage
                title="My Tickets"
                description="Track your submitted incidents and monitor their progress here."
              />
            }
          />
          <Route
            path="/tickets/new"
            element={
              <PlaceholderPage
                title="Report Issue"
                description="Submit a new incident ticket with priority, location, and details."
              />
            }
          />
          <Route
            path="/about"
            element={
              <PlaceholderPage
                title="About"
                description="Project and platform overview for Smart Campus Operations Hub."
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PlaceholderPage
                title="Contact"
                description="Contact channels and support information will appear here."
              />
            }
          />
          <Route
            path="/bookings"
            element={
              <LoaderPage
                loading={false}
                message="Booking management and approval workflows will appear here."
              />
            }
          />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;