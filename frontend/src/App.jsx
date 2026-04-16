import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import TechnicianLayout from './components/TechnicianLayout.jsx';
import PageShell from './components/PageShell.jsx';
import ResourceList from './components/ResourceList.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TechnicianDashboard from './pages/TechnicianDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import TechnicianProfile from './pages/TechnicianProfile.jsx';
import HomePage from './pages/HomePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BookingForm from './pages/booking/BookingForm.jsx';
import MyBookings from './pages/booking/MyBookings.jsx';
import AdminBookings from './pages/booking/AdminBookings.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin routes with AdminLayout */}
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            }
          />
          <Route
            path="/bookings/admin"
            element={
              <AdminLayout>
                <AdminBookings />
              </AdminLayout>
            }
          />

          {/* Technician routes with TechnicianLayout */}
          <Route
            path="/technician-dashboard"
            element={
              <TechnicianLayout>
                <TechnicianDashboard />
              </TechnicianLayout>
            }
          />
          <Route
            path="/technician-profile"
            element={
              <TechnicianLayout>
                <TechnicianProfile />
              </TechnicianLayout>
            }
          />

          {/* All other routes with standard Layout */}
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/sign-in" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PageShell>
                        <DashboardPage />
                      </PageShell>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PageShell>
                        <ProfilePage />
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
                    path="/maintenance"
                    element={
                      <PageShell>
                        <PlaceholderPage
                          title="Maintenance"
                          description="Maintenance ticket tracking will appear here."
                        />
                      </PageShell>
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
