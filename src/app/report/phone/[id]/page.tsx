import React from 'react';
import Link from 'next/link';
import { checkCompany } from '../../../lib/api';
import CommentsList from '../../../../components/CommentsList';
import AddCommentForm from '../../../../components/AddCommentForm';

const BACKEND_URL = 'http://localhost:3001';

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const rawInput = decodeURIComponent(params.id);

  const data = await checkCompany(rawInput, 'PHONE');

  if (!data) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-navy-900 px-6 text-center text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl font-semibold text-slate-light">Nie znaleziono danych</h1>
          <p className="text-slate-main">Brak historii dla tego numeru lub osoby.</p>
          <Link
            href={`/report/new?value=${rawInput}&type=PHONE`}
            className="inline-flex rounded-full bg-crimson px-5 py-2 text-xs uppercase tracking-widest text-white transition hover:-translate-y-0.5"
          >
            Dodaj pierwsze zgloszenie
          </Link>
        </div>
      </div>
    );
  }

  const isSafe = data.trustScore >= 70;
  const isCritical = data.trustScore <= 30;
  const borderColor = isSafe ? 'border-teal/30' : isCritical ? 'border-crimson/30' : 'border-amber/30';
  const statusBg = isSafe
    ? 'bg-teal/20 text-teal'
    : isCritical
      ? 'bg-crimson/20 text-crimson'
      : 'bg-amber/20 text-amber';

  const comments = data.community?.latestComments || [];

  const osintPhones = Array.from(
    new Set(
      comments
        .map((c) => c.phoneNumber)
        .filter((p): p is string => !!p)
    )
  );

  if (data.isPhone && !osintPhones.includes(data.query)) {
    osintPhones.unshift(data.query);
  }

  const displayEmail = comments.find((c) => c.reportedEmail)?.reportedEmail;
  const displayFb = comments.find((c) => c.facebookLink)?.facebookLink;
  const displayBank = comments.find((c) => c.bankAccount)?.bankAccount;

  const hasOsint = osintPhones.length > 0 || displayEmail || displayFb || displayBank;

  const buildScreenshotSrc = (path?: string, url?: string) => {
    if (url) return url;
    if (!path) return '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${normalized}`;
  };

  const screenshotSources = Array.from(
    new Set(
      comments
        .map((c) => buildScreenshotSrc(c.screenshotPath, c.screenshotUrl))
        .filter((src) => Boolean(src))
    )
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-900 px-6 py-10 text-slate-light">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-[-10%] h-[360px] w-[360px] rounded-full bg-amber/15 blur-[130px]" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-teal/15 blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full border border-navy-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-main transition hover:border-amber/40 hover:text-white"
          >
            Powrot do wyszukiwania
          </Link>
          <div className="text-xs font-mono text-slate-main opacity-60">
            SESSION ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>
        </nav>

        <div className={`surface relative rounded-3xl border ${borderColor} p-6 md:p-8`}>
          <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-3xl ${isSafe ? 'bg-teal' : isCritical ? 'bg-crimson' : 'bg-amber'}`} />

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl text-display text-white md:text-5xl break-all">{data.query}</h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${statusBg}`}>
                    Ryzyko: {data.riskLevel}
                  </span>
                  <span className="rounded-full border border-navy-700 bg-navy-900/70 px-3 py-1 text-xs uppercase tracking-widest text-slate-main">
                    Zrodlo: {data.source === 'DB' ? 'Baza danych' : 'Nowy zapis'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-navy-700 bg-navy-900/70 shadow-inner">
                  <span className={`text-2xl font-semibold ${isSafe ? 'text-teal' : 'text-crimson'}`}>
                    {data.trustScore}
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-main">Score</span>
                </div>
              </div>
            </div>

            {hasOsint && (
              <div className="rounded-3xl border border-navy-700/60 bg-navy-900/60 p-5">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Znane dane kontaktowe</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {osintPhones.length > 0 && (
                    <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-main">Numery telefonow</p>
                      <div className="mt-2 space-y-1">
                        {osintPhones.map((phone) => (
                          <p key={phone} className="font-mono text-sm text-white">
                            {phone}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {displayEmail && (
                    <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-main">E-mail</p>
                      <p className="mt-2 break-all font-mono text-sm text-white">{displayEmail}</p>
                    </div>
                  )}

                  {displayFb && (
                    <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-main">Profil</p>
                      <a
                        href={displayFb}
                        target="_blank"
                        className="mt-2 inline-flex text-sm text-amber underline decoration-dotted"
                        rel="noreferrer"
                      >
                        Zobacz profil
                      </a>
                    </div>
                  )}

                  {displayBank && (
                    <div className="rounded-2xl border border-amber/40 bg-amber/10 p-4 md:col-span-2">
                      <p className="text-xs uppercase tracking-widest text-amber">Numer konta bankowego</p>
                      <p className="mt-2 break-all font-mono text-sm text-amber">{displayBank}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {screenshotSources.length > 0 && (
              <div className="rounded-3xl border border-navy-700/60 bg-navy-900/60 p-5">
                <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Zalaczone dowody</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {screenshotSources.map((src) => (
                    <div
                      key={src}
                      className="group relative overflow-hidden rounded-2xl border border-navy-700 bg-navy-900"
                    >
                      <img
                        src={src}
                        alt="Dowod"
                        className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.company && (
              <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-main">Powiazana firma</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-white font-semibold">{data.company.name}</span>
                  <span className="text-xs font-mono text-slate-main">NIP: {data.company.nip}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="surface rounded-3xl border border-navy-700 p-6 md:p-8">
          <div className="flex items-center justify-between border-b border-navy-700 pb-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Historia zgloszen</h3>
            <span className="rounded-full border border-navy-700 bg-navy-900/70 px-3 py-1 text-xs uppercase tracking-widest text-slate-main">
              Total: {data.community?.totalReports || 0}
            </span>
          </div>
          <div className="mt-6">
            <CommentsList comments={comments} />
          </div>
        </div>

        <div className="mt-8">
          <AddCommentForm targetType="PHONE" targetValue={data.query} />
        </div>
      </div>
    </main>
  );
}
