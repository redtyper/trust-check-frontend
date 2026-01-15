'use client';
import { useState } from 'react';

const BACKEND_URL = 'http://localhost:3001/'; 

export default function CommentsList({ comments }: { comments: any[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (!comments || comments.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-navy-700 rounded-xl">
            <p className="text-slate-500">Brak zgłoszeń. Bądź pierwszy!</p>
        </div>
      );
  }

  return (
    <>
      {/* LIGHTBOX */}
      {lightboxSrc && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="Dowód" className="max-w-full max-h-screen rounded shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-2xl font-bold p-2">✕</button>
        </div>
      )}

      {/* LISTA KOMENTARZY */}
      <div className="grid gap-6">
        {comments.map((c, idx) => (
          <div key={idx} className="bg-navy-900/50 p-6 rounded-xl border border-navy-700 hover:border-navy-600 transition-colors shadow-lg">
            
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                 <span className="font-mono text-xs text-slate-500">{new Date(c.date).toLocaleDateString()}</span>
                 <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                        c.rating <= 2 ? 'bg-crimson/20 text-crimson' : 'bg-teal/20 text-teal'
                    }`}>
                        {c.rating <= 2 ? 'NEGATYWNY' : 'POZYTYWNY'}
                    </span>
                    <span className="text-sm font-bold text-white">{c.reason}</span>
                 </div>
              </div>
            </div>
            
            {/* TREŚĆ */}
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {c.comment}
            </p>

            {/* ZDJĘCIE (JEŚLI JEST) */}
            {(c.screenshotPath || c.screenshotUrl) && (
              <div className="mt-4 pt-4 border-t border-navy-800">
                 <p className="text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">Załączony dowód</p>
                 <div 
                   className="relative group w-32 h-32 overflow-hidden rounded-lg border border-navy-600 cursor-zoom-in bg-navy-950"
                   onClick={() => setLightboxSrc(c.screenshotUrl || `${BACKEND_URL}${c.screenshotPath}`)}
                 >
                   <img 
                     src={c.screenshotUrl || `${BACKEND_URL}${c.screenshotPath}`} 
                     alt="Screenshot" 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                   />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold">POWIĘKSZ</span>
                   </div>
                 </div>
              </div>
            )}
            
           {/* OSINT INFO - POPRAWIONE WYŚWIETLANIE */}
            {(c.reportedEmail || c.facebookLink || c.phoneNumber || c.bankAccount) && (
                 <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-navy-800/50">
                    
                    {/* Numer Telefonu */}
                    {c.phoneNumber && (
                        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded px-2 py-1">
                            <span className="text-sm">📞</span>
                            <span className="text-xs font-mono text-teal-400 font-bold">{c.phoneNumber}</span>
                        </div>
                    )}

                    {/* Konto Bankowe */}
                    {c.bankAccount && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1">
                            <span className="text-sm">🏦</span>
                            <span className="text-xs font-mono text-yellow-500 font-bold">{c.bankAccount}</span>
                        </div>
                    )}

                    {/* Email */}
                    {c.reportedEmail && (
                        <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 flex items-center gap-1">
                            ✉️ {c.reportedEmail}
                        </span>
                    )}

                    {/* Link */}
                    {c.facebookLink && (
                        <a href={c.facebookLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20 hover:bg-indigo-400/20 flex items-center gap-1 transition-colors">
                            🔗 Profil
                        </a>
                    )}
                 </div>
            )}

          </div>
        ))}
      </div>
    </>
  );
}
