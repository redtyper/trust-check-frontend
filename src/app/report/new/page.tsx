'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitReport } from '../../lib/api';

// Komponent z logiką, opakowany w Suspense
function NewReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pobieramy wstępne dane z URL (np. ?value=123456789&type=PHONE)
  const initialValue = searchParams.get('value') || '';
  const initialType = searchParams.get('type') || 'PHONE';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Wybór Typu, 2: Szczegóły

  // DANE FORMULARZA
  const [targetType, setTargetType] = useState<'NIP' | 'PHONE'>(initialType === 'NIP' ? 'NIP' : 'PHONE');
  const [targetValue, setTargetValue] = useState(initialValue);
  const [isPrivatePerson, setIsPrivatePerson] = useState(false); // Czy to osoba prywatna?

  const [reason, setReason] = useState('SCAM');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  
  // Dane dodatkowe (Osoba prywatna)
  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Jeśli niezalogowany, przekieruj na login i wróć tu po zalogowaniu
        localStorage.setItem('redirectAfterLogin', `/report/new?value=${targetValue}&type=${targetType}`);
        router.push('/login');
        return;
    }

    setLoading(true);

    // Jeśli zgłaszamy Osobę Prywatną, typ w backendzie to 'PERSON'
    // Jeśli zgłaszamy Firmę (NIP), typ to 'NIP'
    // Jeśli zgłaszamy sam Telefon (bez określenia), typ to 'PHONE'
    
    let finalType = targetType;
    if (targetType === 'PHONE' && isPrivatePerson) finalType = 'PHONE'; // Backend oczekuje 'PERSON' dla osób prywatnych

    const payload = {
        targetType: finalType as string, // rzutowanie na string bo DTO przyjmuje string
        targetValue: targetValue,
        rating,
        reason,
        comment,
        reportedEmail: isPrivatePerson ? email : undefined,
        facebookLink: isPrivatePerson ? fbLink : undefined,
    };

    const success = await submitReport(payload, token);
    setLoading(false);

    if (success) {
        alert('Dodano zgłoszenie! Dziękujemy.');
        // Przekieruj do nowo utworzonego raportu
        if (targetType === 'NIP') router.push(`/report/nip/${targetValue}`);
        else router.push(`/report/phone/${encodeURIComponent(targetValue)}`);
    } else {
        alert('Wystąpił błąd. Spróbuj ponownie.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-navy-800 rounded-2xl border border-navy-700 shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">To pierwsze zgłoszenie tego numeru</h1>
        <p className="text-slate-main mb-8">
            Numer <span className="text-teal font-mono font-bold">{targetValue}</span> nie istnieje jeszcze w naszej bazie. 
            Wypełnij formularz, aby ostrzec innych.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ETAP 1: KOGO ZGŁASZASZ? */}
            <div className="bg-navy-900/50 p-6 rounded-xl border border-navy-700">
                <label className="block text-slate-main text-xs uppercase font-bold mb-4">Kogo dotyczy zgłoszenie?</label>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => { setTargetType('PHONE'); setIsPrivatePerson(true); }}
                        className={`p-4 rounded-lg border text-left transition-all ${targetType === 'PHONE' && isPrivatePerson ? 'bg-teal/20 border-teal text-white' : 'bg-navy-900 border-navy-700 text-slate-400'}`}
                    >
                        <div className="font-bold mb-1">Osoba Prywatna</div>
                        <div className="text-xs opacity-70">Np. sprzedawca z OLX, pracownik, oszust telefoniczny.</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setTargetType('NIP'); setIsPrivatePerson(false); }}
                        className={`p-4 rounded-lg border text-left transition-all ${targetType === 'NIP' ? 'bg-blue-900/40 border-blue-500 text-white' : 'bg-navy-900 border-navy-700 text-slate-400'}`}
                    >
                        <div className="font-bold mb-1">Firma (Podmiot)</div>
                        <div className="text-xs opacity-70">Jeśli znasz NIP firmy, która Cię oszukała.</div>
                    </button>
                </div>

                {/* Jeśli wybrano NIP, pozwól go edytować (bo user mógł wpisać telefon a chce zgłosić NIP) */}
                {targetType === 'NIP' && (
                    <div className="mt-4">
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Podaj Numer NIP</label>
                        <input 
                            className="w-full bg-navy-900 border border-navy-700 rounded p-3 text-white font-mono"
                            placeholder="Wpisz 10 cyfr NIP"
                            value={targetValue}
                            onChange={e => setTargetValue(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* ETAP 2: DANE ZGŁOSZENIA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-main text-xs uppercase font-bold mb-2">Powód</label>
                    <select 
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white focus:border-teal outline-none"
                        value={reason} onChange={e => setReason(e.target.value)}
                    >
                        <option value="SCAM">Oszustwo / Wyłudzenie</option>
                        <option value="SPAM">Spam Telefoniczny</option>
                        <option value="TOWAR">Nieotrzymany towar</option>
                        <option value="RODO">Wyciek Danych</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-main text-xs uppercase font-bold mb-2">Ocena Ryzyka (1-5)</label>
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                            <button 
                                key={star} type="button"
                                onClick={() => setRating(star)}
                                className={`flex-1 h-10 rounded font-bold transition-all ${rating >= star ? 'bg-crimson text-white' : 'bg-navy-900 text-slate-600'}`}
                            >
                                {star}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isPrivatePerson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Email Oszusta (Opcjonalne)</label>
                        <input 
                            className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-main text-xs uppercase font-bold mb-2">Link do Profilu (Opcjonalne)</label>
                        <input 
                            className="w-full bg-navy-900 border border-navy-700 rounded-lg p-3 text-white"
                            placeholder="https://facebook.com/..."
                            value={fbLink} onChange={e => setFbLink(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-slate-main text-xs uppercase font-bold mb-2">Opis Zdarzenia *</label>
                <textarea 
                    required
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-4 text-white min-h-[150px] focus:border-teal outline-none"
                    placeholder="Opisz dokładnie co się stało..."
                    value={comment} onChange={e => setComment(e.target.value)}
                />
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-crimson hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-crimson/20 transition-all active:scale-[0.98]"
            >
                {loading ? 'Wysyłanie...' : 'DODAJ ZGŁOSZENIE I OSTRZEŻ INNYCH'}
            </button>
        </form>
    </div>
  );
}

// Główny Export z Suspense (Wymagane w Next.js 13+ dla useSearchParams)
export default function NewReportPage() {
    return (
        <main className="min-h-screen bg-navy-900 text-white p-4 md:p-8 flex items-center justify-center">
            <Suspense fallback={<div className="text-teal">Ładowanie formularza...</div>}>
                <NewReportForm />
            </Suspense>
        </main>
    );
}
