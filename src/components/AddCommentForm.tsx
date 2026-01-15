'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport, uploadScreenshot } from '../app/lib/api';

interface Props {
  targetType: 'COMPANY' | 'PERSON' | 'PHONE';
  targetValue: string;
}

export default function AddCommentForm({ targetType, targetValue }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Pola podstawowe
  const [reason, setReason] = useState('SCAM');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // OSINT - PEŁNE DANE
  const [phoneNumber, setPhoneNumber] = useState(''); // BRAKUJĄCE POLE
  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Musisz być zalogowany, aby dodać komentarz.');
        router.push('/login');
        return;
    }
    setLoading(true);

    try {
      let screenshotPath = undefined;
      if (file) {
        const res = await uploadScreenshot(file, token);
        screenshotPath = res.path;
      }

      // Backend fix: mapowanie PHONE -> PERSON
      const finalType = targetType === 'PHONE' ? 'PERSON' : targetType;

      const payload = {
        targetType: finalType,
        targetValue,
        rating,
        reason,
        comment,
        // Przekazujemy wszystkie pola OSINT
        phoneNumber: phoneNumber || undefined,
        reportedEmail: email || undefined,
        facebookLink: fbLink || undefined,
        bankAccount: bankAccount || undefined,
        screenshotPath,
      };

      const success = await submitReport(payload, token);
      if (success) {
        alert('Komentarz dodany!');
        // Reset formularza
        setComment('');
        setFile(null);
        setPhoneNumber('');
        setEmail('');
        setFbLink('');
        setBankAccount('');
        setIsOpen(false);
        window.location.reload();
      } else {
        alert('Błąd dodawania komentarza.');
      }
    } catch (e) {
      console.error(e);
      alert('Wystąpił błąd.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
      return (
          <button 
             onClick={() => setIsOpen(true)}
             className="w-full bg-navy-800 hover:bg-navy-700 border-2 border-dashed border-navy-600 text-slate-400 font-bold py-6 rounded-xl transition-all hover:text-white hover:border-teal flex flex-col items-center gap-2 group"
          >
             <span className="text-3xl group-hover:scale-110 transition-transform">➕</span>
             <span>Zostałeś też oszukany przez ten podmiot? Dodaj swoje zgłoszenie</span>
          </button>
      );
  }

  return (
    <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 shadow-xl animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-6 border-b border-navy-700 pb-4">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-crimson">⚠️</span> Dodaj Zgłoszenie do wątku
         </h3>
         <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white font-bold">ANULUJ ✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         
         {/* OCENA I POWÓD */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Powód</label>
                <select value={reason} onChange={e => setReason(e.target.value)}
                        className="w-full bg-navy-900 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-teal appearance-none cursor-pointer">
                    <option value="SCAM">⚠️ Oszustwo</option>
                    <option value="SPAM">📞 Spam</option>
                    <option value="TOWAR">📦 Brak Towaru</option>
                    <option value="OTHER">❓ Inne</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Ocena (1-5)</label>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(s => (
                       <button key={s} type="button" onClick={() => setRating(s)}
                               className={`flex-1 h-12 rounded-lg font-bold transition-all shadow-md ${rating === s ? 'bg-crimson text-white scale-105' : 'bg-navy-900 text-slate-600'}`}>
                           {s}
                       </button>
                   ))}
                </div>
            </div>
         </div>

         {/* OSINT (PEŁNE DANE + TELEFON) */}
         <div className="bg-navy-900/30 p-4 rounded-lg border border-navy-700/50 space-y-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                 <span>🕵️</span> Dodatkowe dane oszusta (OSINT)
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* NUMER TELEFONU */}
                 <div className="md:col-span-2">
                    <label className="block text-slate-main text-xs mb-1 font-bold text-teal">Numer Telefonu</label>
                    <input type="text" placeholder="Np. 500 600 700" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                           className="w-full bg-navy-900 border border-navy-600 rounded p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all font-mono" />
                 </div>

                 <div>
                    <label className="block text-slate-main text-xs mb-1">Adres E-mail</label>
                    <input type="text" placeholder="email@oszusta.pl" value={email} onChange={e => setEmail(e.target.value)}
                           className="w-full bg-navy-900 border-none rounded p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all" />
                 </div>
                 <div>
                    <label className="block text-slate-main text-xs mb-1">Link do profilu (FB/OLX)</label>
                    <input type="text" placeholder="https://..." value={fbLink} onChange={e => setFbLink(e.target.value)}
                           className="w-full bg-navy-900 border-none rounded p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-slate-main text-xs mb-1">Numer Konta Bankowego</label>
                    <input type="text" placeholder="PL 00 0000 0000..." value={bankAccount} onChange={e => setBankAccount(e.target.value)}
                           className="w-full bg-navy-900 border-none rounded p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all font-mono" />
                 </div>
             </div>
         </div>

         {/* OPIS */}
         <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Opis sytuacji *</label>
            <textarea required value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Opisz dokładnie co się stało..."
                      className="w-full bg-navy-900 border-none rounded-lg p-4 text-white min-h-[120px] focus:ring-2 focus:ring-teal placeholder-slate-600 resize-y" />
         </div>

         {/* UPLOAD */}
         <div className="flex items-center gap-4">
             <label className="flex-1 cursor-pointer bg-navy-900 hover:bg-navy-700 py-4 rounded-lg text-center text-slate-400 hover:text-white transition-colors border border-navy-600 border-dashed relative group">
                 <span className="group-hover:text-teal transition-colors font-bold flex items-center justify-center gap-2">
                    📸 {file ? file.name : 'Dodaj dowód (Zdjęcie)'}
                 </span>
                 <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
             </label>
             <button type="submit" disabled={loading}
                     className="flex-[2] bg-crimson hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-crimson/20 transition-all">
                 {loading ? 'WYSYŁANIE...' : 'OPUBLIKUJ ZGŁOSZENIE'}
             </button>
         </div>

      </form>
    </div>
  );
}
