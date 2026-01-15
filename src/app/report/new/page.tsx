'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// Importujemy Twój gotowy komponent
import NewReportForm from '../../../components/NewReportForm';

function NewReportWrapper() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('value') || '';
  const initialType = searchParams.get('type') || 'NIP';

  // Przekazujemy dane do formularza
  return <NewReportForm initialValue={initialValue} initialType={initialType} />;
}

export default function NewReportPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white py-12 px-4">
      <Suspense fallback={<div className="text-center text-slate-400">Ładowanie formularza...</div>}>
        <NewReportWrapper />
      </Suspense>
    </main>
  );
}
