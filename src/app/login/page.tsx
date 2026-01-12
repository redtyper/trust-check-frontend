'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const action = isRegister ? registerUser : loginUser;
    const res = await action(email, password);

    if (res.error) {
        setError(res.error);
    } else {
        // SUKCES: Zapisz token
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        // Przekieruj na stronę główną (lub tam skąd przyszedł)
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="bg-navy-800 p-8 rounded-2xl border border-navy-700 shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
            {isRegister ? 'Dołącz do Verify360' : 'Zaloguj się'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-main text-sm mb-1">Email</label>
                <input 
                    type="email" required
                    className="w-full bg-navy-900 border border-navy-700 rounded p-3 text-white focus:border-teal outline-none"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-slate-main text-sm mb-1">Hasło</label>
                <input 
                    type="password" required
                    className="w-full bg-navy-900 border border-navy-700 rounded p-3 text-white focus:border-teal outline-none"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
            </div>
            
            {error && <div className="text-crimson text-sm">{error}</div>}

            <button type="submit" className="w-full bg-teal hover:bg-green-700 text-white font-bold py-3 rounded transition-colors">
                {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
            </button>
        </form>

        <p className="mt-6 text-center text-slate-main text-sm">
            {isRegister ? 'Masz już konto?' : 'Nie masz konta?'}
            <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-blue-400 hover:text-white underline"
            >
                {isRegister ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
        </p>
      </div>
    </div>
  );
}
