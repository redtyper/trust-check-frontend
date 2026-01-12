'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <--- IMPORT LINK
import { checkCompany, getRecentReports, RecentReport } from '@/app/lib/api';

const reasonIcons: Record<string, string> = {
  'SCAM': '⚠️', 'SPAM': '📞', 'TOWAR': '📦', 'RODO': '🔒', 'OTHER': 'ℹ️'
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // === NOWY STAN: CZY ZALOGOWANY? ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const router = useRouter();

  const placeholders = ["Wpisz numer telefonu...", "Wpisz numer NIP...", "Wklej numer konta..."];

  useEffect(() => {
    // 1. Pobierz raporty
    getRecentReports().then(data => setRecentReports(data));
    
    // 2. Sprawdź czy zalogowany
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  // Animacja pisania
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
        } else { typing = false; timeout = setTimeout(type, 2000); }
      } else {
        if (charIndex >= 0) {
          setPlaceholder(placeholders[i].substring(0, charIndex));
          charIndex--;
          timeout = setTimeout(type, 30);
        } else { typing = true; i = (i + 1) % placeholders.length; timeout = setTimeout(type, 200); }
      }
    };
    type();
    return () => clearTimeout(timeout);
  }, []);

  // Smart Detection
  useEffect(() => {
    const clean = query.replace(/[^a-zA-Z0-9]/g, '');
    if (/^\d{10}$/.test(clean)) setDetectedType('NIP');
    else if (/^\d{9}$/.test(clean) || /^\+?48\d{9}$/.test(clean)) setDetectedType('PHONE');
    else setDetectedType(null);
  }, [query]);

  const handleSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!detectedType) return;
      setIsSearching(true);
      try {
          const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '');
          const data = await checkCompany(cleanQuery, detectedType as 'NIP' | 'PHONE');
          if (data && data.company && detectedType === 'NIP') { router.push(`/report/nip/${data.company.nip}`); return; }
          if (data && detectedType === 'PHONE') {
               const hasReports = data.community && data.community.totalReports > 0;
               if (hasReports || (data.riskLevel !== 'Krytyczny (Nie istnieje)' && data.source !== 'ERROR')) {
                   router.push(`/report/phone/${encodeURIComponent(cleanQuery)}`);
                   return;
               }
          }
          router.push(`/report/new?value=${cleanQuery}&type=${detectedType}`);
      } catch (e) {
          router.push(`/report/new?value=${query}&type=${detectedType}`);
      }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      window.location.reload();
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center p-6 bg-navy-900">
      
      {/* === NOWY HEADER (NAVBAR) === */}
      <nav className="absolute top-0 right-0 left-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto w-full">
         <div className="text-xl font-bold font-mono tracking-tighter text-white opacity-50">
             V360
         </div>
         
         <div className="flex gap-4">
            {isLoggedIn ? (
                <>
                    <Link 
                        href="/report/new" 
                        className="bg-crimson hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-crimson/20 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <span>📢</span> DODAJ ZGŁOSZENIE
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white font-mono text-sm border border-navy-700 hover:border-slate-500 px-4 py-2 rounded-lg transition-colors"
                    >
                        WYLOGUJ
                    </button>
                </>
            ) : (
                <Link 
                    href="/login" 
                    className="bg-navy-800 hover:bg-navy-700 text-teal border border-teal font-bold py-2 px-6 rounded-lg transition-all"
                >
                    ZALOGUJ SIĘ
                </Link>
            )}
         </div>
      </nav>

      {/* TŁO */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center space-y-12 mt-12 md:mt-24">
        
        {/* HEADLINE */}
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

        {/* WYSZUKIWARKA */}
        <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-navy-800 rounded-xl flex items-center p-2 shadow-2xl border border-navy-700">
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
             <button type="submit" disabled={isSearching} className="bg-teal hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all">
                {isSearching ? '...' : 'Skanuj'}
            </button>
          </div>
        </form>

        {/* OSTATNIE ZGŁOSZENIA */}
        {recentReports.length > 0 && (
            <div className="pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-left text-xl font-bold text-white mb-6 flex items-center gap-2 px-4 max-w-5xl mx-auto">
                    <span className="text-crimson animate-pulse">●</span> Ostatnie alerty bezpieczeństwa
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
                    {recentReports.map((report) => (
                        <div 
                            key={report.id} 
                            onClick={() => {
                                const url = report.targetType === 'NIP' 
                                    ? `/report/nip/${report.targetValue}` 
                                    : `/report/phone/${encodeURIComponent(report.targetValue)}`;
                                router.push(url);
                            }}
                            className="bg-navy-800 border border-navy-700 p-5 rounded-xl hover:border-slate-500 cursor-pointer transition-all hover:-translate-y-1 shadow-lg group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`font-mono text-sm px-2 py-1 rounded ${report.targetType === 'NIP' ? 'bg-blue-900/50 text-blue-400' : 'bg-teal/20 text-teal'}`}>
                                    {report.targetType === 'NIP' ? 'FIRMA' : 'TELEFON'}
                                </span>
                                <span className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="font-bold text-lg text-white mb-1 font-mono truncate">
                                {report.targetValue}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-yellow-500 text-sm">{'★'.repeat(report.rating)}</span>
                                <span className="text-xs text-slate-400 border border-navy-600 px-1 rounded uppercase">
                                    {reasonIcons[report.reason] || ''} {report.reason}
                                </span>
                            </div>

                            <p className="text-slate-400 text-sm line-clamp-2 italic group-hover:text-slate-300 transition-colors">
                                "{report.comment}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* LOGOSY */}
        <div className="pt-8 flex flex-wrap justify-center gap-8 opacity-40 grayscale pb-12">
          <span className="font-bold text-sm">CEIDG</span>
          <span className="font-bold text-sm">GUS / REGON</span>
          <span className="font-bold text-sm">CERT POLSKA</span>
        </div>

      </div>
    </main>
  );
}
