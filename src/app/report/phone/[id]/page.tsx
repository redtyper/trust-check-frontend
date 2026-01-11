import { checkCompany } from '../../../lib/api'; // Dostosuj liczbę kropek "../" w zależności od aliasów

import Link from 'next/link';

export default async function PhoneReportPage(props: { params: Promise<{ id: string }> }) {
  // 1. ODWINIEJ PROMISE
  const params = await props.params;
  const decodedPhone = decodeURIComponent(params.id);
  
  const data = await checkCompany(decodedPhone, 'PHONE');

  if (!data || data.error) {
    // ... (kod błędu taki sam jak wcześniej)
    return <div>Błąd...</div>; // Skrót
  }

  // Reszta kodu identyczna, tylko params.id nie jest już potrzebne bo mamy decodedPhone
  const score = data.trustScore;
  // ... (reszta kodu wyświetlania)
  
  // Skopiuj resztę z poprzedniego pliku, który Ci wysłałem, 
  // bo logika wyświetlania się nie zmienia, tylko sposób pobrania parametrów.
  
  let scoreColor = score < 50 ? 'text-red-500' : 'text-gray-300';
  if (score > 60) scoreColor = 'text-emerald-400';

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
        {/* ... CAŁA RESZTA HTML BEZ ZMIAN ... */}
        {/* ... (Wklej tu treść z poprzedniej odpowiedzi, bo jest dobra) ... */}
        <div className="max-w-4xl mx-auto">
             <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white mb-8">Wróć</Link>
             <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl mb-8">
                <h1 className="text-4xl md:text-5xl font-mono text-white tracking-tight">
                    {data.formatted || decodedPhone}
                </h1>
                {/* ... reszta HTML ... */}
             </div>
        </div>
    </main>
  );
}
