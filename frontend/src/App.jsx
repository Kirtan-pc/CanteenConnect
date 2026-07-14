import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SelectRolePage from './pages/SelectRolePage';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import ReportOrganicPage from './pages/ReportOrganicPage';
import ReportFoodPage from './pages/ReportFoodPage';
import MapPage from './pages/MapPage';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<DonorDashboard />} />
        <Route path="/ngo-dashboard" element={<NgoDashboard />} />
        <Route path="/report/organic" element={<ReportOrganicPage />} />
        <Route path="/report/food" element={<ReportFoodPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="max-w-[450px] mx-auto min-h-screen bg-surface shadow-md relative overflow-x-hidden">
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
