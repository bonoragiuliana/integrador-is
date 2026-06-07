import { QrCode } from 'lucide-react';

export default function QrScanner() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Escanear Código QR</h1>
        <p className="text-gray-500 text-sm mt-1">Simulador de escaneo de máquinas.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-6">
          <QrCode className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Simulador de Cámara</h2>
        <p className="text-gray-500 mt-2">Acá implementaremos el lector QR o un campo para ingresar el ID de la máquina manualmente.</p>
        <button className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed">
          Activar Cámara
        </button>
      </div>
    </div>
  );
}
