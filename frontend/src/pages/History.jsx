import { History as HistoryIcon } from 'lucide-react';

export default function History() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Mantenimientos</h1>
        <p className="text-gray-500 text-sm mt-1">Auditoría y revisión de reparaciones pasadas.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Próximamente</h2>
        <p className="text-gray-500 mt-2">Acá podrás buscar y filtrar los mantenimientos validados.</p>
      </div>
    </div>
  );
}
