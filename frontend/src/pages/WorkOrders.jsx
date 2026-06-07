import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Calendar, User, Wrench, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function WorkOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    machine_id: '',
    type: 'PREVENTIVO',
    priority: 'MEDIA',
    assigned_to: '',
    limit_date: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, machinesRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/api/work-orders'),
        fetch('http://localhost:3000/api/machines'),
        fetch('http://localhost:3000/api/users')
      ]);

      if (!ordersRes.ok || !machinesRes.ok || !usersRes.ok) {
        throw new Error('Error al cargar datos del servidor');
      }

      const ordersData = await ordersRes.json();
      const machinesData = await machinesRes.json();
      const usersData = await usersRes.json();

      setOrders(ordersData);
      setMachines(machinesData);
      setTechnicians(usersData.filter(u => u.role === 'TECNICO'));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.machine_id || !formData.assigned_to || !formData.limit_date || !formData.description) {
      setError('Por favor completá todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la orden');
      }

      setSuccessMsg('¡Orden de trabajo creada con éxito!');
      setIsModalOpen(false);
      setFormData({
        machine_id: '',
        type: 'PREVENTIVO',
        priority: 'MEDIA',
        assigned_to: '',
        limit_date: '',
        description: ''
      });
      fetchData(); // Reload list

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICA': return 'bg-red-100 text-red-700 border-red-200';
      case 'ALTA': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'BAJA': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Órdenes de Trabajo
          </h1>
          <p className="text-gray-500 mt-2">Gestión y asignación de tareas de mantenimiento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Listado de Órdenes */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">Sin órdenes activas</h3>
          <p className="text-gray-500">No hay ninguna orden de trabajo registrada en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/30 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-bold uppercase tracking-wider">
                      {order.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{order.machine?.name || 'Máquina eliminada'}</h3>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">
                  {order.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm flex-1 font-medium leading-relaxed">
                {order.description}
              </p>

              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 font-bold">
                  <User className="w-4 h-4 text-gray-400" />
                  {order.technician?.name || 'No asignado'}
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-bold">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Vence: {new Date(order.limit_date).toLocaleDateString('es-AR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary" />
                Crear Orden de Trabajo
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="orderForm" onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="font-medium text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Máquina *</label>
                    <select 
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      value={formData.machine_id}
                      onChange={(e) => setFormData({...formData, machine_id: e.target.value})}
                    >
                      <option value="">Seleccionar máquina...</option>
                      {machines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.sector})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Técnico Asignado *</label>
                    <select 
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    >
                      <option value="">Seleccionar técnico...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipo de Mantenimiento *</label>
                    <select 
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="PREVENTIVO">Preventivo</option>
                      <option value="CORRECTIVO">Correctivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Prioridad *</label>
                    <select 
                      required
                      className={`w-full p-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold cursor-pointer ${getPriorityColor(formData.priority)}`}
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="CRITICA">🔴 CRÍTICA</option>
                      <option value="ALTA">🟠 ALTA</option>
                      <option value="MEDIA">🟡 MEDIA</option>
                      <option value="BAJA">⚪️ BAJA</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Fecha Límite *</label>
                    <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none"
                      value={formData.limit_date}
                      onChange={(e) => setFormData({...formData, limit_date: e.target.value})}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Descripción de la Tarea *</label>
                    <textarea 
                      required
                      placeholder="Describí en detalle qué hay que hacer..."
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="orderForm"
                disabled={isSubmitting}
                className="px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-xl shadow-sm transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Crear Orden'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
