'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport } from '../app/lib/api';

interface ReportButtonProps {
    defaultTargetType: 'NIP' | 'PHONE' | 'PERSON'; 
    defaultValue: string; // NIP lub Numer Telefonu z kontekstu strony
}

export default function ReportButton({ defaultTargetType, defaultValue }: ReportButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ZAKŁADKI: 'COMPANY' (Firma) lub 'PERSON' (Osoba Prywatna)
  const [reportMode, setReportMode] = useState<'COMPANY' | 'PERSON'>(
      defaultTargetType === 'NIP' ? 'COMPANY' : 'PERSON'
  );

  // POLA FORMULARZA
  const [rating, setRating] = useState(1);
  const [reason, setReason] = useState('SCAM');
  const [comment, setComment] = useState('');
  
  // Pola specyficzne dla OSOBY PRYWATNEJ
  const [personPhone, setPersonPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [screenshot, setScreenshot] = useState('');

  const handleOpen = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    // Logika wyboru typu i wartości docelowej
    let finalType = defaultTargetType;
    let finalValue = defaultValue;

    if (reportMode === 'PERSON') {
        finalType = 'PERSON';
        // Jeśli jesteśmy na stronie firmy, ale zgłaszamy osobę, user musi podać jej telefon
        // Jeśli jesteśmy na stronie telefonu, to ten telefon jest zgłaszany
        finalValue = defaultTargetType === 'PHONE' ? defaultValue : personPhone;
    }

    const payload = {
        targetType: finalType,
        targetValue: finalValue,
        rating,
        reason,
        comment,
        // Dodatkowe pola (wyślemy je tylko jeśli tryb to PERSON, backend obsłuży nulle)
        reportedEmail: (reportMode === 'PERSON' && email) ? email : undefined,
        facebookLink: (reportMode === 'PERSON' && fbLink) ? fbLink : undefined,
        screenshotUrl: (reportMode === 'PERSON' && screenshot) ? screenshot : undefined
    };

    const success = await submitReport(payload, token);
    setLoading(false);

    if (success) {
        alert('Zgłoszenie zostało dodane pomyślnie.');
        setIsOpen(false);
        router.refresh();
    } else {
        alert('Wystąpił błąd podczas wysyłania zgłoszenia.');
    }
  };

  if (!isOpen) {
    return (
        <button 
            onClick={handleOpen}
            className="group bg-crimson hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-crimson/20 flex items-center gap-3 active:scale-95"
        >
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            ZGŁOŚ NADUŻYCIE
        </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-navy-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-navy-800 rounded-2xl border border-navy-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* NAGŁÓWEK */}
            <div className="p-6 border-b border-navy-700 flex justify-between items-center bg-navy-900/50">
                <h3 className="text-xl font-bold text-white">Nowe Zgłoszenie</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-main hover:text-white">✕</button>
            </div>

            {/* ZAKŁADKI (Tylko jeśli jesteśmy na stronie NIP, na stronie Phone zawsze zgłaszamy osobę/numer) */}
            {defaultTargetType === 'NIP' && (
                <div className="flex border-b border-navy-700">
                    <button 
                        onClick={() => setReportMode('COMPANY')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${reportMode === 'COMPANY' ? 'bg-navy-800 text-teal border-b-2 border-teal' : 'bg-navy-900 text-slate-500 hover:text-slate-300'}`}
                    >
                        Firma (Podmiot)
                    </button>
                    <button 
                        onClick={() => setReportMode('PERSON')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${reportMode === 'PERSON' ? 'bg-navy-800 text-teal border-b-2 border-teal' : 'bg-navy-900 text-slate-500 hover:text-slate-300'}`}
                    >
                        Osoba Prywatna / Pracownik
                    </button>
                </div>
            )}

            {/* SCROLLOWALNA TREŚĆ */}
            <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Informacja kontekstowa */}
                <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <p className="text-sm text-blue-200">
                        {reportMode === 'COMPANY' 
                            ? `Zgłaszasz nieprawidłowości dotyczące całej firmy o NIP: ${defaultValue}.`
                            : `Zgłaszasz konkretną osobę (np. pracownika, sprzedawcę z OLX). Wypełnij dodatkowe dane kontaktowe.`
                        }
                    </p>
                </div>

                {/* POLA DLA OSOBY PRYWATNEJ */}
                {reportMode === 'PERSON' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                         {/* Jeśli jesteśmy na stronie NIP, musimy zapytać o numer telefonu tej osoby */}
                         {defaultTargetType === 'NIP' && (
                            <div className="md:col-span-2">
                                <label className="block text-slate-main text-xs uppercase font-bold mb-2">Numer Telefonu Oszusta *</label>
                                <input 
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none"
                                    placeholder="np. +48 600 100 200"
                                    value={personPhone} onChange={e => setPersonPhone(e.target.value)}
                                />
                            </div>
                         )}

                         <div>
                            <label className="block text-slate-main text-xs uppercase font-bold mb-2">Adres Email</label>
                            <input 
                                className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none"
                                placeholder="email@oszusta.pl"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                         </div>
                         <div>
                            <label className="block text-slate-main text-xs uppercase font-bold mb-2">Link do profilu (FB/OLX)</label>
                            <input 
                                className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none"
                                placeholder="https://facebook.com/..."
                                value={fbLink} onChange={e => setFbLink(e.target.value)}
                            />
                         </div>
                         <div className="md:col-span-2">
                            <label className="block text-slate-main text-xs uppercase font-bold mb-2">Link do screenshota (Dowód)</label>
                            <input 
                                className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none font-mono text-sm"
                                placeholder="https://imgur.com/..."
                                value={screenshot} onChange={e => setScreenshot(e.target.value)}
                            />
                            <p className="text-xs text-slate-500 mt-1">Wklej bezpośredni link do zdjęcia (np. z imgur.com).</p>
                         </div>
                    </div>
                )}

                <div className="border-t border-navy-700 my-4"></div>

                {/* WSPÓLNE POLA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Powód Zgłoszenia</label>
                        <select 
                            className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none"
                            value={reason} onChange={e => setReason(e.target.value)}
                        >
                            <option value="SCAM">Oszustwo Finansowe (SCAM)</option>
                            <option value="TOWAR">Brak wysyłki towaru</option>
                            <option value="FAKTURA">Fałszywa faktura / Dokumenty</option>
                            <option value="RODO">Naruszenie RODO / Wyciek danych</option>
                            <option value="INNE">Inne naruszenie</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Poziom Ryzyka (1-5)</label>
                        <div className="flex gap-2">
                            {[1,2,3,4,5].map(star => (
                                <button 
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`flex-1 h-12 rounded-lg font-bold transition-all ${rating >= star ? 'bg-gradient-to-br from-crimson to-red-600 text-white shadow-lg shadow-crimson/30' : 'bg-navy-900 text-slate-600 border border-navy-700'}`}
                                >
                                    {star}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-main text-xs uppercase font-bold mb-2">Opis Sytuacji</label>
                    <textarea 
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-4 text-white focus:border-teal outline-none min-h-[120px]"
                        placeholder="Opisz dokładnie co się stało. Pamiętaj, że Twoje zgłoszenie pomaga innym."
                        value={comment} onChange={e => setComment(e.target.value)}
                    />
                </div>

            </div>

            {/* STOPKA */}
            <div className="p-6 border-t border-navy-700 bg-navy-900/50 flex justify-end gap-3">
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="px-6 py-3 rounded-lg text-slate-400 hover:text-white font-bold transition-colors"
                >
                    Anuluj
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-teal hover:bg-green-600 px-8 py-3 rounded-lg text-white font-bold shadow-lg shadow-teal/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Przetwarzanie...' : 'Wyślij Zgłoszenie'}
                </button>
            </div>
        </div>
    </div>
  );
}
