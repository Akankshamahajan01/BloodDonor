import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import HomePage      from "./pages/HomePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DonorPage     from "./pages/DonorPage";
import SearchPage    from "./pages/SearchPage";
import RequestPage   from "./pages/RequestPage";
import MatchesPage   from "./pages/MatchesPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage     from "./pages/AboutPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about"    element={<AboutPage />} />

        <Route path="/donor"   element={<PrivateRoute><DonorPage /></PrivateRoute>} />
        <Route path="/search"  element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/request" element={<PrivateRoute><RequestPage /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
