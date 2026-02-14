'use client';

import { Suspense } from 'react';
import { MermaidEditorClient } from './client';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading editor...</p>
      </div>
    </div>
  );
}

export default function MermaidEditorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MermaidEditorClient />
    </Suspense>
  );
}
