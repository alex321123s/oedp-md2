import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MotionsPage from './pages/MotionsPage';
import MotionDetailPage from './pages/MotionDetailPage';
import CreateMotionPage from './pages/CreateMotionPage';
import SurveysPage from './pages/SurveysPage';
import SurveyDetailPage from './pages/SurveyDetailPage';
import CreateSurveyPage from './pages/CreateSurveyPage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="motions" element={<MotionsPage />} />
        <Route path="motions/:id" element={<MotionDetailPage />} />
        <Route path="surveys" element={<SurveysPage />} />
        <Route path="surveys/:id" element={<SurveyDetailPage />} />
        
        {/* Protected routes */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="motions/create"
          element={
            <PrivateRoute>
              <CreateMotionPage />
            </PrivateRoute>
          }
        />
        
        <Route
          path="surveys/create"
          element={
            <PrivateRoute>
              <CreateSurveyPage />
            </PrivateRoute>
          }
        />
        
        {/* Legacy redirects - keep old URLs working */}
        <Route path="my-motions" element={<Navigate to="/dashboard" replace />} />
        <Route path="profile" element={<Navigate to="/dashboard" replace />} />
        <Route path="admin" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
