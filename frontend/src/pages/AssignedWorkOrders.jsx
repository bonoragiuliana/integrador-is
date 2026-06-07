import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AssignedWorkOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [user.id]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/work-orders/assigned/${user.id}`);
      if (!response.ok) {
        throw new Error('Error al cargar tus órdenes de trabajo');
      }
      const data = await response.json();

      // Algoritmo de ordenamiento:
      // 1. COMPLETADA siempre va al fondo.
      // 2. Si no están completadas, ordenamos por prioridad: CRITICA > ALTA > MEDIA > BAJA
      const priorityWeight = { 'CRITICA': 4, 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
      
      const sortedData = data.sort((a, b) => {
        if (a.status === 'COMPLETADA' && b.status !== 'COMPLETADA') return 1;
        if (b.status === 'COMPLETADA' && a.status !== 'COMPLETADA') return -1;
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });

      setOrders(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    if (currentStatus === 'PENDIENTE') return 'EN_PROGRESO';
    if (currentStatus === 'EN_PROGRESO') return 'COMPLETADA';
    return 'PENDIENTE'; // Para poder deshacer (opcional)
  };

  const updateStatus = async (id, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    setUpdatingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/work-orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) throw new Error('Error al actualizar estado');
      
      // Recargar órdenes para que aplique el re-ordenamiento visual
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICA': return 'bg-red-500 text-white';
      case 'ALTA': return 'bg-orange-500 text-white';
      case 'MEDIA': return 'bg-yellow-400 text-gray-900';
      case 'BAJA': return 'bg-gray-300 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDIENTE': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'EN_PROGRESO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETADA': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusButtonText = (status) => {
    if (status === 'PENDIENTE') return 'Iniciar Trabajo';
    if (status === 'EN_PROGRESO') return 'Marcar Completada';
    return 'Reabrir Orden';
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-primary" />
          Mis Órdenes Asignadas
        </h1>
        <p className="text-gray-500 mt-1">Listado de tareas que el supervisor te derivó.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-1">No tenés órdenes asignadas por el momento</h3>
          <p className="text-gray-500">Buen trabajo, estás al día con todo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isCompleted = order.status === 'COMPLETADA';
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-3xl shadow-sm border p-5 sm:p-6 transition-all duration-300 ${
                  isCompleted ? 'border-green-200 opacity-60 bg-green-50/30' : 'border-gray-200 hover:border-primary/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      {order.type}
                    </span>
                  </div>
                </div>
                
                <h3 className={`text-xl font-black mb-2 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {order.machine?.name || 'Máquina eliminada'}
                </h3>

                <p className={`text-base font-medium leading-relaxed mb-6 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  {order.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-500">
                      <Calendar className="w-4 h-4" />
                      Vence: {new Date(order.limit_date).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => updateStatus(order.id, order.status)}
                    disabled={updatingId === order.id}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${
                      order.status === 'PENDIENTE' ? 'bg-primary text-white shadow-md hover:bg-primary-dark'
                      : order.status === 'EN_PROGRESO' ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {updatingId === order.id ? 'Actualizando...' : getStatusButtonText(order.status)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
