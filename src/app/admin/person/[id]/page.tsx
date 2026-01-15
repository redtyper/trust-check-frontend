'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';

const BACKEND_URL = 'http://localhost:3001';

type AdminReport = {
  id: number;
  rating: number;
  reason: string;
  comment?: string | null;
  createdAt?: string;
  phoneNumber?: string | null;
  bankAccount?: string | null;
  reportedEmail?: string | null;
  facebookLink?: string | null;
};

export default function EditPersonPage() {
  const params = useParams();
  const id = params?.id ? String(params.id) : '';
  const router = useRouter();

  const [formData, setFormData] = useState<any>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!id) return;
    fetch(`${BACKEND_URL}/verification/admin/person/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(data);
        setReports(data?.reports || []);
      })
      .catch(() => {
        setMsg('Nie udało się pobrać danych osoby.');
        setMsgType('error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('Zapisywanie...');
    try {
      if (!id) {
        setMsg('Brak identyfikatora osoby.');
        setMsgType('error');
        return;
      }
      const res = await fetch(`${BACKEND_URL}/verification/admin/person/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bankAccount: formData.bankAccount,
          trustScore: formData.trustScore,
          riskLevel: formData.riskLevel,
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

  if (loading) return <div className="min-h-screen bg-[#050608] text-white p-8">Ładowanie...</div>;
  if (!formData) return <div className="min-h-screen bg-[#050608] text-white p-8">Nie znaleziono osoby.</div>;

  return (
    <main className="min-h-screen bg-[#050608] text-white px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Edycja osoby</div>
            <h1 className="text-3xl text-display text-white">{formData.name}</h1>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="rounded-full border border-[#2a2d31] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#8f949c] transition hover:border-[#c6a14b] hover:text-white"
          >
            Wróć do listy
          </button>
        </div>

        <div className="rounded-[32px] border border-[#1b1f24] bg-[#0b0d10] shadow-[0_28px_60px_rgba(0,0,0,0.55)]">
          <form onSubmit={handleSave} className="space-y-6 p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Imię i nazwisko / alias</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">E-mail</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@oszusta.pl"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Telefon</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+48500..."
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Konto bankowe</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.bankAccount || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="PL00 0000 ..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Trust score (0-100)</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-[#1f2328]"
                    value={formData.trustScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, trustScore: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    className="w-20 rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-2 text-center text-white"
                    value={formData.trustScore ?? 0}
                    onChange={(e) => setFormData({ ...formData, trustScore: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-[#8f949c]">Poziom ryzyka</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-[#2a2d31] bg-[#0f1114] p-3 text-white outline-none transition focus:border-[#c6a14b]"
                  value={formData.riskLevel || 'Nieznany'}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                >
                  <option>Bardzo niski</option>
                  <option>Niski</option>
                  <option>Sredni</option>
                  <option>Wysoki</option>
                  <option>Krytyczny</option>
                  <option>Nieznany</option>
                </select>
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
            <h3 className="text-sm uppercase tracking-[0.3em] text-[#8f949c]">Ostatnie zgłoszenia</h3>
            {reports.length > 0 ? (
              <div className="mt-4 space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-[#2a2d31] bg-[#0b0d10] p-3 text-sm text-[#d6dce4]">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#8f949c]">
                      <span>{r.reason}</span>
                      <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span>
                    </div>
                    <div className="mt-2 text-[#c6a14b]">Rating: {r.rating}</div>
                    {r.comment && <p className="mt-1 text-[#b0b5bc]">"{r.comment}"</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#8f949c]">
                      {r.phoneNumber && <span className="rounded-full border border-[#2a2d31] px-2 py-1">Tel: {r.phoneNumber}</span>}
                      {r.bankAccount && <span className="rounded-full border border-[#2a2d31] px-2 py-1">Konto: {r.bankAccount}</span>}
                      {r.reportedEmail && <span className="rounded-full border border-[#2a2d31] px-2 py-1">Email: {r.reportedEmail}</span>}
                      {r.facebookLink && <span className="rounded-full border border-[#2a2d31] px-2 py-1">Link: {r.facebookLink}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#8f949c]">Brak zgłoszeń.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
