import { useState, useEffect } from 'react';
import { ClipboardList, Calendar, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AssignedWorkOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, nextStatus: null });

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
    if (currentStatus === 'PENDIENTE') return 'EN_PROCESO';
    if (currentStatus === 'EN_PROCESO') return 'COMPLETADA';
    return null; // No hay más avance
  };

  const handleStatusClick = (id, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;
    setConfirmModal({ isOpen: true, orderId: id, nextStatus });
  };

  const executeUpdateStatus = async () => {
    const { orderId, nextStatus } = confirmModal;
    setUpdatingId(orderId);
    setConfirmModal({ isOpen: false, orderId: null, nextStatus: null });
    
    try {
      const response = await fetch(`http://localhost:3000/api/work-orders/${orderId}/status`, {
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
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETADA': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusButtonText = (status) => {
    if (status === 'PENDIENTE') return 'Iniciar Trabajo';
    if (status === 'EN_PROCESO') return 'Marcar Completada';
    return '';
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
            const isInProcess = order.status === 'EN_PROCESO';
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-3xl shadow-sm border p-5 sm:p-6 transition-all duration-300 ${
                  isCompleted ? 'border-green-200 opacity-60 bg-green-50/30' : 
                  isInProcess ? 'border-blue-400 ring-4 ring-blue-100 shadow-blue-100 shadow-lg' : 
                  'border-gray-200 hover:border-primary/40'
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
                  
                  {!isCompleted && (
                    <button 
                      onClick={() => handleStatusClick(order.id, order.status)}
                      disabled={updatingId === order.id}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${
                        order.status === 'PENDIENTE' ? 'bg-primary text-white shadow-md hover:bg-primary-dark'
                        : 'bg-green-500 text-white shadow-md hover:bg-green-600'
                      }`}
                    >
                      {updatingId === order.id ? 'Actualizando...' : getStatusButtonText(order.status)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmación */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-gray-900 mb-2">Confirmar Acción</h2>
            <p className="text-gray-600 mb-8">
              ¿Confirmás que querés cambiar el estado de la orden a <span className="font-black text-gray-900">{confirmModal.nextStatus?.replace('_', ' ')}</span>?
              {confirmModal.nextStatus === 'EN_PROCESO' && ' Al hacerlo se registrará la hora de inicio de tu trabajo.'}
              {confirmModal.nextStatus === 'COMPLETADA' && ' Al hacerlo cerrarás la orden y registrarás la hora de finalización. Esta acción no se puede deshacer.'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, orderId: null, nextStatus: null })}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeUpdateStatus}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
