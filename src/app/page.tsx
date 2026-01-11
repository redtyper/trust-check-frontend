'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const router = useRouter();

  // Animacja Placeholdera
  const placeholders = ["Wpisz numer telefonu...", "Wpisz numer NIP...", "Wklej numer konta..."];
  useEffect(() => {
    let i = 0;
    let charIndex = 0;
    let typing = true;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (typing) {
        if (charIndex <= placeholders[i].length) {
          setPlaceholder(placeholders[i].substring(0, charIndex));
          charIndex++;
          timeout = setTimeout(type, 50);
        } else {
          typing = false;
          timeout = setTimeout(type, 2000);
        }
      } else {
        if (charIndex >= 0) {
          setPlaceholder(placeholders[i].substring(0, charIndex));
          charIndex--;
          timeout = setTimeout(type, 30);
        } else {
          typing = true;
          i = (i + 1) % placeholders.length;
          timeout = setTimeout(type, 200);
        }
      }
    };
    type();
    return () => clearTimeout(timeout);
  }, []);

  // Smart Detection (Prosta wersja na frontendzie)
  useEffect(() => {
    const clean = query.replace(/[^a-zA-Z0-9]/g, '');
    if (/^\d{26}$/.test(clean) || /^\d{2}\s/.test(query)) setDetectedType('IBAN');
    else if (/^\d{10}$/.test(clean)) setDetectedType('NIP');
    else if (/^\d{9}$/.test(clean) || /^\+?48\d{9}$/.test(clean)) setDetectedType('PHONE');
    else if (clean.length > 3) setDetectedType('TEXT');
    else setDetectedType(null);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedType) return;
    
    // Prosty routing (rozbuduj wg potrzeb)
    if (detectedType === 'NIP') router.push(`/report/nip/${query.replace(/[^0-9]/g, '')}`);
    else if (detectedType === 'PHONE') router.push(`/report/phone/${encodeURIComponent(query)}`);
    else alert("Wykryto inny typ danych - wdrożenie wkrótce.");
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* TŁO - Live Threat Map (Symulacja wizualna) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-crimson rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-2/3 w-2 h-2 bg-crimson rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-teal rounded-full animate-pulse"></div>
        {/* Siatka tła zdefiniowana w tailwind config */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center space-y-12">
        
        {/* Nagłówek */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-navy-800 border border-navy-700 px-3 py-1 rounded-full text-xs font-mono text-teal">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
            </span>
            <span>SYSTEM ONLINE • BAZY ZAKTUALIZOWANE</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Verify<span className="text-teal">360</span> Intelligence
          </h1>
          <p className="text-slate-main text-lg max-w-xl mx-auto">
            Centralna platforma weryfikacji podmiotów, rachunków bankowych i numerów telefonów.
          </p>
        </div>

        {/* OMNI-SEARCH */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-navy-800 rounded-xl flex items-center p-2 shadow-2xl border border-navy-700">
            
            {/* Ikona Smart Detection */}
            <div className="w-16 flex justify-center items-center border-r border-navy-700 h-12 text-slate-main font-mono text-sm">
               {detectedType ? (
                 <span className="text-teal font-bold animate-pulse">{detectedType}</span>
               ) : (
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               )}
            </div>

            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="bg-transparent border-none text-white text-lg w-full px-6 py-4 focus:outline-none font-mono placeholder-slate-600"
              autoFocus
            />
            
            <button type="submit" className="bg-teal hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Skanuj
            </button>
          </div>
        </form>

        {/* Trust Signals */}
        <div className="pt-8 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Tu można wstawić SVG logotypów CEIDG, KRS, etc. Tekstowe dla uproszczenia: */}
          <span className="font-bold text-sm">CEIDG</span>
          <span className="font-bold text-sm">GUS / REGON</span>
          <span className="font-bold text-sm">CERT POLSKA</span>
          <span className="font-bold text-sm">BIAŁA LISTA VAT</span>
        </div>

      </div>
    </main>
  );
}
