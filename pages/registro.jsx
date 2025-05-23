import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvayfpshgqyvzesrqmvn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52YXlmcHNoZ3F5dnplc3JxbXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTUyMTAsImV4cCI6MjA2MjIzMTIxMH0.8i9bBnupIXpsXoxQTtUXd8phhXteB_tNSRbICeNvQqM';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Registro() {
  const [tipo, setTipo] = useState('Servicio');
  const [carro, setCarro] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [necesitaFactura, setNecesitaFactura] = useState(false);
  const [folio, setFolio] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrando(true);

    const fecha = new Date().toISOString().split('T')[0];
    const subtotal = parseFloat(monto);
    const iva = necesitaFactura ? subtotal * 0.16 : 0;
    const total = subtotal + iva;

    const { data, error } = await supabase.from('notas').insert([
      {
        tipo,
        descripcion,
        monto: subtotal,
        necesita_factura: necesitaFactura,
        carro,
        fecha,
        total
      },
    ]).select();

    setRegistrando(false);

    if (error) {
      console.error(error);
      alert('Error registrando la nota');
    } else {
      const nuevoFolio = data[0]?.folio;
      setFolio(nuevoFolio || 'N/A');
    }
  };

  if (folio) {
    return (
      <div className="text-center p-8 bg-white text-black rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Nota registrada</h2>
        <p className="text-lg">Folio:</p>
        <p className="text-3xl font-bold text-green-700">{folio}</p>
        <button
          onClick={() => {
            setFolio(null);
            setTipo('Servicio');
            setDescripcion('');
            setMonto('');
            setCarro('');
            setNecesitaFactura(false);
          }}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Registrar otra nota
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white text-black p-6 rounded shadow"
    >
      <h1 className="text-xl font-bold mb-4 text-center">Registro de Nota</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-black">Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2"
            required
          >
            <option value="">Selecciona el tipo</option>
            <option value="Servicio">Servicio</option>
            <option value="Pieza">Pieza</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Carro:</label>
          <input
            type="text"
            value={carro}
            onChange={(e) => setCarro(e.target.value)}
            className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Descripción:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-black">Monto:</label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full bg-white text-black border border-gray-400 rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={necesitaFactura}
            onChange={(e) => setNecesitaFactura(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm text-black">
            ¿Necesita factura? (se suma IVA 16%)
          </label>
        </div>

        {necesitaFactura && monto && (
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-800">
            <p><strong>Subtotal:</strong> ${parseFloat(monto).toFixed(2)}</p>
            <p><strong>IVA (16%):</strong> ${(parseFloat(monto) * 0.16).toFixed(2)}</p>
            <p className="font-bold">
              <strong>Total:</strong> ${(parseFloat(monto) * 1.16).toFixed(2)}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={registrando}
        >
          {registrando ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}
