import { Monitor } from 'lucide-react';

export default function Machines() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Máquinas</h1>
        <p className="text-gray-500 text-sm mt-1">Administra el inventario de máquinas y sus códigos QR.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <Monitor className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Próximamente</h2>
        <p className="text-gray-500 mt-2 max-w-md">El módulo de gestión de máquinas será implementado en las próximas Historias de Usuario.</p>
      </div>
    </div>
  );
}
