// Adres backendu na porcie 3001
const BACKEND_URL = 'http://localhost:3001';

export type SearchType = 'NIP' | 'PHONE';

export interface ReportData {
  query: string;
  isPhone?: boolean; // DODANE
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
      rating?: number;
      // DODANE POLA OSINT:
      phoneNumber?: string; 
      reportedEmail?: string;
      facebookLink?: string;
      bankAccount?: string;
      screenshotUrl?: string;
      screenshotPath?: string;
    }>;
  };
  error?: string;
}

export async function checkCompany(query: string, type: SearchType): Promise<ReportData | null> {
  try {
    let url = '';

    if (type === 'NIP') {
      url = `${BACKEND_URL}/verification/search?query=${query}`;
    } else {
      // FIX: DLA TELEFONU UŻYWAMY DEDYKOWANEGO ENDPOINTU
      const safeQuery = encodeURIComponent(query);
      url = `${BACKEND_URL}/verification/phone/${safeQuery}`;
    }

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error('Network Error:', error);
    return null;
  }
}

export async function loginUser(email: string, pass: string) {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) return { error: 'Błąd logowania' };
  return await res.json();
}

export async function registerUser(email: string, pass: string) {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) return { error: 'Błąd rejestracji (może email zajęty?)' };
  return await res.json();
}

// NOWA FUNKCJA: Upload zdjęcia
export async function uploadScreenshot(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BACKEND_URL}/reports/upload-screenshot`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Błąd uploadu pliku');
  }
  return await res.json(); // { path: "...", url: "..." }
}

export async function submitReport(reportData: any, token: string) {
  const res = await fetch(`${BACKEND_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reportData),
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
    const res = await fetch(`${BACKEND_URL}/reports/latest`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}
