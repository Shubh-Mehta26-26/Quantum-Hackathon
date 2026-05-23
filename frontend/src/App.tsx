import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSimulationStore } from './store/simulationStore';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrafficGrid from './pages/TrafficGrid';
import Predictions from './pages/Predictions';
import QuantumOptimizer from './pages/QuantumOptimizer';
import EmergencyMode from './pages/EmergencyMode';
import PedestrianAccess from './pages/PedestrianAccess';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Route Protection HOC
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useSimulationStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/grid" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TrafficGrid />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/predictions" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Predictions />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quantum" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuantumOptimizer />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/emergency" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EmergencyMode />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pedestrian" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PedestrianAccess />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Global Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
