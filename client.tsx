'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { TemplatesGallery } from './components/TemplatesGallery';
import { ErrorPanel } from './components/ErrorPanel';
import { ExportModal } from './components/ExportModal';
import { templates } from './lib/templates';
import { validateEncodedDiagram } from './lib/security';

// SECURITY NOTE: Dynamic imports prevent server-side rendering of browser-only APIs
// This allows Next.js to handle SSR separately while Monaco/Mermaid only run client-side
// See lib/security.ts for additional validation and rate limiting utilities

// Dynamically import components that use browser APIs to prevent SSR issues
const MermaidEditor = dynamic(
  () => import('./components/MermaidEditor').then(mod => ({ default: mod.MermaidEditor })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Loading Editor...</p>
        </div>
      </div>
    )
  }
);

const MermaidPreview = dynamic(
  () => import('./components/MermaidPreview').then(mod => ({ default: mod.MermaidPreview })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Loading Preview...</p>
        </div>
      </div>
    )
  }
);

export function MermaidEditorClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>(() => {
    try {
      const diagramParam = searchParams.get('diagram');
      if (diagramParam) {
        // SECURITY: Validate URL-encoded diagram before decoding
        // This prevents processing of malformed or excessively long URLs
        // See lib/security.ts::validateEncodedDiagram for implementation
        const validation = validateEncodedDiagram(diagramParam);
        if (!validation.valid) {
          console.error('Invalid diagram in URL:', validation.error);
          return templates[0].code;
        }
        const decoded = decodeURIComponent(atob(diagramParam));
        return decoded;
      }
    } catch (err) {
      console.error('Failed to decode diagram:', err);
    }
    return templates[0].code;
  });
  
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleTemplateSelect = (templateCode: string) => {
    setCode(templateCode);
    // Trigger closing animation
    setIsClosing(true);
    setTimeout(() => {
      setShowTemplates(false);
      setIsAnimating(false);
      setIsClosing(false);
    }, 500);
    setError(null);
  };

  const handleToggleTemplates = () => {
    if (!showTemplates) {
      // Opening
      setIsAnimating(true);
      setTimeout(() => setShowTemplates(true), 300);
    } else {
      // Closing
      setIsClosing(true);
      setTimeout(() => {
        setShowTemplates(false);
        setTimeout(() => {
          setIsAnimating(false);
          setIsClosing(false);
        }, 300);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 pb-4">
      <div className="pt-28">
        <div className="container-grid">
          <h1 className="text-3xl font-semibold mb-2">Mermaid Chart Editor</h1>
          <p className="text-zinc-300 mb-4">Create and visualize Mermaid diagrams with live preview, syntax highlighting, and useful reference templates.</p>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button
              onClick={handleToggleTemplates}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm hover:bg-neutral-700 transition-colors"
            >
              {showTemplates ? 'Hide Templates' : 'Browse Templates'}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm hover:bg-neutral-700 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Split Animation Overlay */}
      {(isAnimating || isClosing) && (
        <div className="relative w-full h-0.5 overflow-hidden">
          <div className={`absolute left-1/2 h-0.5 bg-white ${isClosing ? 'animate-split-horizontal-reverse' : 'animate-split-horizontal'}`} />
        </div>
      )}

      {/* Templates Gallery */}
      {showTemplates && (
        <div className={`mb-6 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}>
          <TemplatesGallery
            templates={templates}
            onSelectTemplate={handleTemplateSelect}
            onClose={handleToggleTemplates}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Editor Panel */}
          <div className="bg-zinc-950 rounded-lg shadow-lg overflow-hidden border border-zinc-800 lg:col-span-1">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-700">
              <h2 className="text-sm font-semibold text-zinc-200">Editor</h2>
            </div>
            <MermaidEditor
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Preview Panel */}
          <div className="bg-zinc-950 rounded-lg shadow-lg overflow-hidden border border-zinc-800 lg:col-span-2">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-700">
              <h2 className="text-sm font-semibold text-zinc-200">Preview</h2>
            </div>
            <MermaidPreview
              code={code}
              onError={setError}
            />
          </div>
        </div>

        {/* Error Panel */}
        {error && (
          <div className="mt-6">
            <ErrorPanel error={error} onClose={() => setError(null)} />
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal code={code} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
