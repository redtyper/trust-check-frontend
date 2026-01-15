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

  const [reason, setReason] = useState('SCAM');
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [email, setEmail] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz byc zalogowany, aby dodac komentarz.');
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

      const finalType = targetType === 'PHONE' ? 'PERSON' : targetType;

      const payload = {
        targetType: finalType,
        targetValue,
        rating,
        reason,
        comment,
        reportedEmail: email || undefined,
        facebookLink: fbLink || undefined,
        bankAccount: bankAccount || undefined,
        screenshotPath,
      };

      const success = await submitReport(payload, token);
      if (success) {
        alert('Komentarz dodany!');
        setComment('');
        setFile(null);
        setEmail('');
        setFbLink('');
        setBankAccount('');
        setIsOpen(false);
        window.location.reload();
      } else {
        alert('Blad dodawania komentarza.');
      }
    } catch (e) {
      console.error(e);
      alert('Wystapil blad.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-3xl border border-dashed border-navy-700 bg-navy-900/60 py-6 text-sm text-slate-main transition hover:border-amber/50 hover:text-white"
      >
        Dodaj swoje zgloszenie do watku
      </button>
    );
  }

  return (
    <div className="surface rounded-3xl p-6 md:p-8 animate-rise">
      <div className="mb-6 flex items-center justify-between border-b border-navy-700 pb-4">
        <h3 className="text-lg text-display text-white">Dodaj zgloszenie</h3>
        <button onClick={() => setIsOpen(false)} className="text-xs uppercase tracking-widest text-slate-main">
          Anuluj
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-main">Powod</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
            >
              <option value="SCAM">Oszustwo</option>
              <option value="SPAM">Spam</option>
              <option value="TOWAR">Brak towaru</option>
              <option value="OTHER">Inne</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-main">Ocena (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                    rating === s ? 'bg-crimson text-white shadow-lg shadow-crimson/30' : 'bg-navy-900/70 text-slate-main'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-navy-700/60 bg-navy-900/60 p-4 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.25em] text-slate-main">Dodatkowe dane</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-main">Email</label>
              <input
                type="text"
                placeholder="email@oszusta.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-main">Profil</label>
              <input
                type="text"
                placeholder="https://..."
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest text-slate-main">Numer konta</label>
              <input
                type="text"
                placeholder="PL 00 0000 0000..."
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-3 text-white outline-none transition focus:border-amber/60 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-slate-main">Opis sytuacji *</label>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Opisz dokladnie co sie stalo..."
            className="min-h-[120px] w-full rounded-2xl border border-navy-700 bg-navy-900/70 p-4 text-white outline-none transition focus:border-amber/60 resize-y"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex-1 cursor-pointer rounded-2xl border border-dashed border-navy-700 bg-navy-900/70 px-4 py-4 text-center text-sm text-slate-main transition hover:border-amber/50">
            {file ? file.name : 'Dodaj dowod (zdjecie)'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] rounded-2xl bg-crimson px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Wysylanie...' : 'Opublikuj zgloszenie'}
          </button>
        </div>
      </form>
    </div>
  );
}
