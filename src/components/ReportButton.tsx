'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport, uploadScreenshot } from '../app/lib/api';

interface ReportButtonProps {
  defaultTargetType?: 'NIP' | 'PHONE' | 'PERSON';
  defaultValue?: string; 
}

export default function ReportButton({ defaultTargetType = 'NIP', defaultValue = '' }: ReportButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // GŁÓWNY TRYB: COMPANY lub PERSON
  const [reportType, setReportType] = useState<'COMPANY' | 'PERSON'>('COMPANY');

  // AUTOMATYCZNE USTAWIANIE TRYBU NA STARCIE
  useEffect(() => {
    if (defaultTargetType === 'NIP') setReportType('COMPANY');
    else setReportType('PERSON'); // PHONE i PERSON wpadają tutaj
  }, [defaultTargetType]);

  // POLA DANYCH (Wspólny stan, używany zależnie od trybu)
  const [nip, setNip] = useState(defaultTargetType === 'NIP' ? defaultValue : '');
  const [companyName, setCompanyName] = useState('');
  
  const [personName, setPersonName] = useState(defaultTargetType === 'PERSON' ? defaultValue : '');
  // Jeśli weszliśmy z widoku telefonu, ustawiamy telefon
  const [phoneNumber, setPhoneNumber] = useState(defaultTargetType === 'PHONE' ? defaultValue : '');
  
  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  
  const [reason, setReason] = useState('SCAM');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz być zalogowany.');
      router.push('/login');
      return;
    }

    try {
      let uploadedPath = undefined;
      if (file) {
          const res = await uploadScreenshot(file, token);
          uploadedPath = res.path;
      }

      // Budujemy payload
      const payload: any = {
        targetType: reportType,
        rating,
        reason,
        comment,
        phoneNumber: phoneNumber || undefined,
        reportedEmail: email || undefined,
        facebookLink: fbLink || undefined,
        bankAccount: bankAccount || undefined,
        screenshotPath: uploadedPath,
      };

      if (reportType === 'COMPANY') {
         if (!nip) { alert('Podaj NIP!'); setLoading(false); return; }
         payload.targetValue = nip;
         payload.scammerName = companyName; // Używamy pola scammerName jako nazwy firmy w DTO
      } else {
         // Dla PERSON wymagane jest imię LUB telefon
         if (!personName && !phoneNumber) { alert('Podaj Imię/Alias lub Telefon!'); setLoading(false); return; }
         payload.targetValue = personName || phoneNumber; // Główne ID
         payload.scammerName = personName;
      }

      const success = await submitReport(payload, token);
      if (success) {
        alert('Zgłoszenie dodane!');
        setIsOpen(false);
        window.location.reload();
      } else {
        alert('Błąd wysyłania.');
      }
    } catch (e) {
      console.error(e);
      alert('Wystąpił błąd.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-crimson hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:scale-105 transition-all z-40 flex gap-2"
      >
        🚨 ZGŁOŚ OSZUSTA
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/90 backdrop-blur-sm">
          <div className="bg-navy-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-navy-700 flex flex-col max-h-[90vh]">
            
            {/* NAGŁÓWEK */}
            <div className="p-4 border-b border-navy-700 flex justify-between items-center bg-navy-900/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Nowe Zgłoszenie</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* ZAKŁADKI GŁÓWNE */}
            <div className="flex border-b border-navy-700">
              <button
                onClick={() => setReportType('COMPANY')}
                className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm transition-colors ${
                  reportType === 'COMPANY' ? 'bg-navy-800 text-teal border-b-2 border-teal' : 'bg-navy-900 text-slate-500'
                }`}
              >
                🏢 Firma (NIP)
              </button>
              <button
                onClick={() => setReportType('PERSON')}
                className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm transition-colors ${
                  reportType === 'PERSON' ? 'bg-navy-800 text-teal border-b-2 border-teal' : 'bg-navy-900 text-slate-500'
                }`}
              >
                👤 Osoba Prywatna
              </button>
            </div>

            {/* FORMULARZ */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* DANE IDENTYFIKACYJNE - ZALEŻNE OD TYPU */}
                <div className="bg-navy-900/50 p-4 rounded-xl border border-navy-700 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">
                        {reportType === 'COMPANY' ? 'Dane Firmy' : 'Dane Oszusta'}
                    </h3>

                    {reportType === 'COMPANY' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-main text-xs mb-1">Numer NIP *</label>
                                <input required type="text" maxLength={10} value={nip} onChange={e => setNip(e.target.value)} 
                                       className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="0000000000" />
                            </div>
                            <div>
                                <label className="block text-slate-main text-xs mb-1">Nazwa Firmy (Opcjonalnie)</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} 
                                       className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="Nazwa firmy" />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-main text-xs mb-1">Imię i Nazwisko / Alias</label>
                                <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} 
                                       className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="Jan Kowalski" />
                            </div>
                            <div>
                                {/* Telefon dla osoby jest tu */}
                                <label className="block text-slate-main text-xs mb-1">Numer Telefonu</label>
                                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} 
                                       className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="500600700" />
                            </div>
                        </div>
                    )}
                </div>

                {/* DANE KONTAKTOWE (WSPÓLNE) */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Dodatkowe Informacje (OSINT)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportType === 'COMPANY' && (
                             <div>
                                <label className="block text-slate-main text-xs mb-1">Telefon Firmowy</label>
                                <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} 
                                       className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="Numer telefonu" />
                             </div>
                        )}
                        <div>
                            <label className="block text-slate-main text-xs mb-1">Adres E-mail</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} 
                                   className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="email@example.com" />
                        </div>
                        <div>
                            <label className="block text-slate-main text-xs mb-1">Link do profilu (FB/OLX/WWW)</label>
                            <input type="text" value={fbLink} onChange={e => setFbLink(e.target.value)} 
                                   className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-slate-main text-xs mb-1">Numer Konta Bankowego</label>
                            <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} 
                                   className="w-full bg-navy-900 border border-navy-600 rounded p-2 text-white" placeholder="PL 00 0000..." />
                        </div>
                    </div>
                </div>

                {/* OCENA I OPIS */}
                <div className="pt-4 border-t border-navy-700 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-slate-main text-xs uppercase font-bold mb-2">Powód</label>
                            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-navy-900 border border-navy-600 rounded p-3 text-white">
                                <option value="SCAM">Oszustwo / Wyłudzenie</option>
                                <option value="SPAM">Spam</option>
                                <option value="TOWAR">Brak Towaru</option>
                                <option value="OTHER">Inne</option>
                            </select>
                        </div>
                        <div className="flex-1">
                             <label className="block text-slate-main text-xs uppercase font-bold mb-2">Ocena</label>
                             <div className="flex gap-1 h-[46px]">
                                {[1,2,3,4,5].map(s => (
                                    <button key={s} type="button" onClick={() => setRating(s)} 
                                            className={`flex-1 rounded font-bold ${rating === s ? 'bg-crimson text-white' : 'bg-navy-900 text-slate-600'}`}>
                                        {s}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Opis Sytuacji *</label>
                        <textarea required value={comment} onChange={e => setComment(e.target.value)} 
                                  className="w-full bg-navy-900 border border-navy-600 rounded p-3 text-white min-h-[100px]" placeholder="Opisz dokładnie zdarzenie..." />
                    </div>

                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Dowód (Screenshot)</label>
                        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} 
                               className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-navy-700 file:text-white hover:file:bg-navy-600" />
                    </div>
                </div>

                {/* BUTTONY */}
                <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 border border-navy-600 rounded-xl text-slate-400 hover:text-white">Anuluj</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-crimson hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg">
                        {loading ? 'Wysyłanie...' : 'POTWIERDŹ'}
                    </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
