'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = 'http://127.0.0.1:3000';

export default function EditCompanyPage({ params }: { params: Promise<{ nip: string }> }) {
  // Next.js 15: Odpakowujemy paramsy
  const { nip } = React.use(params);
  
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Do dodawania telefonu
  const [newPhone, setNewPhone] = useState('');

  // 1. Pobieranie danych
  const loadData = () => {
    fetch(`${BACKEND_URL}/verification/admin/company/${nip}`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setLoading(false);
      })
      .catch(() => alert('Błąd pobierania danych'));
  };

  useEffect(() => { loadData(); }, [nip]);

  // 2. Zapisywanie zmian
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Zapisywanie...');
    
    try {
      const res = await fetch(`${BACKEND_URL}/verification/admin/company/${nip}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.name,
            trustScore: Number(formData.trustScore),
            riskLevel: formData.riskLevel,
            statusVat: formData.statusVat
        }),
      });

      if (res.ok) {
        setMsg('Zapisano pomyślnie!');
        setMsgType('success');
        setTimeout(() => setMsg(''), 2000);
      } else {
        setMsg('Błąd zapisu.');
        setMsgType('error');
      }
    } catch {
      setMsg('Błąd sieci.');
      setMsgType('error');
    }
  };

  // 3. Dodawanie telefonu
  const handleAddPhone = async () => {
      if(!newPhone) return;
      
      // Prosta walidacja (dodaj plusa jeśli user zapomniał)
      let phoneToSend = newPhone.trim();
      if (!phoneToSend.startsWith('+')) phoneToSend = '+' + phoneToSend;

      try {
        const res = await fetch(`${BACKEND_URL}/verification/admin/link-phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip, phone: phoneToSend }),
        });
        
        if (res.ok) {
            alert('Numer dodany!');
            setNewPhone('');
            loadData(); // Odśwież dane bez przeładowania strony
        } else {
            alert('Błąd dodawania numeru');
        }
      } catch (e) {
          alert('Błąd sieci');
      }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Ładowanie...</div>;
  if (!formData) return <div className="min-h-screen bg-gray-900 text-white p-8">Nie znaleziono firmy.</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Edycja Firmy</h1>
                <p className="font-mono text-blue-400 mt-1">NIP: {nip}</p>
            </div>
            <button 
                onClick={() => router.push('/admin')} 
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 transition-colors"
            >
                ← Wróć do listy
            </button>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            
            {/* FORMULARZ GŁÓWNY */}
            <form onSubmit={handleSave} className="p-8 space-y-6">
                
                {/* Nazwa */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Nazwa Firmy</label>
                    <input 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status VAT */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Status VAT</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.statusVat}
                            onChange={e => setFormData({...formData, statusVat: e.target.value})}
                        >
                            <option value="Czynny">Czynny</option>
                            <option value="Zwolniony">Zwolniony</option>
                            <option value="Nieznany">Nieznany</option>
                            <option value="Wykreślony">Wykreślony</option>
                        </select>
                    </div>

                    {/* Ryzyko */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Poziom Ryzyka</label>
                        <select 
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={formData.riskLevel}
                            onChange={e => setFormData({...formData, riskLevel: e.target.value})}
                        >
                            <option>Bardzo Niski</option>
                            <option>Niski</option>
                            <option>Średni</option>
                            <option>Wysoki</option>
                            <option>Krytyczny</option>
                        </select>
                    </div>
                </div>

                {/* Trust Score */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Trust Score (0-100)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" min="0" max="100"
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            value={formData.trustScore}
                            onChange={e => setFormData({...formData, trustScore: e.target.value})}
                        />
                        <input 
                            type="number"
                            className="w-20 bg-gray-900 border border-gray-600 rounded-lg p-2 text-center text-white font-bold"
                            value={formData.trustScore}
                            onChange={e => setFormData({...formData, trustScore: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01]"
                    >
                        Zapisz Zmiany
                    </button>
                    {msg && (
                        <div className={`mt-4 p-3 rounded text-center font-bold ${msgType === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                            {msg}
                        </div>
                    )}
                </div>
            </form>

            {/* SEKCJA TELEFONÓW */}
            <div className="bg-gray-900/50 p-8 border-t border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Numery Telefonów
                </h3>
                
                {formData.phones && formData.phones.length > 0 ? (
                    <div className="space-y-3 mb-6">
                        {formData.phones.map((p: any) => (
                            <div key={p.number} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                                <span className="font-mono text-lg text-blue-300">{p.number}</span>
                                <span className="text-xs bg-gray-900 text-gray-500 px-2 py-1 rounded border border-gray-700">{p.countryCode}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic mb-6">Brak przypisanych numerów.</p>
                )}

                <div className="flex gap-3">
                    <input 
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Dodaj nowy numer (np. +48600...)"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                    />
                    <button 
                        onClick={handleAddPhone}
                        className="bg-green-600 hover:bg-green-500 px-6 rounded-lg text-white font-bold transition-colors"
                    >
                        Dodaj
                    </button>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}
