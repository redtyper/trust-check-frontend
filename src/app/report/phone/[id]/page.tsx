import React from 'react';
import Link from 'next/link';
import { checkCompany } from '../../../lib/api';
import CommentsList from '../../../../components/CommentsList';
import AddCommentForm from '../../../../components/AddCommentForm';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const rawInput = decodeURIComponent(params.id); 

  const data = await checkCompany(rawInput, 'PHONE');

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-400 mb-2">Nie znaleziono danych</h1>
        <p className="mb-6 text-slate-500">Brak historii dla tego numeru/osoby.</p>
        <Link href={`/report/new?value=${rawInput}&type=PHONE`} className="px-6 py-3 bg-crimson rounded-lg font-bold hover:bg-red-700 transition">
           + Dodaj pierwsze zgłoszenie
        </Link>
      </div>
    );
  }

  const isSafe = data.trustScore >= 70;
  const isCritical = data.trustScore <= 30;
  const borderColor = isSafe ? 'border-teal/30' : isCritical ? 'border-crimson/30' : 'border-orange-500/30';
  const statusBg = isSafe ? 'bg-teal/20 text-teal' : isCritical ? 'bg-crimson/20 text-crimson' : 'bg-orange-500/20 text-orange-500';

  const comments = data.community?.latestComments || [];

// TELEFONY – wszystkie unikalne z komentarzy
const osintPhones = Array.from(
  new Set(
    comments
      .map((c) => c.phoneNumber)
      .filter((p): p is string => !!p)
  )
);

// Jeśli to strona konkretnego numeru i nie ma go w OSINT, dodaj także główny numer strony
if (data.isPhone && !osintPhones.includes(data.query)) {
  osintPhones.unshift(data.query);
}

// POZOSTAŁE POLA – na razie po jednym (pierwsze wystąpienie)
const displayEmail = comments.find((c) => c.reportedEmail)?.reportedEmail;
const displayFb = comments.find((c) => c.facebookLink)?.facebookLink;
const displayBank = comments.find((c) => c.bankAccount)?.bankAccount;

const hasOsint = osintPhones.length > 0 || displayEmail || displayFb || displayBank;

  return (
    <div className="min-h-screen bg-navy-900 p-4 md:p-8 font-sans text-slate-main">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* NAV */}
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-sm font-mono text-slate-main hover:text-teal transition-colors flex items-center gap-2">
            ← POWRÓT DO SZUKANIA
          </Link>
          <div className="text-xs font-mono text-slate-main opacity-50">
            SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </nav>

        {/* GŁÓWNA KARTA */}
        <div className={`bg-navy-800 border ${borderColor} rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl`}>
          <div className={`absolute top-0 left-0 w-1.5 h-full ${isSafe ? 'bg-teal' : isCritical ? 'bg-crimson' : 'bg-orange-500'}`}></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="flex-1 w-full">
              
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2 break-all">
                        {data.query}
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-transparent ${statusBg}`}>
                        Ryzyko: {data.riskLevel}
                        </span>
                        <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-navy-900 border border-navy-700 text-slate-400">
                        Źródło: {data.source === 'DB' ? 'Baza Danych' : 'Nowy Zapis'}
                        </span>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-navy-700 bg-navy-900 shadow-inner">
                        <span className={`text-2xl font-bold ${isSafe ? 'text-teal' : 'text-crimson'}`}>{data.trustScore}</span>
                        <span className="text-[10px] uppercase text-slate-500 tracking-widest mt-1">Score</span>
                     </div>
                 </div>
              </div>

              {/* SEKCJA OSINT - WYŚWIETLANA ZAWSZE JEŚLI SĄ DANE */}
              {hasOsint && (
                  <div className="bg-navy-900/40 rounded-xl border border-navy-700/50 p-5 mb-6 backdrop-blur-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                          <span>🕵️</span> Znane Dane Kontaktowe (OSINT)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          
                         {/* TELEFONY */}
{osintPhones.length > 0 && (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-teal">📞</div>
    <div>
      <p className="text-xs text-slate-500 uppercase font-bold">
        Numery Telefonów
      </p>
      <div className="space-y-1">
        {osintPhones.map((phone) => (
          <p
            key={phone}
            className="text-white font-mono text-sm"
          >
            {phone}
          </p>
        ))}
      </div>
    </div>
  </div>
)}


                          {/* EMAIL */}
                          {displayEmail && (
                              <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-blue-400">✉️</div>
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">E-mail</p>
                                      <p className="text-white font-mono text-sm break-all">{displayEmail}</p>
                                  </div>
                              </div>
                          )}

                          {/* LINK */}
                          {displayFb && (
                              <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-blue-500">🔗</div>
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">Profil FB/OLX</p>
                                      <a href={displayFb} target="_blank" className="text-blue-400 hover:text-blue-300 text-sm break-all underline decoration-dotted">
                                          Zobacz profil
                                      </a>
                                  </div>
                              </div>
                          )}

                          {/* BANK */}
                          {displayBank && (
                              <div className="flex items-start gap-3 md:col-span-2 bg-navy-800/50 p-2 rounded-lg border border-navy-700/30">
                                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-yellow-500">🏦</div>
                                  <div>
                                      <p className="text-xs text-slate-500 uppercase font-bold">Numer Konta Bankowego</p>
                                      <p className="text-white font-mono text-sm tracking-wide break-all text-yellow-500/90">{displayBank}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* FIRMA (JEŚLI JEST) */}
              {data.company && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-900 border border-navy-700">
                      <span className="text-xl">🏢</span>
                      <div>
                          <p className="text-xs uppercase font-bold text-slate-500">Powiązana firma</p>
                          <div className="flex items-baseline gap-2">
                              <span className="text-white font-bold">{data.company.name}</span>
                              <span className="text-xs text-slate-400 font-mono">NIP: {data.company.nip}</span>
                          </div>
                      </div>
                  </div>
              )}

            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* LISTA ZGŁOSZEŃ */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-8 border-b border-navy-700 pb-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                <span>💬</span> Historia Zgłoszeń
            </h3>
            <span className="bg-navy-900 text-slate-300 px-3 py-1 rounded text-xs font-mono border border-navy-700">
              TOTAL: {data.community?.totalReports || 0}
            </span>
          </div>
          
          <CommentsList comments={comments} />
        </div>

        {/* FORMULARZ KOMENTARZA */}
        <div className="mt-8">
            <AddCommentForm targetType="PHONE" targetValue={data.query} />
        </div>

      </div>
    </div>
  );
}
