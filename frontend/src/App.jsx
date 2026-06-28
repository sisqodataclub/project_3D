import UkEconomyDashboard from "./pages/UkEconomyDashboard";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import Logout from "./components/Logout";
import BlogPost from "./pages/BlogPost";

// CV components
import CVManager from "./pages/CVManager";
import CVDetail from "./pages/CVDetail";
import JobApplicationDetail from "./pages/JobApplicationDetail";
import CVLayout from "./pages/CVLayout"; // <-- NEW: Layout that provides HVT context

import AreaSelectionPage from "./pages/AreaSelectionPage";
import QuantitySelectionPage from "./pages/QuantitySelectionPage";
import PersonalDetailsPage from "./pages/PersonalDetailsPage";
import ReviewAndSubmit from "./pages/ReviewAndSubmit";
import BookingWizard from "./pages/BookingWizard";
import PerfumeAnalyticsDashboard from "./pages/Dashboard";
import ManVanAnalyticsDashboard from "./pages/ManVanAnalyticsDashboard";

import {
  About,
  Contact,
  Feedbacks,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
} from "./components";

// Optional: Register wrapper that clears any existing tokens
function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function Home() {
  return (
    <div className="relative z-0 bg-primary">
      <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
        <Hero />
      </div>
      <About />
      <Tech />
      <Works />
      <Feedbacks />
      <div className="relative z-0">
        <Contact />
        <StarsCanvas />
      </div>
    </div>
  );
}

const App = () => {
  // State for the multi-page form
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [details, setDetails] = useState({ name: "", email: "", phone: "" });

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 font-sans selection:bg-indigo-500/30 flex flex-col">

          <Navbar />

          <main className="flex-grow">
            <Routes>
              {/* Public + Home */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterAndLogout />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="*" element={<NotFound />} />

              {/* Public Blog Post */}
              <Route path="/blog/:id" element={<BlogPost />} />

              {/* Multi-Page Form Routes */}
              <Route path="/form/areass" element={<AreaSelectionPage selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas} />} />
              <Route path="/form/quantities" element={<QuantitySelectionPage selectedAreas={selectedAreas} quantities={quantities} setQuantities={setQuantities} />} />
              <Route path="/form/details" element={<PersonalDetailsPage details={details} setDetails={setDetails} />} />
              <Route path="/form/submit" element={<ReviewAndSubmit selectedAreas={selectedAreas} quantities={quantities} details={details} />} />
              <Route path="/form" element={<BookingWizard />} />

              {/* Dashboards */}
              <Route path="/dashboard" element={<PerfumeAnalyticsDashboard />} />
              <Route path="/conversion" element={<ManVanAnalyticsDashboard />} />
              <Route path="/uklive" element={<UkEconomyDashboard />} />

              {/* Protected Route (uses existing AuthProvider) */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />

              {/* 🆕 CV Routes – wrapped with HVT context via CVLayout */}
              <Route path="/cv" element={<CVLayout />}>
                <Route index element={<CVManager />} />
                <Route path=":id" element={<CVDetail />} />
                <Route path="application/:id" element={<JobApplicationDetail />} />
              </Route>
            </Routes>
          </main>

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
