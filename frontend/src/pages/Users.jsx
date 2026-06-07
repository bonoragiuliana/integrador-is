import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import UserModal from '../components/UserModal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const openEdit = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const getRoleBadge = (role) => {
    const colors = {
      SUPERVISOR: 'bg-purple-100 text-purple-800 border-purple-200',
      TECNICO: 'bg-blue-100 text-blue-800 border-blue-200',
      INSPECTOR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      OPERARIO: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${colors[role] || colors.OPERARIO}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos y roles del personal.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getRoleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UserModal 
          user={userToEdit} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsModalOpen(false); fetchUsers(); }} 
        />
      )}
    </div>
  );
}
