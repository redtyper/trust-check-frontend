'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const BACKEND_URL = 'http://127.0.0.1:3000';

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/verification/admin/companies`)
      .then(res => res.json())
      .then(data => {
        setCompanies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Ładowanie...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Panel Administratora</h1>
            <p className="text-gray-400 text-sm mt-1">Zarządzanie bazą firm</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white border border-gray-600 px-4 py-2 rounded">
            Wyjdź
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 border-b border-gray-700">NIP</th>
                <th className="p-4 border-b border-gray-700">Nazwa Firmy</th>
                <th className="p-4 border-b border-gray-700">Status VAT</th>
                <th className="p-4 border-b border-gray-700">Ryzyko</th>
                <th className="p-4 border-b border-gray-700 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {companies.map((company) => (
                <tr key={company.nip} className="hover:bg-gray-700/50 transition-colors group">
                  <td className="p-4 font-mono text-blue-300 font-bold">{company.nip}</td>
                  <td className="p-4 font-medium text-gray-200">{company.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${company.statusVat === 'Czynny' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
                      {company.statusVat || 'Nieznany'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{company.riskLevel}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/admin/edit/${company.nip}`}
                      className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
                    >
                      Edytuj
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {companies.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p>Brak firm w bazie danych.</p>
              <p className="text-sm mt-2">Wyszukaj firmę na stronie głównej, aby dodać ją do bazy.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
