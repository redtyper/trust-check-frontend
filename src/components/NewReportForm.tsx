'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport, uploadScreenshot } from '../app/lib/api';

export default function NewReportForm({ initialValue = '', initialType = 'NIP' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ZAKŁADKI: COMPANY (Firma) lub PERSON (Osoba)
  const [reportType, setReportType] = useState<'COMPANY' | 'PERSON'>(
    initialType === 'NIP' ? 'COMPANY' : 'PERSON'
  );

  // DANE WSPÓLNE I SPECYFICZNE
  const [targetValue, setTargetValue] = useState(initialValue); // NIP lub Imię/Nazwisko
  const [phoneNumber, setPhoneNumber] = useState(initialType === 'PHONE' ? initialValue : '');
  const [companyName, setCompanyName] = useState(''); // Tylko dla firmy (opcjonalne)
  
  // OSINT
  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  // OCENA
  const [rating, setRating] = useState(1);
  const [reason, setReason] = useState('SCAM');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.setItem('redirectAfterLogin', `/report/new?value=${targetValue}`);
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

      // Budowanie payloadu
      const payload: any = {
        targetType: reportType,
        rating,
        reason,
        comment,
        phoneNumber: phoneNumber || undefined,
        reportedEmail: email || undefined,
        facebookLink: fbLink || undefined,
        bankAccount: bankAccount || undefined,
        screenshotPath,
      };

      if (reportType === 'COMPANY') {
         if(!targetValue) { alert('Podaj NIP!'); setLoading(false); return; }
         payload.targetValue = targetValue; // NIP
         payload.scammerName = companyName; 
      } else {
         // Dla osoby: targetValue to Imię/Nazwisko
         if(!targetValue && !phoneNumber) { alert('Podaj Imię lub Telefon!'); setLoading(false); return; }
         payload.targetValue = targetValue || phoneNumber; 
         payload.scammerName = targetValue;
      }

      const success = await submitReport(payload, token);
      
      if (success) {
        // Przekierowanie zależne od typu
        if (reportType === 'COMPANY') router.push(`/report/nip/${payload.targetValue}`);
        else router.push(`/report/phone/${encodeURIComponent(payload.targetValue)}`);
      } else {
        alert('Wystąpił błąd podczas wysyłania.');
      }
    } catch (e) {
      console.error(e);
      alert('Błąd sieci.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Nowe Zgłoszenie</h1>
        <p className="text-slate-main">Wypełnij formularz, aby ostrzec innych przed nieuczciwym podmiotem.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* WYBÓR TYPU (KAFELKI) */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setReportType('PERSON')}
            className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${
              reportType === 'PERSON' 
                ? 'bg-navy-800 border-teal text-white shadow-lg shadow-teal/10' 
                : 'bg-navy-900 border-navy-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${reportType === 'PERSON' ? 'bg-teal' : 'bg-transparent'}`} />
            <div className="text-2xl mb-2">👤</div>
            <div className="font-bold text-lg">Osoba Prywatna</div>
            <div className="text-xs opacity-70 mt-1">Oszust z OLX, pracownik, osoba fizyczna.</div>
          </button>

          <button
            type="button"
            onClick={() => setReportType('COMPANY')}
            className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${
              reportType === 'COMPANY' 
                ? 'bg-navy-800 border-teal text-white shadow-lg shadow-teal/10' 
                : 'bg-navy-900 border-navy-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${reportType === 'COMPANY' ? 'bg-teal' : 'bg-transparent'}`} />
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-bold text-lg">Firma / Podmiot</div>
            <div className="text-xs opacity-70 mt-1">Sklep internetowy, hurtownia, działalność gosp.</div>
          </button>
        </div>

        {/* GŁÓWNE DANE */}
        <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
             <span className="w-2 h-6 bg-crimson rounded-full"/>
             <h3 className="text-lg font-bold text-white uppercase tracking-wider">Kogo zgłaszasz?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportType === 'COMPANY' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Numer NIP *</label>
                    <input required type="text" maxLength={10} value={targetValue} onChange={e => setTargetValue(e.target.value)}
                           placeholder="Np. 5252525252"
                           className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all font-mono text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nazwa Firmy</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                           placeholder="Np. Januszex Sp. z o.o."
                           className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all" />
                  </div>
                </>
            ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Imię i Nazwisko / Alias</label>
                    <input type="text" value={targetValue} onChange={e => setTargetValue(e.target.value)}
                           placeholder="Np. Jan Kowalski"
                           className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Numer Telefonu</label>
                    <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                           placeholder="Np. 500 600 700"
                           className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-teal transition-all font-mono" />
                  </div>
                </>
            )}
          </div>
        </div>

        {/* OSINT (DANE DODATKOWE) */}
        <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 space-y-6 shadow-xl">
           <div className="flex items-center gap-2 mb-2">
             <span className="w-2 h-6 bg-blue-500 rounded-full"/>
             <h3 className="text-lg font-bold text-white uppercase tracking-wider">Co o nim wiesz? (OSINT)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Adres E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="email@oszusta.pl"
                       className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 transition-all" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Link do profilu (FB/OLX)</label>
                <input type="text" value={fbLink} onChange={e => setFbLink(e.target.value)}
                       placeholder="https://facebook.com/..."
                       className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 transition-all" />
             </div>
             <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Numer Konta Bankowego</label>
                <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)}
                       placeholder="PL 00 0000 0000..."
                       className="w-full bg-navy-900 border-none rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 transition-all font-mono" />
             </div>
          </div>
        </div>

        {/* OCENA I OPIS */}
        <div className="bg-navy-800 p-6 rounded-xl border border-navy-700 space-y-6 shadow-xl">
           <div className="flex items-center gap-2 mb-2">
             <span className="w-2 h-6 bg-teal rounded-full"/>
             <h3 className="text-lg font-bold text-white uppercase tracking-wider">Szczegóły zdarzenia</h3>
          </div>

          {/* POWÓD (SELECT Z IKONAMI) - ZROBIMY CUSTOM SELECT LUB ZWYKŁY DLA UPROSZCZENIA, TU ZWYKŁY ALE STYLOWY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Rodzaj oszustwa</label>
                <select value={reason} onChange={e => setReason(e.target.value)}
                        className="w-full bg-navy-900 border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-teal cursor-pointer appearance-none">
                    <option value="SCAM">⚠️ Oszustwo / Wyłudzenie</option>
                    <option value="SPAM">📞 Spam Telefoniczny</option>
                    <option value="TOWAR">📦 Nieotrzymany Towar</option>
                    <option value="RODO">🔒 Wyciek Danych</option>
                    <option value="OTHER">❓ Inne</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Twoja Ocena (1 = Oszust)</label>
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(star => (
                       <button key={star} type="button" onClick={() => setRating(star)}
                               className={`flex-1 h-[56px] rounded-lg font-bold text-xl transition-all shadow-lg ${
                                   rating === star ? 'bg-crimson text-white scale-105' : 'bg-navy-900 text-slate-600 hover:bg-navy-700'
                               }`}>
                           {star}
                       </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Opis Sytuacji *</label>
             <textarea required value={comment} onChange={e => setComment(e.target.value)}
                       placeholder="Opisz dokładnie co się stało. Im więcej szczegółów, tym lepiej..."
                       className="w-full bg-navy-900 border-none rounded-lg p-4 text-white min-h-[150px] focus:ring-2 focus:ring-teal placeholder-slate-600 resize-y" />
          </div>

          {/* UPLOAD PLIKU */}
          <div className="border-2 border-dashed border-navy-600 rounded-xl p-8 text-center hover:border-teal transition-colors group cursor-pointer relative">
             <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
             <div className="space-y-2">
                <div className="text-4xl group-hover:scale-110 transition-transform">📸</div>
                <div className="font-bold text-white">Kliknij, aby dodać dowód (Screenshot)</div>
                <div className="text-sm text-slate-500">JPG, PNG (Max 5MB)</div>
                {file && <div className="text-teal font-bold mt-2 bg-teal/10 inline-block px-3 py-1 rounded">Wybrano: {file.name}</div>}
             </div>
          </div>
        </div>

        {/* SUBMIT */}
        <button type="submit" disabled={loading}
                className="w-full bg-crimson hover:bg-red-700 text-white font-bold py-6 rounded-xl text-xl shadow-2xl shadow-crimson/20 transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'PRZETWARZANIE...' : 'DODAJ ZGŁOSZENIE I OSTRZEŻ INNYCH'}
        </button>

      </form>
    </div>
  );
}
