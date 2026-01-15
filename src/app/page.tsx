'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkCompany, getRecentReports, RecentReport } from '@/app/lib/api';

const reasonStyles: Record<string, string> = {
  SCAM: 'border-[#d96a5b]/40 text-[#d96a5b] bg-[#2a1715]',
  SPAM: 'border-[#c6a14b]/40 text-[#c6a14b] bg-[#241d12]',
  TOWAR: 'border-[#4bb08a]/40 text-[#4bb08a] bg-[#16211e]',
  RODO: 'border-[#c6a14b]/40 text-[#c6a14b] bg-[#241d12]',
  OTHER: 'border-[#3a3c42] text-[#a7a9ad] bg-[#16181c]',
};

const typeStyles: Record<string, string> = {
  NIP: 'border-[#c6a14b]/40 text-[#c6a14b] bg-[#1a1711]',
  PHONE: 'border-[#4bb08a]/40 text-[#4bb08a] bg-[#121b19]',
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const router = useRouter();

  const placeholders = [
    'Wpisz numer telefonu...',
    'Wpisz numer NIP...',
    'Wklej numer konta...',
  ];

  useEffect(() => {
    getRecentReports().then((data) => setRecentReports(data));

    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    let i = 0;
    let charIndex = 0;
    let typing = true;
    let timeout: NodeJS.Timeout;
    const type = () => {
      if (typing) {
        if (charIndex <= placeholders[i].length) {
          setPlaceholder(placeholders[i].substring(0, charIndex));
          charIndex++;
          timeout = setTimeout(type, 50);
        } else {
          typing = false;
          timeout = setTimeout(type, 2000);
        }
      } else {
        if (charIndex >= 0) {
          setPlaceholder(placeholders[i].substring(0, charIndex));
          charIndex--;
          timeout = setTimeout(type, 30);
        } else {
          typing = true;
          i = (i + 1) % placeholders.length;
          timeout = setTimeout(type, 200);
        }
      }
    };
    type();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const clean = query.replace(/[^a-zA-Z0-9]/g, '');
    if (/^\d{10}$/.test(clean)) setDetectedType('NIP');
    else if (/^\d{9}$/.test(clean) || /^\+?48\d{9}$/.test(clean)) setDetectedType('PHONE');
    else setDetectedType(null);
  }, [query]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!detectedType) return;
    setIsSearching(true);
    try {
      const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '');
      const data = await checkCompany(cleanQuery, detectedType as 'NIP' | 'PHONE');
      if (data && data.company && detectedType === 'NIP') {
        router.push(`/report/nip/${data.company.nip}`);
        return;
      }
      if (data && detectedType === 'PHONE') {
        const hasReports = data.community && data.community.totalReports > 0;
        if (hasReports || (data.riskLevel !== 'Krytyczny (Nie istnieje)' && data.source !== 'ERROR')) {
          router.push(`/report/phone/${encodeURIComponent(cleanQuery)}`);
          return;
        }
      }
      router.push(`/report/new?value=${cleanQuery}&type=${detectedType}`);
    } catch (e) {
      router.push(`/report/new?value=${query}&type=${detectedType}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const heroReports = recentReports.slice(0, 3);
  const tapeReports = recentReports.slice(0, 9);
  const wallReports = recentReports.slice(0, 6);
  const ctaHref = isLoggedIn ? '/report/new' : '/login';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0c0d] text-[#f4f2ee]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-[-10%] h-[520px] w-[520px] rounded-full bg-[#2a2f2b] blur-[200px]" />
        <div className="absolute -bottom-56 right-[-12%] h-[560px] w-[560px] rounded-full bg-[#1b2722] blur-[220px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,161,75,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 bg-noise opacity-30" />
      </div>

      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#2a2d31] bg-[#121417] text-display text-lg text-[#f4f2ee]">
            TC
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.45em] text-[#8f949c]">TrustCheck</div>
            <div className="text-xs text-[#8f949c]">Trust Intelligence</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/report/new"
                className="rounded-full bg-[#c6a14b] px-5 py-2 text-xs font-bold uppercase tracking-widest text-[#0b0c0d] shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
              >
                Nowy raport
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#2a2d31] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[#8f949c] transition hover:border-[#c6a14b] hover:text-[#f4f2ee]"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#2a2d31] bg-[#121417] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f4f2ee] transition hover:border-[#c6a14b]"
            >
              Zaloguj sie
            </Link>
          )}
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-14 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#24272c] bg-[#121417] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
            <span className="h-2 w-2 rounded-full bg-[#4bb08a] shadow-[0_0_0_6px_rgba(75,176,138,0.15)]" />
            Historia zaczyna sie od sygnalu
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-[1.05] text-display md:text-6xl">
              Twoja decyzja ma znaczenie. Zobacz ryzyko, zanim klikniesz "zaplac".
            </h1>
            <p className="text-lg text-[#b2b6bd] md:text-xl">
              TrustCheck to premiumowy dostep do sygnalow oszustw, historii zgloszen i powiazan
              numerow. Jedna minuta analizy oszczedza tygodnie problemow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={ctaHref}
              className="rounded-full bg-[#c6a14b] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0b0c0d] shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
            >
              Kup dostep premium
            </Link>
            <Link
              href="/report/new"
              className="rounded-full border border-[#2a2d31] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#8f949c] transition hover:border-[#c6a14b] hover:text-[#f4f2ee]"
            >
              Dodaj zgloszenie
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Zrodla', value: 'Bazy, spolecznosc, wzorce' },
              { label: 'Wartosci', value: 'Ocena ryzyka i wiarygodnosci' },
              { label: 'Czas', value: 'Sygnał w kilka sekund' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#24272c] bg-[#121417] p-4 text-sm text-[#b2b6bd]"
              >
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">{item.label}</div>
                <div className="mt-2 text-[#f4f2ee]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-[#2a2d31] bg-[#121417] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8f949c]">
              <span>Storyline</span>
              <span>Act I</span>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: 'Nieznany numer dzwoni',
                  desc: 'Pojawia sie oferta, presja, krótki termin. To klasyczny poczatek.',
                },
                {
                  title: 'Skanujesz sygnal',
                  desc: 'Weryfikujesz numer, konto i historie zgloszen w jednym miejscu.',
                },
                {
                  title: 'Masz dowod',
                  desc: 'Widzisz ocene ryzyka, komentarze i rekomendacje dzialan.',
                },
              ].map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2d31] bg-[#0b0c0d] text-xs uppercase tracking-[0.3em] text-[#c6a14b]">
                    {`0${index + 1}`}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#f4f2ee]">{item.title}</div>
                    <div className="mt-1 text-sm text-[#b2b6bd]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#2a2d31] bg-[#0f1114] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Sygnały teraz</div>
            <div className="mt-5 grid gap-3">
              {heroReports.length > 0 ? (
                heroReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => {
                      const url =
                        report.targetType === 'NIP'
                          ? `/report/nip/${report.targetValue}`
                          : `/report/phone/${encodeURIComponent(report.targetValue)}`;
                      router.push(url);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#2a2d31] bg-[#121417] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#c6a14b]"
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
                        {report.targetType === 'NIP' ? 'Firma' : 'Telefon'}
                      </div>
                      <div className="mt-1 font-mono text-sm text-[#f4f2ee]">{report.targetValue}</div>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.28em] ${
                        reasonStyles[report.reason] || 'border-[#2a2d31] text-[#8f949c]'
                      }`}
                    >
                      {report.reason}
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#2a2d31] px-4 py-6 text-center text-sm text-[#8f949c]">
                  Brak swiezych alertow.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[#2a2d31] bg-[#121417] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Act II - Moment decyzji</div>
            <h2 className="mt-3 text-2xl text-display text-[#f4f2ee] md:text-3xl">
              Jedno wyszukiwanie. Pełny obraz ryzyka.
            </h2>
            <p className="mt-3 text-sm text-[#b2b6bd]">
              Zanim zaplacisz, sprawdzasz. Widzisz historie, oceny i powiazania. To roznica
              miedzy spokojem a strata.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'Korelacje numerow i kont bankowych',
                'Ocena ryzyka na podstawie zgloszen',
                'Wczesne sygnaly z community',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#2a2d31] bg-[#0f1114] px-4 py-3 text-sm text-[#b2b6bd]">
                  <span className="h-2 w-2 rounded-full bg-[#c6a14b]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#2a2d31] bg-[#0f1114] p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Act III - Zysk z pewnosci</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#2a2d31] bg-[#121417] p-4">
                <div className="text-2xl font-semibold text-display">{recentReports.length}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">Nowe sygnaly</div>
              </div>
              <div className="rounded-2xl border border-[#2a2d31] bg-[#121417] p-4">
                <div className="text-2xl font-semibold text-display">24/7</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">Monitoring</div>
              </div>
              <div className="rounded-2xl border border-[#2a2d31] bg-[#121417] p-4">
                <div className="text-2xl font-semibold text-display">98%</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">Zgodnosc danych</div>
              </div>
              <div className="rounded-2xl border border-[#2a2d31] bg-[#121417] p-4">
                <div className="text-2xl font-semibold text-display">5x</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">Szybciej niz recznie</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="rounded-[32px] border border-[#2a2d31] bg-[#121417] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#8f949c]">Story tape</div>
              <h3 className="mt-2 text-xl text-display text-[#f4f2ee]">Rzeczywiste sygnaly z bazy</h3>
            </div>
            <div className="text-xs text-[#8f949c]">Przesun, aby zobaczyc wiecej</div>
          </div>
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {tapeReports.length > 0 ? (
              tapeReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    const url =
                      report.targetType === 'NIP'
                        ? `/report/nip/${report.targetValue}`
                        : `/report/phone/${encodeURIComponent(report.targetValue)}`;
                    router.push(url);
                  }}
                  className="min-w-[240px] rounded-2xl border border-[#2a2d31] bg-[#0f1114] px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#c6a14b]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.3em] ${typeStyles[report.targetType]}`}>
                      {report.targetType === 'NIP' ? 'Firma' : 'Telefon'}
                    </span>
                    <span className="text-xs text-[#8f949c]">{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 font-mono text-sm text-[#f4f2ee]">{report.targetValue}</div>
                  <div className="mt-3 text-xs text-[#8f949c] line-clamp-2">{report.comment}</div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2a2d31] px-4 py-6 text-center text-sm text-[#8f949c]">
                Brak swiezych alertow.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-[#2a2d31] bg-[#0f1114] p-6">
            <div className="text-xs uppercase tracking-[0.35em] text-[#8f949c]">Dostep premium</div>
            <h2 className="mt-3 text-2xl text-display text-[#f4f2ee] md:text-3xl">
              Odblokuj pelny obraz ryzyka.
            </h2>
            <p className="mt-3 text-sm text-[#b2b6bd]">
              Dostep premium otwiera pelne raporty, wczesne ostrzezenia i zaawansowane filtry.
              To decyzja, ktora chroni Twoj czas i pieniadze.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="rounded-full bg-[#c6a14b] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#0b0c0d] shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
              >
                Aktywuj premium
              </Link>
              <span className="text-xs uppercase tracking-[0.3em] text-[#8f949c]">Start od 59 zl / mies.</span>
            </div>
          </div>

          <div className="rounded-[32px] border border-[#2a2d31] bg-[#121417] p-6">
            <div className="text-xs uppercase tracking-[0.35em] text-[#8f949c]">Panel sprawdzania</div>
            <h3 className="mt-3 text-xl text-display text-[#f4f2ee]">Przetestuj sygnal</h3>
            <p className="mt-2 text-sm text-[#b2b6bd]">
              Wpisz dane i zobacz, jak dziala analiza. Pelne raporty sa dostepne w premium.
            </p>

            <form onSubmit={handleSearch} className="relative mt-5">
              <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-r from-[#c6a14b]/35 via-[#4bb08a]/20 to-[#d96a5b]/25 blur-lg opacity-60" />
              <div className="relative flex flex-wrap items-center gap-3 rounded-[26px] border border-[#2a2d31] bg-[#0b0c0d] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <div className="rounded-2xl border border-[#2a2d31] bg-[#121417] px-4 py-3 text-[10px] uppercase tracking-[0.35em] text-[#8f949c]">
                  {detectedType ?? 'AUTO'}
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="min-w-[180px] flex-1 bg-transparent px-2 py-3 text-base text-[#f4f2ee] outline-none placeholder:text-[#6f737b] md:text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-2xl bg-[#c6a14b] px-6 py-3 text-xs font-bold uppercase tracking-[0.35em] text-[#0b0c0d] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSearching ? 'Skanuje...' : 'Skanuj'}
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.3em] text-[#8f949c]">
              {['NIP', 'Telefon', 'Konto bankowe', 'E-mail'].map((item) => (
                <span key={item} className="rounded-full border border-[#2a2d31] bg-[#0f1114] px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {wallReports.length > 0 && (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#8f949c]">Proof wall</div>
              <h2 className="text-xl text-display text-[#f4f2ee] md:text-2xl">
                Dowod spoleczny i realne historie
              </h2>
            </div>
            <div className="text-xs text-[#8f949c]">
              Aktualizacja: {new Date(wallReports[0].date).toLocaleDateString()}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallReports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  const url =
                    report.targetType === 'NIP'
                      ? `/report/nip/${report.targetValue}`
                      : `/report/phone/${encodeURIComponent(report.targetValue)}`;
                  router.push(url);
                }}
                className="group cursor-pointer rounded-3xl border border-[#2a2d31] bg-[#121417] p-5 transition hover:-translate-y-1 hover:border-[#c6a14b]"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.3em] ${typeStyles[report.targetType]}`}>
                    {report.targetType === 'NIP' ? 'Firma' : 'Telefon'}
                  </span>
                  <span className="text-xs text-[#8f949c]">{new Date(report.date).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 font-mono text-lg text-[#f4f2ee] truncate">{report.targetValue}</div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#c6a14b]">
                    {Array.from({ length: report.rating }).map((_, idx) => (
                      <svg
                        key={idx}
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2.75l2.83 5.74 6.33.92-4.58 4.46 1.08 6.3L12 17.77l-5.66 2.97 1.08-6.3-4.58-4.46 6.33-.92L12 2.75z" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.28em] ${
                      reasonStyles[report.reason] || 'border-[#2a2d31] text-[#8f949c]'
                    }`}
                  >
                    {report.reason}
                  </span>
                </div>

                <p className="mt-4 text-sm text-[#b2b6bd] line-clamp-3">{report.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs uppercase tracking-[0.35em] text-[#8f949c]">
          <span>CEIDG</span>
          <span>GUS / REGON</span>
          <span>CERT POLSKA</span>
        </div>
      </section>
    </main>
  );
}
