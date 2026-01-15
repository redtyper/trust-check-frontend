'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport, uploadScreenshot } from '../app/lib/api';

export default function NewReportForm({ initialValue = '', initialType = 'NIP' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [reportType, setReportType] = useState<'COMPANY' | 'PERSON'>(
    initialType === 'NIP' ? 'COMPANY' : 'PERSON'
  );

  const [targetValue, setTargetValue] = useState(initialValue);
  const [phoneNumber, setPhoneNumber] = useState(initialType === 'PHONE' ? initialValue : '');
  const [companyName, setCompanyName] = useState('');

  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');

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
        if (!targetValue) {
          alert('Podaj NIP!');
          setLoading(false);
          return;
        }
        payload.targetValue = targetValue;
        payload.scammerName = companyName;
      } else {
        if (!targetValue && !phoneNumber) {
          alert('Podaj imie lub telefon!');
          setLoading(false);
          return;
        }
        payload.targetValue = targetValue || phoneNumber;
        payload.scammerName = targetValue;
      }

      const success = await submitReport(payload, token);

      if (success) {
        if (reportType === 'COMPANY') router.push(`/report/nip/${payload.targetValue}`);
        else router.push(`/report/phone/${encodeURIComponent(payload.targetValue)}`);
      } else {
        alert('Wystapil blad podczas wysylania.');
      }
    } catch (e) {
      console.error(e);
      alert('Blad sieci.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-main">Nowe zgloszenie</div>
        <h1 className="text-3xl text-display text-white md:text-4xl">Dodaj alert do bazy</h1>
        <p className="text-slate-main">
          Wypelnij formularz, aby ostrzec innych przed nieuczciwym podmiotem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setReportType('PERSON')}
            className={`rounded-3xl border p-6 text-left transition ${
              reportType === 'PERSON'
                ? 'border-amber/50 bg-navy-800/90 shadow-lg shadow-amber/10'
                : 'border-navy-700 bg-navy-900/60 hover:border-slate-main/40'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.25em] text-slate-main">Osoba prywatna</div>
            <div className="mt-3 text-lg font-semibold text-white">Oszust lub osoba fizyczna</div>
            <div className="mt-2 text-sm text-slate-main">
              OLX, marketplace, pracownik, osoba prywatna.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setReportType('COMPANY')}
            className={`rounded-3xl border p-6 text-left transition ${
              reportType === 'COMPANY'
                ? 'border-amber/50 bg-navy-800/90 shadow-lg shadow-amber/10'
                : 'border-navy-700 bg-navy-900/60 hover:border-slate-main/40'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.25em] text-slate-main">Firma / podmiot</div>
            <div className="mt-3 text-lg font-semibold text-white">Sklep, hurtownia, dzialalnosc</div>
            <div className="mt-2 text-sm text-slate-main">
              Weryfikacja NIP i danych firmowych.
            </div>
          </button>
        </div>

        <div className="surface rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-crimson" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-light">Kogo zglaszasz</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportType === 'COMPANY' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-main">Numer NIP *</label>
                  <input
                    required
                    type="text"
                    maxLength={10}
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Np. 5252525252"
                    className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-main">Nazwa firmy</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Np. Januszex Sp. z o.o."
                    className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-main">Imie i nazwisko</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Np. Jan Kowalski"
                    className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-main">Numer telefonu</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Np. 500 600 700"
                    className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60 font-mono"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="surface rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-teal" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-light">Dane dodatkowe (OSINT)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-main">Adres email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@oszusta.pl"
                className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-teal/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-main">Profil FB/OLX</label>
              <input
                type="text"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-teal/60"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-slate-main">Numer konta bankowego</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="PL 00 0000 0000..."
                className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-teal/60 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="surface rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-amber" />
            <h3 className="text-sm uppercase tracking-[0.3em] text-slate-light">Szczegoly zdarzenia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-main">Rodzaj oszustwa</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60"
              >
                <option value="SCAM">Oszustwo / wyudzenie</option>
                <option value="SPAM">Spam telefoniczny</option>
                <option value="TOWAR">Nieotrzymany towar</option>
                <option value="RODO">Wyciek danych</option>
                <option value="OTHER">Inne</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-main">Twoja ocena (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`flex-1 rounded-2xl py-4 text-lg font-semibold transition ${
                      rating === star
                        ? 'bg-crimson text-white shadow-lg shadow-crimson/30'
                        : 'bg-navy-900/70 text-slate-main hover:text-white'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-main">Opis sytuacji *</label>
            <textarea
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opisz dokladnie co sie stalo. Im wiecej szczegolow, tym lepiej."
              className="min-h-[160px] w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60 resize-y"
            />
          </div>

          <div className="relative rounded-3xl border-2 border-dashed border-navy-700 px-6 py-10 text-center transition hover:border-amber/60">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="space-y-2">
              <div className="text-sm uppercase tracking-widest text-slate-main">Dowod</div>
              <div className="text-white font-semibold">Kliknij, aby dodac screenshot</div>
              <div className="text-xs text-slate-main">JPG, PNG (max 5MB)</div>
              {file && (
                <div className="inline-flex rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs text-teal">
                  Wybrano: {file.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-crimson py-5 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-crimson/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Przetwarzanie...' : 'Dodaj zgloszenie i ostrzez innych'}
        </button>
      </form>
    </div>
  );
}
