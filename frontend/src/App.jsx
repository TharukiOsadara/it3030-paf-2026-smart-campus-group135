
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            path="/bookings"
            element={
              <LoaderPage
                loading={false}
                message="Booking management and approval workflows will appear here."
              />
            }
          />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          {/* <Route path="*" element={<PlaceholderPage title="404 – Page Not Found" />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;