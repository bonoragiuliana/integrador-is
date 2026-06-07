import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {user?.role}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
        
        <div className="h-8 w-px bg-gray-200"></div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  );
}
