
import Layout from "./components/Layout";
import PageShell from "./components/PageShell";
import ResourceList from "./components/ResourceList.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MaintenancePage from "./pages/MaintenancePage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import TicketListPage from "./pages/TicketListPage.jsx";
import NewTicketPage from "./pages/NewTicketPage.jsx";
import TicketDetailPage from "./pages/TicketDetailPage.jsx";
import "../src/assets/css/global.css";



  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/about"         element={<AboutPage />} />
          <Route path="/contact"       element={<ContactPage />} />
          <Route path="/dashboard"     element={<PageShell><DashboardPage /></PageShell>} />
          <Route path="/resources"     element={<PageShell><ResourceList /></PageShell>} />
          <Route path="/bookings"      element={<PageShell><PlaceholderPage title="Bookings" description="Booking management and approval workflows will appear here." /></PageShell>} />
          <Route path="/maintenance"   element={<PageShell><MaintenancePage /></PageShell>} />
          <Route path="/tickets"       element={<TicketListPage />} />
          <Route path="/tickets/new"   element={<NewTicketPage />} />
          <Route path="/tickets/:id"   element={<TicketDetailPage />} />
          <Route path="/login"         element={<PlaceholderPage title="Login" />} />
          <Route path="*"              element={<PlaceholderPage title="404 – Page Not Found" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );

