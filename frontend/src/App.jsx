import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-[#1A1A1A]">
          <Routes>
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
