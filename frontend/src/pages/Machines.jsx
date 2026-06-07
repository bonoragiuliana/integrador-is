import { useState, useEffect } from 'react';
import { Plus, Monitor, Search, AlertCircle, QrCode, Edit2 } from 'lucide-react';
import MachineModal from '../components/MachineModal';

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachines = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/machines');
      if (response.ok) {
        const data = await response.json();
        setMachines(data);
      }
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSave = (newMachine) => {
    fetchMachines(); // Recargar lista
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPERATIVA': return 'bg-green-100 text-green-700 border-green-200';
      case 'FALLA': return 'bg-red-100 text-red-700 border-red-200';
      case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'INACTIVA': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'ALTO': return 'text-red-600 bg-red-50';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-50';
      case 'BAJO': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Máquinas y Equipos</h1>
          <p className="text-gray-500 text-sm mt-1">Inventario centralizado de activos y generación de QRs.</p>
        </div>
        <button 
          onClick={() => { setSelectedMachine(null); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Registrar Máquina
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, sector o código QR..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Máquina</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Riesgo</th>
                <th className="px-6 py-4">Código QR</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Cargando máquinas...
                  </td>
                </tr>
              ) : machines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Monitor className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No hay máquinas registradas</p>
                      <p className="text-gray-400 text-sm mt-1">Hacé clic en "Registrar Máquina" para comenzar</p>
                    </div>
                  </td>
                </tr>
              ) : (
                machines.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{m.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{m.sector}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getRiskColor(m.risk)}`}>
                        {m.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-mono text-xs bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                        <QrCode className="w-3.5 h-3.5" />
                        {m.qr_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedMachine(m); setIsModalOpen(true); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar máquina"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MachineModal 
          machine={selectedMachine}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
