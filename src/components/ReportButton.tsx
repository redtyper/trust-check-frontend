'use client';

import { useEffect, useState, FormEvent } from 'react';
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

  const [reportType, setReportType] = useState<'COMPANY' | 'PERSON'>('COMPANY');

  useEffect(() => {
    if (defaultTargetType === 'NIP') setReportType('COMPANY');
    else setReportType('PERSON');
  }, [defaultTargetType]);

  const [nip, setNip] = useState(defaultTargetType === 'NIP' ? defaultValue : '');
  const [companyName, setCompanyName] = useState('');

  const [personName, setPersonName] = useState(defaultTargetType === 'PERSON' ? defaultValue : '');
  const [phoneNumber, setPhoneNumber] = useState(defaultTargetType === 'PHONE' ? defaultValue : '');

  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const [reason, setReason] = useState('SCAM');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz byc zalogowany.');
      router.push('/login');
      return;
    }

    try {
      let uploadedPath = undefined;
      if (file) {
        const res = await uploadScreenshot(file, token);
        uploadedPath = res.path;
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
        screenshotPath: uploadedPath,
      };

      if (reportType === 'COMPANY') {
        if (!nip) {
          alert('Podaj NIP!');
          setLoading(false);
          return;
        }
        payload.targetValue = nip;
        payload.scammerName = companyName;
      } else {
        if (!personName && !phoneNumber) {
          alert('Podaj imie lub telefon!');
          setLoading(false);
          return;
        }
        payload.targetValue = personName || phoneNumber;
        payload.scammerName = personName;
      }

      const success = await submitReport(payload, token);
      if (success) {
        alert('Zgloszenie dodane!');
        setIsOpen(false);
        window.location.reload();
      } else {
        alert('Blad wysylania.');
      }
    } catch (e) {
      console.error(e);
      alert('Wystapil blad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-crimson px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-2xl shadow-crimson/40 transition hover:-translate-y-0.5"
      >
        Zglos oszusta
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-6 backdrop-blur-sm">
          <div className="surface flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-navy-700 bg-navy-900/50 px-6 py-4">
              <h2 className="text-lg text-display text-white">Nowe zgloszenie</h2>
              <button onClick={() => setIsOpen(false)} className="text-xs uppercase tracking-widest text-slate-main">
                Zamknij
              </button>
            </div>

            <div className="flex border-b border-navy-700 text-xs uppercase tracking-widest text-slate-main">
              <button
                onClick={() => setReportType('COMPANY')}
                className={`flex-1 px-4 py-4 transition ${
                  reportType === 'COMPANY'
                    ? 'bg-navy-800 text-amber'
                    : 'bg-navy-900/60 text-slate-main'
                }`}
              >
                Firma (NIP)
              </button>
              <button
                onClick={() => setReportType('PERSON')}
                className={`flex-1 px-4 py-4 transition ${
                  reportType === 'PERSON'
                    ? 'bg-navy-800 text-amber'
                    : 'bg-navy-900/60 text-slate-main'
                }`}
              >
                Osoba prywatna
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-3xl border border-navy-700 bg-navy-900/60 p-5 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-slate-main">
                    {reportType === 'COMPANY' ? 'Dane firmy' : 'Dane osoby'}
                  </h3>

                  {reportType === 'COMPANY' ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-main">Numer NIP *</label>
                        <input
                          required
                          type="text"
                          maxLength={10}
                          value={nip}
                          onChange={(e) => setNip(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60 font-mono"
                          placeholder="0000000000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-main">Nazwa firmy</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                          placeholder="Nazwa firmy"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-main">Imie i nazwisko</label>
                        <input
                          type="text"
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                          placeholder="Jan Kowalski"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-main">Numer telefonu</label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60 font-mono"
                          placeholder="500600700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-navy-700 bg-navy-900/60 p-5 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-slate-main">Dodatkowe dane (OSINT)</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {reportType === 'COMPANY' && (
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-slate-main">Telefon firmowy</label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60 font-mono"
                          placeholder="Numer telefonu"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-main">Adres email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-main">Link do profilu</label>
                      <input
                        type="text"
                        value={fbLink}
                        onChange={(e) => setFbLink(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-main">Numer konta</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60 font-mono"
                        placeholder="PL 00 0000..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-navy-700 pt-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-main">Powod</label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                      >
                        <option value="SCAM">Oszustwo / wyudzenie</option>
                        <option value="SPAM">Spam</option>
                        <option value="TOWAR">Brak towaru</option>
                        <option value="OTHER">Inne</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-main">Ocena</label>
                      <div className="mt-2 flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className={`flex-1 rounded-2xl py-3 text-sm font-semibold transition ${
                              rating === s ? 'bg-crimson text-white shadow-lg shadow-crimson/30' : 'bg-navy-900/70 text-slate-main'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-main">Opis sytuacji *</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-2 min-h-[110px] w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
                      placeholder="Opisz zdarzenie..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-main">Dowod (screenshot)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-2 w-full text-sm text-slate-main file:mr-4 file:rounded-full file:border-0 file:bg-navy-800 file:px-4 file:py-2 file:text-slate-light hover:file:bg-navy-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-2xl border border-navy-700 py-3 text-xs uppercase tracking-widest text-slate-main transition hover:border-amber/40 hover:text-white"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-crimson py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Wysylanie...' : 'Potwierdz'}
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
