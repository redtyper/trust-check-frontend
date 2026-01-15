'use client';
import { useState } from 'react';

const BACKEND_URL = 'http://localhost:3001';

export default function CommentsList({ comments }: { comments: any[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const buildScreenshotSrc = (path?: string, url?: string) => {
    if (url) return url;
    if (!path) return '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${normalized}`;
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy-700 py-12 text-center text-slate-main">
        Brak zgloszen. Badz pierwszy!
      </div>
    );
  }

  return (
    <>
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="Dowod" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
          <button className="absolute right-6 top-6 rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-widest text-white">
            Zamknij
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {comments.map((c, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-navy-700 bg-navy-900/60 p-6 shadow-xl transition hover:border-slate-main/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-main">
                  {new Date(c.date).toLocaleDateString()}
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${
                      c.rating <= 2 ? 'bg-crimson/15 text-crimson' : 'bg-teal/15 text-teal'
                    }`}
                  >
                    {c.rating <= 2 ? 'Negatywny' : 'Pozytywny'}
                  </span>
                  <span className="text-sm font-semibold text-white">{c.reason}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-navy-700 bg-navy-900/70 px-3 py-2 text-xs text-slate-main">
                Ocena: <span className="text-white">{c.rating}</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-light">{c.comment}</p>

            {(c.screenshotPath || c.screenshotUrl) && (
              <div className="mt-5 border-t border-navy-800 pt-5">
                <p className="text-[10px] uppercase tracking-widest text-slate-main">Zalaczony dowod</p>
                <div
                  className="relative mt-3 h-32 w-32 cursor-zoom-in overflow-hidden rounded-2xl border border-navy-700 bg-navy-900"
                  onClick={() => setLightboxSrc(buildScreenshotSrc(c.screenshotPath, c.screenshotUrl))}
                >
                  <img
                    src={buildScreenshotSrc(c.screenshotPath, c.screenshotUrl)}
                    alt="Screenshot"
                    className="h-full w-full object-cover transition duration-300 hover:scale-110"
                  />
                </div>
              </div>
            )}

            {(c.reportedEmail || c.facebookLink || c.phoneNumber || c.bankAccount) && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-800/60 pt-4">
                {c.phoneNumber && (
                  <div className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-mono text-teal">
                    {c.phoneNumber}
                  </div>
                )}
                {c.bankAccount && (
                  <div className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-mono text-amber">
                    {c.bankAccount}
                  </div>
                )}
                {c.reportedEmail && (
                  <span className="rounded-full border border-slate-main/30 bg-navy-900/60 px-3 py-1 text-xs text-slate-light">
                    {c.reportedEmail}
                  </span>
                )}
                {c.facebookLink && (
                  <a
                    href={c.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-main/30 bg-navy-900/60 px-3 py-1 text-xs text-slate-light transition hover:border-amber/50 hover:text-white"
                  >
                    Profil
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
