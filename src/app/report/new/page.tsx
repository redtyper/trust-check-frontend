'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NewReportForm from '../../../components/NewReportForm';

function NewReportWrapper() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('value') || '';
  const initialType = searchParams.get('type') || 'NIP';

  return <NewReportForm initialValue={initialValue} initialType={initialType} />;
}

export default function NewReportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-900 px-6 py-16 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[-10%] h-[360px] w-[360px] rounded-full bg-amber/20 blur-[140px]" />
        <div className="absolute -bottom-32 right-[-5%] h-[400px] w-[400px] rounded-full bg-teal/20 blur-[160px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>
      <Suspense fallback={<div className="relative z-10 text-center text-slate-main">Ladowanie formularza...</div>}>
        <div className="relative z-10">
          <NewReportWrapper />
        </div>
      </Suspense>
    </main>
  );
}
