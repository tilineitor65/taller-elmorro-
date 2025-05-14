import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvayfpshgqyvzesrqmvn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52YXlmcHNoZ3F5dnplc3JxbXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTUyMTAsImV4cCI6MjA2MjIzMTIxMH0.8i9bBnupIXpsXoxQTtUXd8phhXteB_tNSRbICeNvQqM'; // tu clave pública
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegistroNota() {
  const [tipo, setTipo] = useState('Servicio');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [necesitaFactura, setNecesitaFactura] = useState(false);
  const [folio, setFolio] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const montoFinal = necesitaFactura
      ? parseFloat(monto) * 1.16
      : parseFloat(monto);

    const { data, error } = await supabase
      .from('notas')
      .insert([
        {
          tipo,
          descripcion,
          monto: montoFinal,
          necesita_factura: necesitaFactura,
          fecha: new Date(),
        },
      ])
      .select();

    if (error) {
      console.error(error);
      alert(`Error registrando la nota: ${error.message}`);
      setLoading(false);
      return;
    }

    const nuevaNota = data[0];
    const { data: notaActualizada, error: errorFetch } = await supabase
      .from('notas')
      .select('folio')
      .eq('id', nuevaNota.id)
      .single();

    setLoading(false);

    if (errorFetch) {
      console.error(errorFetch);
      alert('Nota registrada pero no se pudo obtener el folio');
    } else {
      setFolio(notaActualizada.folio);
    }
  };

  const resetFormulario = () => {
    setTipo('Servicio');
    setDescripcion('');
    setMonto('');
    setNecesitaFactura(false);
    setFolio(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Registro de Nota</h2>

        {folio ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-green-600">¡Nota registrada exitosamente!</p>
            <p className="text-3xl font-bold text-green-600">{folio}</p>
            <button
              onClick={resetFormulario}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Registrar otra nota
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
            <div>
              <label className="block mb-1 font-medium">Tipo:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Servicio">Servicio</option>
                <option value="Pieza">Pieza</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Descripción:</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Monto:</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
{necesitaFactura && monto && (
  <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700">
    <p><strong>Subtotal:</strong> ${parseFloat(monto).toFixed(2)}</p>
    <p><strong>IVA (16%):</strong> ${(parseFloat(monto) * 0.16).toFixed(2)}</p>
    <p className="font-bold"><strong>Total:</strong> ${(parseFloat(monto) * 1.16).toFixed(2)}</p>
  </div>
)}

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={necesitaFactura}
                onChange={(e) => setNecesitaFactura(e.target.checked)}
                className="mr-2"
              />
              <label className="text-gray-800">¿Necesita factura? (se suma IVA 16%)</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
