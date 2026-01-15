import { checkCompany } from '../../../lib/api';
import Link from 'next/link';
import ReportButton from '@/components/ReportButton';

const BACKEND_URL = 'http://localhost:3001';

const TrustScoreGauge = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = '#f0433a';
  if (score >= 50) color = '#f59e0b';
  if (score >= 80) color = '#2bbf9f';

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="h-24 w-24 -rotate-90 transform">
        <circle cx="50%" cy="50%" r={radius} stroke="#1f2b3a" strokeWidth="6" fill="transparent" />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-3xl font-semibold text-white">{score}</span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-main">Score</span>
      </div>
    </div>
  );
};

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const nip = params.id;

  const data = await checkCompany(nip, 'NIP');

  if (!data || data.error || !data.company) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-navy-900 px-6 text-center text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl font-semibold text-crimson">Nie znaleziono podmiotu</h1>
          <p className="text-slate-main">NIP: {nip}</p>
          <Link
            href="/"
            className="inline-flex rounded-full border border-navy-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-main transition hover:border-amber/40 hover:text-white"
          >
            Wroc do wyszukiwania
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

  const buildScreenshotSrc = (path?: string, url?: string) => {
    if (url) return url;
    if (!path) return '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${normalized}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-900 px-6 py-10 text-slate-light">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 right-[-10%] h-[360px] w-[360px] rounded-full bg-amber/15 blur-[130px]" />
        <div className="absolute -bottom-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-teal/15 blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className={`surface relative col-span-1 md:col-span-8 rounded-3xl border ${borderColor} p-6 md:p-8`}>
            <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-3xl ${isSafe ? 'bg-teal' : isCritical ? 'bg-crimson' : 'bg-amber'}`} />

            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl text-display text-white md:text-3xl">{data.company.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${statusBg}`}>
                      {data.riskLevel}
                    </span>
                    <span className="rounded-full border border-navy-700 bg-navy-900/70 px-3 py-1 text-xs uppercase tracking-widest text-slate-main">
                      Zrodlo: {data.source}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    NIP: <span className="font-mono text-white">{data.query}</span>
                  </p>
                  <p>
                    Adres: <span className="text-white">{data.company.address || 'Brak danych adresowych'}</span>
                  </p>
                </div>
              </div>

              <div className="hidden md:flex rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                <TrustScoreGauge score={data.trustScore} />
              </div>
            </div>
          </div>

          <div className="surface-soft col-span-1 rounded-3xl border border-navy-700 p-6 md:col-span-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Status prawny</h3>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Status VAT</span>
                <span className={`font-mono font-semibold ${data.company.vat === 'Czynny' ? 'text-teal' : 'text-crimson'}`}>
                  {data.company.vat}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Data rejestracji</span>
                <span className="font-mono text-white">{data.company.regDate || '2023-01-01'}</span>
              </div>
            </div>
          </div>

          <div className="surface-soft col-span-1 rounded-3xl border border-navy-700 p-6 md:col-span-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Kontakty</h3>
            <div className="mt-6 space-y-2">
              {data.company.phones && data.company.phones.length > 0 ? (
                data.company.phones.map((p) => (
                  <Link
                    key={p.number}
                    href={`/report/phone/${encodeURIComponent(p.number.replace(/\s/g, ''))}`}
                    className="flex items-center justify-between rounded-2xl border border-navy-700 bg-navy-900/60 px-4 py-3 transition hover:border-amber/40"
                  >
                    <span className="font-mono text-sm text-teal">{p.number}</span>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-navy-700 px-4 py-6 text-center text-sm text-slate-main">
                  Brak numerow publicznych.
                </div>
              )}
            </div>
          </div>

          <div className="surface col-span-1 rounded-3xl border border-navy-700 p-6 md:col-span-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.3em] text-slate-main">Analiza zgloszen</h3>
              <span className="rounded-full border border-navy-700 bg-navy-900/70 px-3 py-1 text-xs uppercase tracking-widest text-slate-main">
                Total: {data.community?.totalReports || 0}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {data.community?.latestComments && data.community.latestComments.length > 0 ? (
                data.community.latestComments.map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-main">
                      <span className="font-mono">{c.date || 'Dzisiaj'}</span>
                      <span className="rounded-full border border-crimson/30 bg-crimson/10 px-2 py-1 text-crimson">
                        {c.reason}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-light">"{c.comment}"</p>
                    {(c.screenshotPath || c.screenshotUrl) && (
                      <div className="mt-4">
                        <img
                          src={buildScreenshotSrc(c.screenshotPath, c.screenshotUrl)}
                          alt="Dowod"
                          className="h-32 w-full rounded-2xl border border-navy-700 object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-navy-700 px-4 py-6 text-center text-sm text-slate-main">
                  Brak negatywnych zgloszen w bazie.
                </div>
              )}
            </div>
          </div>

          <div className="col-span-1 flex justify-end md:col-span-12">
            <ReportButton defaultTargetType="NIP" defaultValue={data.query} />
          </div>
        </div>
      </div>
    </main>
  );
}
