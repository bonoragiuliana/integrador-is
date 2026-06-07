import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, User, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

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
      fetchData();

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateOrder = async (orderId) => {
    setIsValidating(true);
    try {
      const response = await fetch(`http://localhost:3000/api/work-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VALIDADA' })
      });
      if (!response.ok) throw new Error('Error al validar la orden');
      
      setSelectedOrder(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsValidating(false);
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

  const columns = [
    { id: 'PENDIENTE', title: 'Pendientes', color: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700' },
    { id: 'EN_PROCESO', title: 'En Proceso', color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { id: 'COMPLETADA', title: 'Completadas', color: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    { id: 'VALIDADA', title: 'Validadas', color: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
  ];

  // Retrocompatibilidad con EN_PROGRESO temporal
  const getNormalizedStatus = (status) => status === 'EN_PROGRESO' ? 'EN_PROCESO' : status;

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Tablero de Órdenes
          </h1>
          <p className="text-gray-500 mt-2">Ciclo de vida y seguimiento táctico de mantenimientos.</p>
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

      {/* KANBAN BOARD */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4 snap-x">
          {columns.map(col => {
            const colOrders = orders.filter(o => getNormalizedStatus(o.status) === col.id);
            return (
              <div key={col.id} className="flex-1 min-w-[320px] snap-center flex flex-col">
                <div className={`rounded-t-2xl px-4 py-3 border-t border-x ${col.border} ${col.color} flex justify-between items-center`}>
                  <h2 className={`font-black uppercase tracking-wider text-sm ${col.text}`}>{col.title}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/60 ${col.text}`}>{colOrders.length}</span>
                </div>
                <div className={`flex-1 p-3 bg-gray-50/50 border border-gray-200 rounded-b-2xl flex flex-col gap-3 min-h-[400px]`}>
                  {colOrders.length === 0 ? (
                    <div className="text-center p-6 text-gray-400 font-medium text-sm border-2 border-dashed border-gray-200 rounded-xl m-2">
                      No hay órdenes aquí
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group active:scale-95"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {order.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {order.machine?.name || 'Máquina eliminada'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-4">
                          <User className="w-3.5 h-3.5" />
                          <span className="truncate">{order.technician?.name || 'Sin asignar'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-2">
                          <Clock className="w-3 h-3" />
                          {col.id === 'PENDIENTE' ? `Vence: ${new Date(order.limit_date).toLocaleDateString('es-AR')}`
                           : col.id === 'EN_PROCESO' ? `Inició: ${order.started_at ? new Date(order.started_at).toLocaleDateString('es-AR') : '-'}`
                           : `Finalizó: ${order.completed_at ? new Date(order.completed_at).toLocaleDateString('es-AR') : '-'}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Detalle de Orden */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Detalle de la Orden</h2>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedOrder.machine?.name || 'Máquina Eliminada'}</h3>
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getPriorityColor(selectedOrder.priority)}`}>
                    {selectedOrder.priority}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-bold border bg-gray-100 text-gray-600 uppercase tracking-wider">
                    {getNormalizedStatus(selectedOrder.status).replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wider">
                    {selectedOrder.type}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</p>
                  <p className="text-gray-800 font-medium whitespace-pre-wrap">{selectedOrder.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Técnico</p>
                  <p className="text-gray-900 font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400"/>
                    {selectedOrder.technician?.name || 'No asignado'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vencimiento</p>
                  <p className="text-gray-900 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400"/>
                    {new Date(selectedOrder.limit_date).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>

              {(selectedOrder.started_at || selectedOrder.completed_at) && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trazabilidad</p>
                  <div className="space-y-2">
                    {selectedOrder.started_at && (
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">Iniciado:</span>
                        <span className="text-gray-900">{new Date(selectedOrder.started_at).toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    {selectedOrder.completed_at && (
                      <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-gray-200">
                        <span className="text-gray-500">Finalizado:</span>
                        <span className="text-gray-900">{new Date(selectedOrder.completed_at).toLocaleString('es-AR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón de Validar si está COMPLETADA */}
            {getNormalizedStatus(selectedOrder.status) === 'COMPLETADA' && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                <button
                  onClick={() => handleValidateOrder(selectedOrder.id)}
                  disabled={isValidating}
                  className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
                >
                  {isValidating ? 'Validando...' : 'Validar Orden (Aprobar)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva Orden ... (Se mantiene igual, copiado abajo para no perderlo) */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Máquina *</label>
                    <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer" value={formData.machine_id} onChange={(e) => setFormData({...formData, machine_id: e.target.value})}>
                      <option value="">Seleccionar máquina...</option>
                      {machines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.sector})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Técnico Asignado *</label>
                    <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer" value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
                      <option value="">Seleccionar técnico...</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipo de Mantenimiento *</label>
                    <select required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="PREVENTIVO">Preventivo</option>
                      <option value="CORRECTIVO">Correctivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Prioridad *</label>
                    <select required className={`w-full p-3 border rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold cursor-pointer ${getPriorityColor(formData.priority)}`} value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                      <option value="CRITICA">🔴 CRÍTICA</option>
                      <option value="ALTA">🟠 ALTA</option>
                      <option value="MEDIA">🟡 MEDIA</option>
                      <option value="BAJA">⚪️ BAJA</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Fecha Límite *</label>
                    <input type="date" required min={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary outline-none" value={formData.limit_date} onChange={(e) => setFormData({...formData, limit_date: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Descripción de la Tarea *</label>
                    <textarea required placeholder="Describí en detalle qué hay que hacer..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" form="orderForm" disabled={isSubmitting} className="px-6 py-3 font-bold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 rounded-xl shadow-sm transition-colors">{isSubmitting ? 'Guardando...' : 'Crear Orden'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
