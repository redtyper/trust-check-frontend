import { checkCompany } from '../../../lib/api';
import Link from 'next/link';
import ReportButton from '../../../../components/ReportButton';

// Pomocnicza funkcja do wyciągania unikalnych danych z raportów
const getOsintData = (comments: any[]) => {
  const emails = new Set<string>();
  const fbs = new Set<string>();

  comments?.forEach(c => {
    if (c.reportedEmail) emails.add(c.reportedEmail);
    if (c.facebookLink) fbs.add(c.facebookLink);
  });

  return {
    emails: Array.from(emails),
    fbs: Array.from(fbs)
  };
};

export default async function PhoneReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const decodedPhone = decodeURIComponent(params.id);
  
  // Pobieramy dane (backend sam agreguje zgłoszenia dla tego numeru)
  const data = await checkCompany(decodedPhone, 'PHONE');

  if (!data || data.error) {
    return (
       <div className="min-h-screen bg-navy-900 text-white flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-crimson mb-2">Brak Danych</h1>
          <p className="text-slate-main">Numer {decodedPhone} nie posiada jeszcze historii.</p>
          <div className="mt-8">
             {/* Jeśli nie ma danych, od razu dajemy guzik do zgłoszenia */}
             <ReportButton defaultTargetType="PHONE" defaultValue={decodedPhone} />
          </div>
          <Link href="/" className="mt-4 text-sm text-slate-500 hover:text-white">Wróć</Link>
       </div>
    );
  }

  // Jeśli numer jest powiązany z firmą -> przekierowanie (zostawiamy tę logikę z poprzednich kroków)
  // (Opcjonalnie możesz tu wstawić redirect z 'next/navigation' jeśli chcesz wymusić)
  
  // Analiza danych
  const score = data.trustScore;
  const isSafe = score >= 70;
  const isCritical = score <= 30;
  const osint = getOsintData(data.community?.latestComments || []);
  const hasOsint = osint.emails.length > 0 || osint.fbs.length > 0;

  // Kolory
  const scoreColor = isSafe ? 'text-teal' : isCritical ? 'text-crimson' : 'text-orange-500';
  const borderColor = isSafe ? 'border-teal' : isCritical ? 'border-crimson' : 'border-orange-500';

  return (
    <main className="min-h-screen bg-navy-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <Link href="/" className="inline-flex items-center text-slate-main hover:text-white transition-colors text-sm font-mono">
          ← WRÓĆ DO WYSZUKIWANIA
        </Link>

        {/* GŁÓWNA KARTA */}
        <div className={`relative overflow-hidden bg-navy-800 rounded-3xl border ${borderColor} shadow-2xl`}>
          {/* Pasek boczny statusu */}
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${isSafe ? 'bg-teal' : isCritical ? 'bg-crimson' : 'bg-orange-500'}`} />
          
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start justify-between">
            
            {/* Lewa strona: Numer i Status */}
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

            {/* Prawa strona: Trust Score */}
            <div className="bg-navy-900/50 p-6 rounded-2xl border border-navy-700 text-center min-w-[140px]">
                 <div className={`text-5xl font-bold ${scoreColor} mb-1`}>{score}</div>
                 <div className="text-xs text-slate-main uppercase tracking-widest">Trust Score</div>
            </div>
          </div>

          {/* SEKJCA OSINT - POKAZUJEMY TYLKO JEŚLI SĄ DANE */}
          {hasOsint && (
            <div className="bg-navy-900/80 border-t border-navy-700 p-6 md:p-8 animate-in fade-in">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="text-blue-400">🕵️‍♂️</span> Zidentyfikowane Dane (OSINT)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {osint.emails.length > 0 && (
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Powiązane Emaile</span>
                            {osint.emails.map(email => (
                                <div key={email} className="bg-navy-800 border border-navy-600 px-3 py-2 rounded text-blue-300 font-mono text-sm mb-2 select-all">
                                    @{email}
                                </div>
                            ))}
                        </div>
                    )}
                    {osint.fbs.length > 0 && (
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-bold block mb-2">Profile Społecznościowe</span>
                            {osint.fbs.map(fb => (
                                <a key={fb} href={fb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800 px-3 py-2 rounded text-blue-200 text-sm mb-2 transition-colors">
                                    <span>🔗</span> {fb}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>

        {/* LISTA ZGŁOSZEŃ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Statystyki */}
          <div className="bg-navy-800 rounded-2xl p-6 border border-navy-700 h-fit">
            <h3 className="text-lg font-bold text-white mb-6">Podsumowanie</h3>
            <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-slate-400">Liczba zgłoszeń</span>
                    <span className="text-white font-mono">{data.community?.totalReports || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Ostrzeżenia (1-2★)</span>
                    <span className="text-crimson font-mono font-bold">{data.community?.alerts || 0}</span>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-navy-700">
                <p className="text-xs text-slate-500 mb-4 text-center">
                    Zostałeś oszukany przez ten numer?
                </p>
                <div className="flex justify-center">
                     <ReportButton defaultTargetType="PHONE" defaultValue={decodedPhone} />
                </div>
            </div>
          </div>

          {/* Oś Czasu (Komentarze) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Historia Aktywności</h3>
            
            {!data.community?.latestComments?.length ? (
              <div className="bg-navy-800/50 rounded-xl p-8 text-center text-slate-500 border border-navy-700 border-dashed">
                Ten numer jest czysty. Brak zgłoszeń w bazie.
              </div>
            ) : (
              data.community.latestComments.map((comment: any, idx: number) => (
                <div key={idx} className="bg-navy-800 p-6 rounded-xl border border-navy-700 relative group hover:border-navy-600 transition-colors">
                  
                  {/* Nagłówek Komentarza */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${comment.rating <= 2 ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-teal/10 text-teal border-teal/20'}`}>
                            {comment.reason}
                        </span>
                        {/* Gwiazdki */}
                        <div className="flex text-orange-500 text-xs">
                            {'★'.repeat(comment.rating || 1)}
                            <span className="text-navy-600">{'★'.repeat(5 - (comment.rating || 1))}</span>
                        </div>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {comment.date ? new Date(comment.date).toLocaleDateString() : 'Nieznana data'}
                    </span>
                  </div>

                  {/* Treść */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    "{comment.comment}"
                  </p>

                  {/* Dodatkowe Dowody w Komentarzu */}
                  {(comment.screenshotUrl || comment.facebookLink || comment.reportedEmail) && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-navy-700/50">
                          {comment.reportedEmail && (
                              <span className="text-xs bg-navy-900 text-blue-300 px-2 py-1 rounded border border-navy-700 flex items-center gap-1">
                                  📧 {comment.reportedEmail}
                              </span>
                          )}
                          {comment.facebookLink && (
                              <a href={comment.facebookLink} target="_blank" rel="noopener" className="text-xs bg-blue-900/20 hover:bg-blue-900/40 text-blue-200 px-2 py-1 rounded border border-blue-900/30 flex items-center gap-1 transition-colors">
                                  👤 Profil FB/OLX
                              </a>
                          )}
                          {comment.screenshotUrl && (
                              <a href={comment.screenshotUrl} target="_blank" rel="noopener" className="text-xs bg-purple-900/20 hover:bg-purple-900/40 text-purple-200 px-2 py-1 rounded border border-purple-900/30 flex items-center gap-1 transition-colors">
                                  📷 Zobacz Dowód (Screen)
                              </a>
                          )}
                      </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
