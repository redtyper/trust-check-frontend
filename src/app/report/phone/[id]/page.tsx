import { checkCompany } from '../../../lib/api';
import Link from 'next/link';
import ReportButton from '../../../../components/ReportButton';

// Mapa tłumaczeń kodów na czytelne etykiety
const reasonMap: Record<string, string> = {
  'SCAM': '⚠️ Oszustwo / Wyłudzenie',
  'SPAM': '📞 Spam Telefoniczny',
  'TOWAR': '📦 Nieotrzymany Towar',
  'RODO': '🔒 Wyciek Danych / RODO',
  'OTHER': 'ℹ️ Inne'
};

const getOsintData = (comments: any[]) => {
  const emails = new Set<string>();
  const fbs = new Set<string>();
  const names = new Set<string>();
  const bankAccounts = new Set<string>();

  comments?.forEach(c => {
    if (c.reportedEmail) emails.add(c.reportedEmail);
    if (c.facebookLink) fbs.add(c.facebookLink);
    if (c.scammerName) names.add(c.scammerName);
    if (c.bankAccount) bankAccounts.add(c.bankAccount);
  });

  return {
    emails: Array.from(emails),
    fbs: Array.from(fbs),
    names: Array.from(names),
    bankAccounts: Array.from(bankAccounts)
  };
};


