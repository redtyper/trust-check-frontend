// src/lib/api.ts

const BACKEND_URL = 'http://127.0.0.1:3000';


// Typy dla TypeScript, żeby nie krzyczał
type SearchType = 'NIP' | 'PHONE';

export async function checkCompany(query: string, type: SearchType) {
  try {
    let url = '';

    if (type === 'NIP') {
      // Endpoint dla NIP-ów
      // UWAGA: Upewnij się, że w backendzie masz endpoint: /verification/company/:nip
      // Jeśli w backendzie używasz /verification/search/:query, to użyj tego drugiego.
      // Zakładam wersję ze starym endpointem dla pewności:
      url = `${BACKEND_URL}/verification/company/${query}`; 
    } else {
      // Endpoint dla Telefonów
      // Ważne: kodujemy "+" (plus) na %2B, żeby nie zepsuł URL-a
      const safeQuery = encodeURIComponent(query);
      url = `${BACKEND_URL}/verification/phone/${safeQuery}`;
    }

    const res = await fetch(url, {
      cache: 'no-store', // Next.js cache bypass
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // Jeśli backend zwróci 404 lub 500
      if (res.status === 404) return null;
      console.error(`API Error ${res.status}:`, await res.text());
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
}
