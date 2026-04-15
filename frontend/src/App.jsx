import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PageShell from './components/PageShell.jsx';
import ResourceList from './components/ResourceList.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import BookingForm from './pages/booking/BookingForm.jsx';
import MyBookings from './pages/booking/MyBookings.jsx';
import AdminBookings from './pages/booking/AdminBookings.jsx';

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
                <BookingForm />
              </PageShell>
            }
          />
          <Route
            path="/bookings/my"
            element={
              <PageShell>
                <MyBookings />
              </PageShell>
            }
          />
          <Route
            path="/bookings/admin"
            element={
              <PageShell>
                <AdminBookings />
              </PageShell>
            }
          />
          <Route
            path="/maintenance"
            element={
              <PageShell>
                <PlaceholderPage
                  title="Maintenance"
                  description="Maintenance tickets and technician communication will appear here."
                />
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

