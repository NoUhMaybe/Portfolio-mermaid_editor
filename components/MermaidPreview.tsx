'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidPreviewProps {
  code: string;
  onError: (error: string | null) => void;
}

export function MermaidPreview({ code, onError }: MermaidPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    // Initialize Mermaid with dark theme
    // Security notes:
    // - securityLevel set to 'strict' to prevent XSS attacks via clickable elements
    // - Mermaid diagrams are rendered after validation in the security module
    // - Always validate user input in production environments
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict', // Prevents clickable elements (onclick handlers)
      fontFamily: 'arial',
      logLevel: 'error',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code.trim()) {
        return;
      }

      setIsLoading(true);
      onError(null);

      try {
        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create a unique ID for this render
        const id = `mermaid-${Date.now()}`;
        
        // Validate and render
        const { svg } = await mermaid.render(id, code);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRendered(true);
          onError(null);
        }
      } catch (error: any) {
        setRendered(false);
        const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
        onError(errorMessage);
        
        // Display error in preview
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full p-8">
              <div class="text-center text-zinc-400">
                <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm font-medium">Render Error</p>
                <p class="text-xs mt-1">Check the error panel below for details</p>
              </div>
            </div>
          `;
        }
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [code, onError]);

  return (
    <div className="relative h-[calc(100vh-220px)] min-h-[600px] w-full overflow-auto bg-zinc-900 p-4 lg:p-8">
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-900 bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex items-center justify-center min-h-full"
      />
    </div>
  );
}
