'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const action = isRegister ? registerUser : loginUser;
    const res = await action(email, password);

    if (res.error) {
      setError(res.error);
    } else {
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-6 py-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-[-10%] h-[320px] w-[320px] rounded-full bg-amber/20 blur-[120px]" />
        <div className="absolute -bottom-32 left-[-5%] h-[360px] w-[360px] rounded-full bg-teal/20 blur-[140px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl p-8 surface">
        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-main">TrustCheck Access</div>
          <h1 className="text-3xl text-display text-white">
            {isRegister ? 'Dolacz do TrustCheck' : 'Zaloguj sie'}
          </h1>
          <p className="text-sm text-slate-main">
            {isRegister
              ? 'Tworz konto, aby dodawac zgloszenia i alerty.'
              : 'Wroc do raportow i zarzadzaj alertami.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-main">Email</label>
            <input
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 px-4 py-3 text-white outline-none transition focus:border-amber/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-main">Haslo</label>
            <input
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-navy-700 bg-navy-900/70 px-4 py-3 text-white outline-none transition focus:border-amber/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm text-crimson">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-amber py-3 text-sm font-bold uppercase tracking-widest text-navy-900 transition hover:-translate-y-0.5"
          >
            {isRegister ? 'Zarejestruj konto' : 'Zaloguj sie'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-main">
          {isRegister ? 'Masz juz konto?' : 'Nie masz konta?'}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-amber underline underline-offset-4 transition hover:text-amber/80"
          >
            {isRegister ? 'Zaloguj sie' : 'Zarejestruj sie'}
          </button>
        </div>
      </div>
    </div>
  );
}
