import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MatrixBackground from './components/MatrixBackground';
import LandingPage from './pages/LandingPage';
import Scanner from './pages/Scanner';
import VerifyCompany from './pages/VerifyCompany';
import HistoryPage from './pages/History';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import { useTheme } from './hooks/useTheme';
import './App.css';

const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  return isAdmin ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`app-layout ${isSidebarCollapsed && !isLandingPage ? 'sidebar-collapsed' : ''} ${isLandingPage ? 'landing-mode' : ''}`} data-theme={theme}>
      <MatrixBackground theme={theme} />
      
      {!isLandingPage && (
        <Sidebar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
        />
      )}
      
      <main className={isLandingPage ? "landing-main" : "main-content"}>
        <div className={isLandingPage ? "landing-container" : "content-container"}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/verify-company" element={<VerifyCompany />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
