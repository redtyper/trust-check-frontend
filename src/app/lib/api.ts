// Adres backendu na porcie 3001
const BACKEND_URL = 'http://localhost:3001'; 

export type SearchType = 'NIP' | 'PHONE';

export interface ReportData {
  query: string;
  trustScore: number;
  riskLevel: string;
  source: string;
  company?: {
    name: string;
    nip: string;
    vat: string;
    phones: Array<{ id: string; number: string; trustScore: number }>;
    address?: string;
    regDate?: string;
  };
  community?: {
    alerts: number;
    totalReports: number;
    latestComments: Array<{
      date: string;
      reason: string;
      comment: string;
      reportedEmail?: string;
      facebookLink?: string;
      screenshotUrl?: string;
    }>;
  };
  error?: string;
}

export async function checkCompany(query: string, type: SearchType): Promise<ReportData | null> {
  try {
    let url = '';

    if (type === 'NIP') {
      // Endpoint search w backendzie obsługuje logikę NIP/Tel, 
      // ale możemy też uderzać bezpośrednio jeśli wolisz.
      // Użyjmy uniwersalnego endpointu search, który stworzyliśmy w serwisie:
      url = `${BACKEND_URL}/verification/search/${query}`;
    } else {
      const safeQuery = encodeURIComponent(query);
      url = `${BACKEND_URL}/verification/search/${safeQuery}`;
    }

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.error(`API Error ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
}
export async function loginUser(email: string, pass: string) {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) return { error: 'Błąd logowania' };
    return await res.json();
}

export async function registerUser(email: string, pass: string) {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) return { error: 'Błąd rejestracji (może email zajęty?)' };
    return await res.json();
}

export async function submitReport(reportData: any, token: string) {
    const res = await fetch(`${BACKEND_URL}/reports`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Przesyłamy token
        },
        body: JSON.stringify(reportData)
    });
    return res.ok;
}