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
      rating?: number;     // <--- DODAJ TĘ LINIJKĘ (było jej brak)
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
      // Dla NIP używamy uniwersalnego search (on sam przekieruje na logikę firmy)
      url = `${BACKEND_URL}/verification/search/${query}`;
    } else {
      // === FIX: DLA TELEFONU UŻYWAMY DEDYKOWANEGO ENDPOINTU ===
      // Musimy zakodować plusa w numerze (np. +48...)
      const safeQuery = encodeURIComponent(query);
      url = `${BACKEND_URL}/verification/phone/${safeQuery}`;
    }

    const res = await fetch(url, {
      cache: 'no-store', // Wyłączamy cache, żeby widzieć nowe zgłoszenia od razu
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      // Jeśli 404 lub 400 - to znaczy że numeru nie ma lub błędny
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
export interface RecentReport {
    id: number;
    targetValue: string;
    targetType: 'NIP' | 'PHONE';
    trustScore: number;
    rating: number;
    reason: string;
    comment: string;
    date: string;
}

export async function getRecentReports(): Promise<RecentReport[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/reports/latest`, { 
            cache: 'no-store' // Zawsze świeże dane
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}