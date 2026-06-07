import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import Users from './pages/Users';
import Machines from './pages/Machines';
import WorkOrders from './pages/WorkOrders';
import MaintenanceHistory from './pages/MaintenanceHistory';
import PendingInterventions from './pages/PendingInterventions';
import QrScanner from './pages/QrScanner';
import ReportIssue from './pages/ReportIssue';
import History from './pages/History';
import OperativeDashboard from './pages/OperativeDashboard';
import RegisterMaintenance from './pages/RegisterMaintenance';
import AssignedWorkOrders from './pages/AssignedWorkOrders';
import Metrics from './pages/Metrics';

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'SUPERVISOR' ? '/empresa' : '/operativo'} />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Panel Gerencial - Supervisor */}
        <Route 
          path="/empresa" 
          element={
            <PrivateRoute allowedRoles={['SUPERVISOR']}>
              <DashboardLayout />
            </PrivateRoute>
          } 
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="machines" element={<Machines />} />
          <Route path="orders" element={<WorkOrders />} />
          <Route path="history" element={<MaintenanceHistory />} />
          <Route path="interventions" element={<PendingInterventions />} />
          <Route path="indicadores" element={<Metrics />} />
        </Route>

        {/* Panel Operativo - Tecnicos, Inspectores, Operarios */}
        <Route 
          path="/operativo" 
          element={
            <PrivateRoute allowedRoles={['TECNICO', 'INSPECTOR', 'OPERARIO']}>
              <DashboardLayout />
            </PrivateRoute>
          } 
        >
          <Route index element={<OperativeDashboard />} />
          <Route path="orders" element={<AssignedWorkOrders />} />
          <Route path="machines" element={<Machines />} />
          <Route path="scanner" element={<QrScanner />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="history" element={<History />} />
          <Route path="mantenimiento" element={<RegisterMaintenance />} />
        </Route>

        {/* Fallback general */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