export default async function PhoneReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const decodedPhone = decodeURIComponent(params.id);
  
  // Ważne: Wymuszamy pobranie świeżych danych (bez cache), żeby zobaczyć nowe zgłoszenie od razu
  const data = await checkCompany(decodedPhone, 'PHONE');

  if (!data || data.error) {
    return (
       <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-crimson mb-2">Brak Danych</h1>
          <p className="text-slate-main">Numer {decodedPhone} nie posiada jeszcze historii.</p>
          <div className="mt-8">
             <ReportButton defaultTargetType="PHONE" defaultValue={decodedPhone} />
          </div>
          <Link href="/" className="mt-4 text-sm text-slate-500 hover:text-white">Wróć</Link>
       </div>
    );
  }

  const score = data.trustScore;
  const isSafe = score >= 70;
  const isCritical = score <= 30;
  const osint = getOsintData(data.community?.latestComments || []);
  const hasOsint = osint.emails.length > 0 || osint.fbs.length > 0;

  const scoreColor = isSafe ? 'text-teal' : isCritical ? 'text-crimson' : 'text-orange-500';
  const borderColor = isSafe ? 'border-teal' : isCritical ? 'border-crimson' : 'border-orange-500';

  return (
    <main className="min-h-screen bg-navy-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link href="/" className="inline-flex items-center text-slate-main hover:text-white transition-colors text-sm font-mono">
          ← WRÓĆ DO WYSZUKIWANIA
        </Link>

        {/* KARTA GŁÓWNA */}
        <div className={`relative overflow-hidden bg-navy-800 rounded-3xl border ${borderColor} shadow-2xl`}>
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${isSafe ? 'bg-teal' : isCritical ? 'bg-crimson' : 'bg-orange-500'}`} />
          
          <div className="p-8 flex flex-col md:flex-row gap-8 items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-main uppercase tracking-widest block mb-2">
                Raport Numeru
              </span>
              <h1 className="text-4xl md:text-5xl font-mono text-white tracking-tight mb-4">
                {data.query}
              </h1>
              <div className="flex flex-wrap gap-3">
                 <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${borderColor} bg-navy-900 ${scoreColor}`}>
                    RYZYKO: {data.riskLevel}
                 </span>
                 <span className="px-4 py-2 rounded-lg text-sm font-bold border border-navy-700 bg-navy-900 text-slate-400">
                    KRAJ: PL
                 </span>
              </div>
            </div>

            <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 text-center min-w-[140px]">
                 <div className={`text-5xl font-bold ${scoreColor} mb-1`}>{score}</div>
                 <div className="text-xs text-slate-main uppercase tracking-widest">Trust Score</div>
            </div>
          </div>

          {/* DANE OSINT */}
          {hasOsint && (
    <div className="bg-navy-900/80 border-t border-navy-700 p-6 md:p-8">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-blue-400">🕵️‍♂️</span> Zidentyfikowane Dane (OSINT)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Imiona oszustów */}
            {osint.names.length > 0 && (
                <div className="bg-navy-800 border border-navy-700 p-4 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-bold block mb-2">👤 Podejrzane Tożsamości</span>
                    {osint.names.map((name, i) => <div key={i} className="font-bold text-white">{name}</div>)}
                </div>
            )}

            {/* Konta bankowe */}
            {osint.bankAccounts.length > 0 && (
                <div className="bg-navy-800 border border-navy-700 p-4 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-bold block mb-2">💳 Konta Bankowe</span>
                    {osint.bankAccounts.map((acc, i) => (
                        <div key={i} className="font-mono text-crimson text-sm break-all">{acc}</div>
                    ))}
                </div>
            )}

            {/* Emaile */}
            {osint.emails.length > 0 && (
                <div className="bg-navy-800 border border-navy-700 p-4 rounded-lg">
                    <span className="text-xs text-slate-500 uppercase font-bold block mb-2">✉️ Adresy Email</span>
                    {osint.emails.map(e => <div key={e} className="font-mono text-teal text-sm">{e}</div>)}
                </div>
            )}

            {/* Profile */}
            {osint.fbs.length > 0 && (
                <div className="bg-navy-800 border border-navy-700 p-4 rounded-lg">
                     <span className="text-xs text-slate-500 uppercase font-bold block mb-2">🔗 Profile Społecznościowe</span>
                    {osint.fbs.map(link => (
                        <a key={link} href={link} target="_blank" className="block text-blue-400 hover:underline truncate text-sm">{link}</a>
                    ))}
                </div>
            )}
        </div>
    </div>
)}

          {/* ACTIONS */}
          <div className="bg-navy-900/30 p-4 flex justify-end border-t border-navy-700">
             <ReportButton defaultTargetType="PHONE" defaultValue={decodedPhone} />
          </div>
        </div>

        {/* LISTA ZGŁOSZEŃ */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Zgłoszenia Społeczności
                <span className="bg-navy-800 text-slate-main text-sm px-3 py-1 rounded-full border border-navy-700">
                    {data.community?.totalReports || 0}
                </span>
            </h2>

            {data.community?.latestComments && data.community.latestComments.length > 0 ? (
                <div className="grid gap-4">
                    {data.community.latestComments.map((comment, idx) => (
                        <div key={idx} className="bg-navy-800 border border-navy-700 p-6 rounded-xl shadow-lg">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                <div className="flex flex-col gap-2">
                                    {/* GWIAZDKI */}
                                    <div className="flex text-yellow-500 text-lg">
                                        {'★'.repeat(comment.rating || 1)}
                                        {'☆'.repeat(5 - (comment.rating || 1))}
                                    </div>
                                    
                                    {/* === TUTAJ DODALIŚMY WYŚWIETLANIE POWODU === */}
                                    <span className="inline-block bg-navy-900 border border-navy-600 text-slate-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide w-fit">
                                        {reasonMap[comment.reason] || comment.reason}
                                    </span>
                                </div>
                                <span className="text-slate-500 text-sm font-mono">
                                    {new Date(comment.date).toLocaleDateString('pl-PL')}
                                </span>
                            </div>

                            <p className="text-slate-200 leading-relaxed bg-navy-900/50 p-4 rounded-lg border border-navy-700/50">
                                "{comment.comment}"
                            </p>

                            {/* OSINT wewnątrz komentarza (jeśli ten konkretny zgłaszający podał dane) */}
                            {(comment.reportedEmail || comment.facebookLink) && (
                                <div className="mt-4 flex gap-3 text-xs pt-3 border-t border-navy-700/50">
                                    {comment.reportedEmail && (
                                        <span className="text-teal bg-teal/10 px-2 py-1 rounded">✉️ {comment.reportedEmail}</span>
                                    )}
                                    {comment.facebookLink && (
                                        <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded">👤 Profil FB/OLX</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-navy-700 rounded-xl">
                    <p className="text-slate-500">Brak zgłoszeń dla tego numeru. Bądź pierwszy!</p>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
