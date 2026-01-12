import { checkCompany } from '../../../lib/api'; // Dostosuj liczbę kropek "../" w zależności od aliasów
import Link from 'next/link';
import ReportButton from '@/components/ReportButton';
// === KOMPONENTY UI ===

// Wykres kołowy (Gauge)
const TrustScoreGauge = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let color = '#D92D20'; // Crimson
  if (score >= 50) color = '#F79009'; // Orange
  if (score >= 80) color = '#027A48'; // Teal

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle cx="50%" cy="50%" r={radius} stroke="#153152" strokeWidth="6" fill="transparent" />
        <circle 
          cx="50%" cy="50%" r={radius} 
          stroke={color} 
          strokeWidth="6" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-out" 
        />
      </svg>
      <div className="absolute text-center flex flex-col items-center">
        <span className="text-3xl font-bold text-white font-mono">{score}</span>
      </div>
    </div>
  );
};

// === STRONA RAPORTU ===

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const nip = params.id;
  
  // Używamy checkCompany zamiast checkVat
  const data = await checkCompany(nip, 'NIP'); 
  
  if (!data || data.error || !data.company) {
      return (
        <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold text-crimson mb-2">Nie znaleziono podmiotu</h1>
            <p className="text-slate-main">NIP: {nip}</p>
            <Link href="/" className="mt-6 px-4 py-2 bg-navy-800 border border-navy-700 rounded hover:bg-navy-700">
                Wróć do wyszukiwania
            </Link>
        </div>
      )
  }

  const isSafe = data.trustScore >= 70;
  const isCritical = data.trustScore <= 30;

  // Logika kolorów (używamy zmiennych z CSS Tailwind v4)
  const borderColor = isSafe ? 'border-teal/30' : isCritical ? 'border-crimson/30' : 'border-orange-500/30';
  const statusBg = isSafe ? 'bg-teal/20 text-teal' : isCritical ? 'bg-crimson/20 text-crimson' : 'bg-orange-500/20 text-orange-500';

  return (
    <div className="min-h-screen bg-navy-900 p-4 md:p-8 font-sans text-slate-main">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* NAV */}
        <nav className="flex items-center justify-between">
            <Link href="/" className="text-sm font-mono text-slate-main hover:text-teal transition-colors flex items-center gap-2">
            ← POWRÓT DO SZUKANIA
            </Link>
            <div className="text-xs font-mono text-slate-main opacity-50">
                SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
        </nav>

        {/* === BENTO GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* SEKCJA 1: GŁÓWNA KARTA PODMIOTU */}
          <div className={`col-span-1 md:col-span-8 bg-navy-800 border ${borderColor} rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${isSafe ? 'bg-teal' : 'bg-crimson'}`}></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-3">
                   <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                     {data.company.name}
                   </h1>
                 </div>
                 
                 <div className="flex flex-wrap gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-transparent ${statusBg}`}>
                        {data.riskLevel}
                    </span>
                    <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-navy-900 border border-navy-700 text-slate-400">
                        ŹRÓDŁO: {data.source}
                    </span>
                 </div>

                 <div className="space-y-1 font-mono text-sm">
                    <p>NIP: <span className="text-white select-all">{data.query}</span></p>
                    <p>ADRES: <span className="text-white">{data.company.address || 'Brak danych adresowych'}</span></p>
                 </div>
              </div>

              <div className="hidden md:flex flex-col items-center bg-navy-900/50 p-4 rounded-xl border border-navy-700">
                 <TrustScoreGauge score={data.trustScore} />
                 <span className="text-[10px] font-bold text-slate-main tracking-[0.2em] uppercase mt-[-10px]">Trust Score</span>
              </div>
            </div>
          </div>

          {/* SEKCJA 2: STATUS PRAWNY */}
          <div className="col-span-1 md:col-span-4 bg-navy-800 border border-navy-700 rounded-2xl p-6 flex flex-col justify-center">
             <h3 className="text-slate-main text-xs uppercase font-bold tracking-widest mb-6 border-b border-navy-700 pb-2">STATUS PRAWNY</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm">Status VAT</span>
                    <span className={`font-mono font-bold ${data.company.vat === 'Czynny' ? 'text-teal' : 'text-crimson'}`}>
                        {data.company.vat}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">Data Rejestracji</span>
                    <span className="text-white font-mono text-sm">{data.company.regDate || '2023-01-01'}</span>
                </div>
             </div>
          </div>

          {/* SEKCJA 3: TELEFONY */}
          <div className="col-span-1 md:col-span-4 bg-navy-800 border border-navy-700 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="text-teal">#</span> Kontakty
            </h3>
            <div className="space-y-2">
                 {data.company.phones && data.company.phones.length > 0 ? (
                   data.company.phones.map((p) => (
                     <Link key={p.number} href={`/report/phone/${encodeURIComponent(p.number.replace(/\s/g, ''))}`} 
                        className="group flex justify-between items-center bg-navy-900 hover:bg-navy-700 border border-navy-700 p-3 rounded-lg transition-all cursor-pointer">
                       <span className="font-mono text-teal text-sm group-hover:text-white transition-colors">
                            {p.number}
                       </span>
                     </Link>
                   ))
                 ) : (
                   <div className="text-slate-main text-sm italic p-4 text-center border border-dashed border-navy-700 rounded-lg">
                       Brak numerów publicznych.
                   </div>
                 )}
            </div>
          </div>

          {/* SEKCJA 4: SPOŁECZNOŚĆ */}
          <div className="col-span-1 md:col-span-8 bg-navy-800 border border-navy-700 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-white font-bold text-sm uppercase tracking-wider">Analiza Zgłoszeń</h3>
                 <span className="bg-navy-900 text-slate-300 px-3 py-1 rounded text-xs font-mono border border-navy-700">
                    TOTAL: {data.community?.totalReports || 0}
                 </span>
              </div>

              <div className="space-y-3">
                 {data.community?.latestComments && data.community.latestComments.length > 0 ? (
                    data.community.latestComments.map((c, idx) => (
                      <div key={idx} className="bg-navy-900/50 p-4 rounded-lg border-l-2 border-crimson">
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span className="font-mono">{c.date || 'Dzisiaj'}</span>
                          <span className="text-crimson font-bold bg-crimson/10 px-2 rounded">{c.reason}</span>
                        </div>
                        <p className="text-sm text-slate-300">"{c.comment}"</p>
                      </div>
                    ))
                 ) : (
                   <div className="text-center py-6 text-slate-main text-sm">
                     Brak negatywnych zgłoszeń w bazie.
                   </div>
                 )}
              </div>
            </div>
            {/* SEKCJA ACTION (Stopka) */}
<div className="col-span-1 md:col-span-12 flex justify-end pt-4">
<ReportButton defaultTargetType="NIP" defaultValue={data.query} />
</div>

        </div>
      </div>
    </div>
  );
}
