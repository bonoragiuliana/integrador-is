import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function UserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'OPERARIO'
  });

  useEffect(() => {
    if (user) setFormData({ ...user, password: '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = user ? `http://localhost:3000/api/users/${user.id}` : 'http://localhost:3000/api/users';
    const method = user ? 'PUT' : 'POST';

    const payload = { ...formData };
    if (user && !payload.password) payload.password = user.password;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" required
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {user && <span className="text-gray-400 font-normal">(dejar en blanco para no cambiar)</span>}
            </label>
            <input 
              type="password" required={!user}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="TECNICO">TECNICO</option>
              <option value="INSPECTOR">INSPECTOR</option>
              <option value="OPERARIO">OPERARIO</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 flex justify-center items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
