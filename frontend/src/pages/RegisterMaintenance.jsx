import { useState } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PenTool, CheckCircle2, AlertCircle, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const CHECKLISTS = {
  PREVENTIVO: [
    'Verificar nivel de aceite',
    'Limpiar filtros',
    'Revisar correas y cadenas',
    'Verificar ajuste de pernos',
    'Probar funcionamiento general'
  ],
  CORRECTIVO: [
    'Identificar causa de la falla',
    'Reemplazar componente dañado',
    'Verificar reparación',
    'Probar funcionamiento',
    'Documentar repuesto utilizado'
  ],
  INSPECCION: [
    'Revisar estado general',
    'Verificar parámetros operativos',
    'Fotografiar componentes críticos',
    'Registrar anomalías encontradas'
  ]
};

export default function RegisterMaintenance() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const machine = location.state?.machine;

  const [formData, setFormData] = useState({
    type: 'PREVENTIVO',
    date: new Date().toISOString().split('T')[0],
    description: '',
    observations: '',
    final_machine_status: machine ? machine.status : 'OPERATIVA',
    isConfirmed: false
  });

  const [checklist, setChecklist] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setChecklist([]);
  }, [formData.type]);

  const toggleChecklistItem = (item) => {
    setChecklist(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const currentTasks = CHECKLISTS[formData.type] || [];
  const progressPercent = currentTasks.length > 0 ? Math.round((checklist.length / currentTasks.length) * 100) : 0;

  // Redirigir si alguien entra directo sin escanear maquina
  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No hay máquina seleccionada</h2>
        <p className="text-gray-500 mb-6">Tenés que escanear un código QR primero.</p>
        <button 
          onClick={() => navigate('/operativo/scanner')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold"
        >
          Ir al Escáner
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.description || !formData.final_machine_status || !formData.type) {
      setErrorMsg('Por favor completá los campos obligatorios.');
      return;
    }
    
    if (!formData.isConfirmed) {
      setErrorMsg('Tenés que marcar la casilla de confirmación para firmar el trabajo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: machine.id,
          user_id: user.id,
          type: formData.type,
          date: formData.date,
          description: formData.description,
          observations: formData.observations,
          final_machine_status: formData.final_machine_status,
          checklist_completed: checklist
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al guardar el mantenimiento');
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full text-center animate-in zoom-in">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Mantenimiento Registrado!</h2>
          <p className="text-gray-500 mb-8">
            El reporte fue guardado y el estado de la máquina se actualizó automáticamente. Queda pendiente de validación por un supervisor.
          </p>
          <button
            onClick={() => navigate('/operativo')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all active:scale-95"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-12 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-900 bg-white rounded-full shadow-sm border border-gray-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Registrar Mantenimiento</h1>
          <p className="text-sm text-gray-500 mt-1">Máquina: <span className="font-bold text-gray-700">{machine.name}</span></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipo de Intervención</label>
            <select 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="PREVENTIVO">Preventivo (Programado)</option>
              <option value="CORRECTIVO">Correctivo (Reparación)</option>
              <option value="INSPECCION">Inspección Rutinaria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Descripción del Trabajo *</label>
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[120px] resize-none"
              placeholder="¿Qué trabajo se realizó exactamente?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Checklist Dinámico */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Checklist de Tareas</h3>
              </div>
              <span className="text-sm font-bold text-gray-500">
                {checklist.length} de {currentTasks.length} completadas
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-gray-200">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {currentTasks.map((task, idx) => {
                const isChecked = checklist.includes(task);
                return (
                  <label 
                    key={idx} 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleChecklistItem(task);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${
                      isChecked 
                        ? 'bg-primary/5 border-primary/20 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="shrink-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors ${
                        isChecked 
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                    <span className={`text-sm sm:text-base font-semibold leading-tight ${
                      isChecked ? 'text-primary line-through opacity-70' : 'text-gray-700'
                    }`}>
                      {task}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Observaciones Extra <span className="text-gray-400 font-normal lowercase">(Opcional)</span></label>
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[80px] resize-none"
              placeholder="Detalles adicionales, repuestos usados..."
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nuevo Estado del Equipo</label>
            <p className="text-sm text-gray-500 mb-3">¿En qué estado operativo queda la máquina después de tu intervención?</p>
            <select 
              className="w-full p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.final_machine_status}
              onChange={(e) => setFormData({...formData, final_machine_status: e.target.value})}
            >
              <option value="OPERATIVA">🟢 OPERATIVA (Funcionando bien)</option>
              <option value="FALLA">🔴 FALLA (Sigue rota/detenida)</option>
              <option value="MANTENIMIENTO">🟡 MANTENIMIENTO (Requiere más trabajo)</option>
              <option value="INACTIVA">⚪️ INACTIVA (Fuera de servicio temporal)</option>
            </select>
          </div>

        </div>

        {/* Firma Electrónica */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-primary border border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="mt-1">
              <input 
                type="checkbox"
                className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.isConfirmed}
                onChange={(e) => setFormData({...formData, isConfirmed: e.target.checked})}
              />
            </div>
            <span className="text-gray-700 font-medium leading-relaxed">
              Confirmo bajo mi responsabilidad técnica que realicé esta intervención y los datos ingresados son reales.
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Botón de Acción Masivo */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl flex items-center justify-center gap-3"
        >
          <PenTool className="w-6 h-6" />
          {isSubmitting ? 'Guardando reporte...' : 'Guardar Mantenimiento'}
        </button>

      </form>
    </div>
  );
}
