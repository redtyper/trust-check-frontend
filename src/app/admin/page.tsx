'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const BACKEND_URL = 'http://localhost:3001';

type PersonRow = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  bankAccount?: string | null;
  trustScore?: number | null;
  riskLevel?: string | null;
  reportsCount?: number;
  createdAt?: string;
};

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'people'>('companies');

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/verification/admin/companies`).then((res) => res.json()),
      fetch(`${BACKEND_URL}/verification/admin/persons`).then((res) => res.json()),
    ])
      .then(([companiesRes, personsRes]) => {
        setCompanies(companiesRes);
        setPeople(
          (personsRes || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            bankAccount: p.bankAccount,
            trustScore: p.trustScore,
            riskLevel: p.riskLevel,
            reportsCount: p._count?.reports,
            createdAt: p.createdAt,
          }))
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const highRiskCount = companies.filter((c) =>
    /(wysoki|krytyczny|niebezpieczny)/i.test((c.riskLevel || '').toLowerCase())
  ).length;
  const activeVatCount = companies.filter((c) => c.statusVat === 'Czynny').length;
  const latestUpdate = companies[0]?.updatedAt;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050608] text-white">
        <div className="text-sm uppercase tracking-[0.3em] text-[#9fa6b4]">Trawienie danych...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#050608] text-[#f3f4f6]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,161,75,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-10">
        <section className="rounded-[32px] border border-[#1b1f24] bg-[#0b0d10] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-[#b5bac5]">Panel administratora</div>
              <h1 className="text-3xl font-semibold text-white">Zgłoszenia: firmy i osoby</h1>
              <p className="mt-2 text-sm text-[#9fa6b4]">
                Oddzielny widok dla firm (NIP) i osób/telefonów. Edycja szczegółów firmy/osoby dostępna z poziomu listy.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-[#353841] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#9fa6b4] transition hover:border-[#c6a14b] hover:text-white"
            >
              Wyjdz
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Łącznie firm', value: companies.length },
              { label: 'Ryzyko wysokie', value: highRiskCount },
              { label: 'VAT czynny', value: activeVatCount },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-[#1f2328] bg-[#080a0c] p-4 text-sm">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#72767f]">{stat.label}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.4em] text-[#8f949c]">
            <span>Ostatnia aktualizacja: {latestUpdate ? new Date(latestUpdate).toLocaleString() : 'brak danych'}</span>
            <span>Premium access only</span>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#1b1f24] bg-[#0b0d10] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 rounded-full border border-[#1f2328] bg-[#0f1114] p-1 text-xs uppercase tracking-[0.3em] text-[#8f949c]">
              <button
                onClick={() => setActiveTab('companies')}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === 'companies' ? 'bg-[#c6a14b] text-[#0b0c0d]' : 'hover:text-white'
                }`}
              >
                Firmy (NIP)
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === 'people' ? 'bg-[#4bb08a] text-[#0b0c0d]' : 'hover:text-white'
                }`}
              >
                Osoby / Telefony
              </button>
            </div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
              Dane zgodne z backendem (osoby/telefony z bazy)
            </span>
          </div>

          {activeTab === 'companies' ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-[#1f2328]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#0e1015] text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
                  <tr>
                    <th className="p-4 text-left">NIP</th>
                    <th className="p-4 text-left">Nazwa</th>
                    <th className="p-4 text-left">Trust</th>
                    <th className="p-4 text-left">Status VAT</th>
                    <th className="p-4 text-left">Ryzyko</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2328]">
                  {companies.map((company) => (
                    <tr key={company.nip} className="border-b border-[#101214] hover:bg-[#13171c] transition">
                      <td className="p-4 font-mono text-[#f3f4f6]">{company.nip}</td>
                      <td className="p-4 text-[#d6dce4]">{company.name}</td>
                      <td className="p-4">
                        <span className="rounded-full border border-[#353841] bg-[#0f1114] px-3 py-1 text-[11px] font-semibold text-[#c6a14b]">
                          {company.trustScore ?? '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
                            company.statusVat === 'Czynny'
                              ? 'border-[#4bb08a]/40 text-[#4bb08a] bg-[#112520]'
                              : 'border-[#d96a5b]/40 text-[#d96a5b] bg-[#2a1512]'
                          }`}
                        >
                          {company.statusVat || 'Nieznany'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full border border-[#353841] bg-[#101214] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#d6dce4]">
                          {company.riskLevel || 'Brak danych'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/edit/${company.nip}`}
                          className="inline-flex rounded-full border border-[#353841] bg-[#c6a14b]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c6a14b]"
                        >
                          Edytuj
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {companies.length === 0 && (
                <div className="p-10 text-center text-sm text-[#8f949c]">Brak firm w bazie.</div>
              )}
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-3xl border border-[#1f2328]">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#0e1015] text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
                  <tr>
                    <th className="p-4 text-left">Osoba</th>
                    <th className="p-4 text-left">Trust</th>
                    <th className="p-4 text-left">Ryzyko</th>
                    <th className="p-4 text-left">Telefon</th>
                    <th className="p-4 text-left">Konto</th>
                    <th className="p-4 text-left">Zgl.</th>
                    <th className="p-4 text-right">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2328]">
                  {people.map((p) => (
                    <tr key={p.id} className="border-b border-[#101214] hover:bg-[#13171c] transition">
                      <td className="p-4 text-[#d6dce4]">{p.name}</td>
                      <td className="p-4">
                        <span className="rounded-full border border-[#353841] bg-[#0f1114] px-3 py-1 text-[11px] font-semibold text-[#c6a14b]">
                          {p.trustScore ?? '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full border border-[#353841] bg-[#101214] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#d6dce4]">
                          {p.riskLevel || 'Brak danych'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[#c6a14b]">{p.phone || '—'}</td>
                      <td className="p-4 font-mono text-[#8f949c]">{p.bankAccount || '—'}</td>
                      <td className="p-4 text-[#8f949c]">{p.reportsCount ?? '—'}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/person/${p.id}`}
                          className="inline-flex rounded-full border border-[#353841] bg-[#4bb08a]/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4bb08a]"
                        >
                          Edytuj
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {people.length === 0 && (
                <div className="p-10 text-center text-sm text-[#8f949c]">
                  Brak danych osób (backend udostępnia listę persons).
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[32px] border border-[#1b1f24] bg-[#0b0d10] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
          <div className="text-xs uppercase tracking-[0.35em] text-[#8f949c]">Narracja premium</div>
          <h2 className="mt-3 text-2xl text-white">Opowiedz o kazdej firmie</h2>
          <p className="mt-3 text-sm text-[#b0b5bc]">
            W panelu administracyjnym prowadz on-strategy pipeline. Aktualne dane, historie ryzyk i
            mozliwosc natychmiastowej reakcji decyduja o tym, czy zgloszenie zostanie zatwierdzone.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Weryfikacja', detail: 'Status VAT, trust score, powiazania' },
              { title: 'Score', detail: 'Aktualizuj ryzyko i notatki' },
              { title: 'Historia', detail: 'Przegladaj komentarze i ocen' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#353841] bg-[#050608] p-4 text-sm text-[#b0b5bc]"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">{item.title}</div>
                <div className="mt-2 text-white">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
