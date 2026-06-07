import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, Users, QrCode, Monitor, ClipboardList, AlertTriangle, History } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuthStore();
  const role = user?.role;

  // Menú dinámico según el rol
  const getNavLinks = () => {
    if (role === 'SUPERVISOR') {
      return [
        { to: '/empresa', icon: <Home className="w-5 h-5" />, label: 'Dashboard', exact: true },
        { to: '/empresa/machines', icon: <Monitor className="w-5 h-5" />, label: 'Máquinas' },
        { to: '/empresa/orders', icon: <ClipboardList className="w-5 h-5" />, label: 'Órdenes de Trabajo' },
        { to: '/empresa/users', icon: <Users className="w-5 h-5" />, label: 'Usuarios' },
      ];
    }
    
    if (role === 'TECNICO') {
      return [
        { to: '/operativo', icon: <Home className="w-5 h-5" />, label: 'Inicio', exact: true },
        { to: '/operativo/orders', icon: <ClipboardList className="w-5 h-5" />, label: 'Mis Órdenes' },
        { to: '/operativo/scanner', icon: <QrCode className="w-5 h-5" />, label: 'Escanear QR' },
      ];
    }
    
    if (role === 'INSPECTOR') {
      return [
        { to: '/operativo', icon: <Home className="w-5 h-5" />, label: 'Inicio', exact: true },
        { to: '/operativo/scanner', icon: <QrCode className="w-5 h-5" />, label: 'Escanear QR' },
        { to: '/operativo/history', icon: <History className="w-5 h-5" />, label: 'Historial' },
      ];
    }
    
    if (role === 'OPERARIO') {
      return [
        { to: '/operativo', icon: <Home className="w-5 h-5" />, label: 'Inicio', exact: true },
        { to: '/operativo/report', icon: <AlertTriangle className="w-5 h-5" />, label: 'Reportar Falla' },
      ];
    }

    return [];
  };

  const links = getNavLinks();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full shadow-xl shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-800 shrink-0">
        <QrCode className="text-primary w-8 h-8" />
        <span className="text-xl font-bold tracking-tight">MantechQR</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => (
          <NavLink 
            key={link.to}
            to={link.to} 
            end={link.exact}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
