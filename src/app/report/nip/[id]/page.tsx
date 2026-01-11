import { checkCompany } from '../../../lib/api'; // Dostosuj liczbę kropek "../" w zależności od aliasów
import Link from 'next/link';

// Zmieniamy typ propsów: params to Promise!
export default async function NipReportPage(props: { params: Promise<{ id: string }> }) {
  // 1. ODWINIEJ PROMISE (To jest ta zmiana)
  const params = await props.params;
  const id = params.id;

  // Dalej używamy już zmiennej 'id' zamiast 'params.id'
  const data = await checkCompany(id, 'NIP');

  if (!data || !data.company) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Nie znaleziono firmy</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          {/* Używamy 'id' */}
          NIP <span className="font-mono text-white">{id}</span> nie widnieje w bazie.
        </p>
        <Link href="/" className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
          Wróć do wyszukiwarki
        </Link>
      </div>
    );
  }

  // ... (reszta kodu bez zmian, tylko zamień params.id na id tam gdzie występuje)
  // Ale dla pewności, w sekcji wyświetlania NIPu:
  // <span className="font-mono text-lg text-gray-200">{id}</span>

  // Reszta kodu logiki kolorów i return...
  const score = data.trustScore;
  let scoreColor = 'text-red-500';
  let borderColor = 'border-red-500';
  let bgGradient = 'from-red-900/20 to-gray-900';

  if (score >= 80) {
    scoreColor = 'text-emerald-400';
    borderColor = 'border-emerald-500';
    bgGradient = 'from-emerald-900/20 to-gray-900';
  } else if (score >= 50) {
    scoreColor = 'text-yellow-400';
    borderColor = 'border-yellow-500';
    bgGradient = 'from-yellow-900/20 to-gray-900';
  }

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Wróć do wyszukiwania
        </Link>

        {/* GŁÓWNA KARTA */}
        <div className={`relative overflow-hidden bg-gray-800 rounded-3xl border-2 ${borderColor} shadow-2xl mb-8`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50`} />
          
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex flex-col items-center justify-center text-center md:w-1/3 min-w-[200px]">
              <div className="relative">
                <div className={`text-7xl font-black ${scoreColor} tracking-tighter`}>
                  {score}
                </div>
                <div className="text-sm uppercase tracking-widest text-gray-500 font-bold mt-1">Trust Score</div>
              </div>
              
              <div className={`mt-6 px-4 py-2 rounded-full bg-gray-900/50 border ${borderColor} backdrop-blur-sm`}>
                <span className={`font-bold ${scoreColor}`}>{data.riskLevel}</span>
              </div>
            </div>

            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-700 pt-8 md:pt-0 md:pl-12">
              <div className="mb-6">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">Zweryfikowana Firma</span>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{data.company.name}</h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">NIP</span>
                  <span className="font-mono text-lg text-gray-200">{id}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Status VAT</span>
                  <span className={`font-bold text-lg ${data.company.vat === 'Czynny' ? 'text-green-400' : 'text-gray-400'}`}>
                    {data.company.vat}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Źródło Danych</span>
                  <span className="text-gray-300 bg-gray-900 px-2 py-1 rounded text-sm border border-gray-700">
                    {data.source === 'CACHE_DB' ? 'Baza Lokalna' : 'Live API'}
                  </span>
                </div>
              </div>
              <div className="mt-8 border-t border-gray-700 pt-6">
  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
    Powiązane Numery Telefonów
  </span>
  
  {data.company.phones && data.company.phones.length > 0 ? (
    <div className="flex flex-wrap gap-3">
      {data.company.phones.map((phone: any) => (
        <Link 
          key={phone.number} 
          href={`/report/phone/${encodeURIComponent(phone.number)}`}
          className="group flex items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 hover:border-blue-500 transition-colors"
        >
          <span className="font-mono text-gray-300 group-hover:text-white transition-colors">
            {phone.number}
          </span>
          {/* Opcjonalnie: status telefonu */}
          {phone.trustScore < 50 && (
             <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Zgłoszony numer" />
          )}
        </Link>
      ))}
    </div>
  ) : (
    <div className="text-sm text-gray-600 italic">
      Brak numerów powiązanych z tą firmą w naszej bazie.
    </div>
  )}
</div>
            </div>
          </div>
        </div>

        {/* SEKCJA SPOŁECZNOŚCI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Raport Społeczności</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Liczba zgłoszeń</span>
              <span className="text-2xl font-bold text-white">{data.community?.totalReports || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ostrzeżenia</span>
              <span className="text-2xl font-bold text-red-500">{data.community?.alerts || 0}</span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Ostatnie Komentarze</h3>
            {!data.community?.latestComments?.length ? (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center text-gray-500 border border-gray-700 border-dashed">
                Brak zgłoszeń.
              </div>
            ) : (
              data.community.latestComments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-bold border border-red-900">
                      {comment.reason}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
