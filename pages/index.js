import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvayfpshgqyvzesrqmvn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52YXlmcHNoZ3F5dnplc3JxbXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTUyMTAsImV4cCI6MjA2MjIzMTIxMH0.8i9bBnupIXpsXoxQTtUXd8phhXteB_tNSRbICeNvQqM'; // reemplaza por tu clave real
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [tipo, setTipo] = useState('Servicio');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [necesitaFactura, setNecesitaFactura] = useState(false);
  const [carro, setCarro] = useState('');
  const [folio, setFolio] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

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

    if (error) {
      alert('Error registrando la nota');
      console.error(error);
    } else {
      const folioGenerado = data[0]?.folio;
      setFolio(folioGenerado || 'N/A');
    }

    setEnviando(false);
  };

  if (folio) {
    return (
      <div className="p-8 text-center bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Nota registrada</h2>
        <p className="text-lg">Folio:</p>
        <p className="text-3xl font-bold text-green-600">{folio}</p>
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Registro de Nota</h1>

      <label className="block mb-1 font-medium">Tipo:</label>
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full border px-3 py-2 mb-4 rounded"
      >
        <option>Servicio</option>
        <option>Pieza</option>
      </select>

      <label className="block mb-1 font-medium">Carro:</label>
      <input
        type="text"
        value={carro}
        onChange={(e) => setCarro(e.target.value)}
        required
        className="w-full border px-3 py-2 mb-4 rounded"
      />

      <label className="block mb-1 font-medium">Descripción:</label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
        className="w-full border px-3 py-2 mb-4 rounded"
      />

      <label className="block mb-1 font-medium">Monto:</label>
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        required
        className="w-full border px-3 py-2 mb-4 rounded"
      />

      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={necesitaFactura}
          onChange={(e) => setNecesitaFactura(e.target.checked)}
          className="mr-2"
        />
        ¿Necesita factura? (se suma IVA 16%)
      </label>

      {necesitaFactura && monto && (
        <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-gray-800">
          <p><strong>Subtotal:</strong> ${parseFloat(monto).toFixed(2)}</p>
          <p><strong>IVA (16%):</strong> ${(parseFloat(monto) * 0.16).toFixed(2)}</p>
          <p className="font-bold"><strong>Total:</strong> ${(parseFloat(monto) * 1.16).toFixed(2)}</p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
        disabled={enviando}
      >
        {enviando ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}
