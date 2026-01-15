'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const BACKEND_URL = 'http://localhost:3001';

export default function EditCompanyPage({ params }: { params: Promise<{ nip: string }> }) {
  const { nip } = React.use(params);

  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const [newPhone, setNewPhone] = useState('');

  const loadData = () => {
    fetch(`${BACKEND_URL}/verification/admin/company/${nip}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setLoading(false);
      })
      .catch(() => alert('Blad pobierania danych'));
  };

  useEffect(() => {
    loadData();
  }, [nip]);

  const handleSave = async (e: FormEvent) => {
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
          statusVat: formData.statusVat,
          address: formData.address,
          regDate: formData.regDate,
          source: formData.source,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setMsg('Zapisano pomyslnie!');
        setMsgType('success');
        setTimeout(() => setMsg(''), 2000);
      } else {
        setMsg('Blad zapisu.');
        setMsgType('error');
      }
    } catch {
      setMsg('Blad sieci.');
      setMsgType('error');
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone) return;

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
        loadData();
      } else {
        alert('Blad dodawania numeru');
      }
    } catch (e) {
      alert('Blad sieci');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050608] text-white p-8">Ladowanie...</div>;
  if (!formData) return <div className="min-h-screen bg-[#050608] text-white p-8">Nie znaleziono firmy.</div>;

  return (
    <main className="min-h-screen bg-[#050608] text-white px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Edycja firmy</div>
            <h1 className="text-3xl text-display text-white">NIP: {nip}</h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="rounded-full border border-[#2a2d31] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#8f949c] transition hover:border-[#c6a14b] hover:text-white"
          >
            Wroc do listy
          </button>
        </div>

        <div className="rounded-[32px] border border-[#1b1f24] bg-[#0b0d10] shadow-[0_28px_60px_rgba(0,0,0,0.55)]">
          <form onSubmit={handleSave} className="space-y-6 p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Nazwa firmy</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Status VAT</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.statusVat || 'Nieznany'}
                  onChange={(e) => setFormData({ ...formData, statusVat: e.target.value })}
                >
                  <option value="Czynny">Czynny</option>
                  <option value="Zwolniony">Zwolniony</option>
                  <option value="Nieznany">Nieznany</option>
                  <option value="Wykreslony">Wykreslony</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Poziom ryzyka</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.riskLevel || 'Sredni'}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                >
                  <option>Bardzo niski</option>
                  <option>Niski</option>
                  <option>Sredni</option>
                  <option>Wysoki</option>
                  <option>Krytyczny</option>
                  <option>Krytyczny (Nie istnieje)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Trust score (0-100)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-[#1f2328]"
                    value={formData.trustScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, trustScore: e.target.value })}
                  />
                  <input
                    type="number"
                    className="w-20 rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-2 text-center text-white"
                    value={formData.trustScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, trustScore: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Adres</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Data rejestracji</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.regDate || ''}
                  onChange={(e) => setFormData({ ...formData, regDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Źródło</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="DB / OSINT / manual"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Notatka admina</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="np. powiązać z profilem X"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c6a14b] py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0b0c0d] transition hover:-translate-y-0.5"
              >
                Zapisz zmiany
              </button>
              {msg && (
                <div
                  className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
                    msgType === 'success' ? 'bg-[#112520] text-[#4bb08a]' : 'bg-[#2a1512] text-[#d96a5b]'
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
          </form>

          <div className="border-t border-[#1f2328] bg-[#0f1114] p-8">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[#8f949c]">Numery telefonow</h3>

            {formData.phones && formData.phones.length > 0 ? (
              <div className="mt-4 space-y-3">
                {formData.phones.map((p: any) => (
                  <div
                    key={p.number}
                    className="flex items-center justify-between rounded-2xl border border-[#2a2d31] bg-[#0b0d10] p-3"
                  >
                    <span className="font-mono text-sm text-[#c6a14b]">{p.number}</span>
                    <span className="rounded-full border border-[#2a2d31] px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-[#8f949c]">
                      {p.countryCode}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#8f949c]">Brak przypisanych numerow.</p>
            )}

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                className="flex-1 rounded-2xl border border-[#2a2d31] bg-[#0b0d10] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                placeholder="Dodaj nowy numer (np. +48600...)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <button
                onClick={handleAddPhone}
                className="rounded-2xl bg-[#4bb08a] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0b0c0d] transition hover:-translate-y-0.5"
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
