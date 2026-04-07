import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PageShell from './components/PageShell.jsx';
import ResourceList from './components/ResourceList.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/dashboard"
            element={
              <PageShell>
                <DashboardPage />
              </PageShell>
            }
          />
          <Route
            path="/resources"
            element={
              <PageShell>
                <ResourceList />
              </PageShell>
            }
          />
          <Route
            path="/bookings"
            element={
              <PageShell>
                <PlaceholderPage
                  title="Bookings"
                  description="Booking management and approval workflows will appear here."
                />
              </PageShell>
            }
          />
          <Route
            path="/maintenance"
            element={
              <PageShell>
                <MaintenancePage />
              </PageShell>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
