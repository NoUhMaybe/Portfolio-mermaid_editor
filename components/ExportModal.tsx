'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { canExportToday, recordExport, validateDiagramCode, RATE_LIMITS } from '../lib/security';

interface ExportModalProps {
  code: string;
  onClose: () => void;
}

export function ExportModal({ code, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'svg' | 'png' | 'pdf'>('svg');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTransparent, setIsTransparent] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(RATE_LIMITS.EXPORTS_PER_DAY);
  const previewRef = useRef<HTMLDivElement>(null);

  // Check export limits on mount
  useEffect(() => {
    const { allowed, remaining: rem } = canExportToday();
    setRemaining(rem);
    if (!allowed) {
      setExportError('Daily export limit reached. Try again tomorrow.');
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  // Generate encoded URL
  useEffect(() => {
    const compressed = btoa(encodeURIComponent(code));
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    // Add query parameter without duplicating if it already exists
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}diagram=${compressed}`;
    setEncodedUrl(url);
  }, [code]);

  // Render preview
  useEffect(() => {
    const renderPreview = async () => {
      if (!previewRef.current || !code.trim()) return;

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'arial',
          logLevel: 'error',
        });

        previewRef.current.innerHTML = '';
        const id = `export-preview-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        
        if (previewRef.current) {
          previewRef.current.innerHTML = svg;
          
          // Apply transparent background if needed
          const svgElement = previewRef.current.querySelector('svg');
          if (svgElement && isTransparent) {
            svgElement.style.backgroundColor = 'transparent';
          }
        }
      } catch (error) {
        console.error('Preview render error:', error);
      }
    };

    renderPreview();
  }, [code, isDarkMode, isTransparent]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(encodedUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleExport = async () => {
    setExportError(null);
    
    // Validate diagram code
    const validation = validateDiagramCode(code);
    if (!validation.valid) {
      setExportError(`Security check failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Check rate limit
    const { allowed, remaining: rem } = canExportToday();
    if (!allowed) {
      setExportError('Daily export limit reached (50 exports/day). Try again tomorrow.');
      return;
    }

    if (!previewRef.current) return;
    
    const svgElement = previewRef.current.querySelector('svg');
    if (!svgElement) return;

    setIsExporting(true);

    if (exportFormat === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mermaid-diagram.svg';
      link.click();
      URL.revokeObjectURL(url);
      recordExport();
      const { remaining: rem } = canExportToday();
      setRemaining(rem);
      setIsExporting(false);
    } else if (exportFormat === 'png') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Scale factor for high resolution export (3x for retina displays)
      const scale = 3;
      
      img.onload = () => {
        // Get SVG dimensions or use naturalWidth/Height
        const width = svgElement.viewBox.baseVal.width || svgElement.width.baseVal.value || img.width;
        const height = svgElement.viewBox.baseVal.height || svgElement.height.baseVal.value || img.height;
        
        // Set canvas to high resolution
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        if (ctx) {
          // Scale context for high resolution
          ctx.scale(scale, scale);
          
          // Fill background if not transparent
          if (!isTransparent) {
            ctx.fillStyle = isDarkMode ? '#18181b' : '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }
          
          // Draw image at original size (context is scaled)
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'mermaid-diagram.png';
            link.click();
            URL.revokeObjectURL(pngUrl);
            recordExport();
            const { remaining: rem } = canExportToday();
            setRemaining(rem);
            setIsExporting(false);
          }
        }, 'image/png', 1.0);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (exportFormat === 'pdf') {
      // For PDF, we'll use the browser's print functionality
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Mermaid Diagram - Print to PDF</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  background: ${isTransparent ? 'transparent' : (isDarkMode ? '#18181b' : '#ffffff')};
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                svg {
                  max-width: 100%;
                  height: auto;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                }
              </style>
            </head>
            <body>
              ${svgData}
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                  }, 250);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        recordExport();
        const { remaining: rem } = canExportToday();
        setRemaining(rem);
        setIsExporting(false);
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      {/* Backdrop blur */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isClosing ? 'animate-modal-out' : 'animate-modal-in'}`}>
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Export Diagram</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Export as:</h3>
            <div className="flex gap-2">
              {(['svg', 'png', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exportFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Options:</h3>
            
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </button>

            {/* Transparent Background */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => setIsTransparent(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
              />
              <span className="text-sm text-zinc-300">Transparent Background</span>
            </label>
          </div>

          {/* Encoded URL */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Share Link:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={encodedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-mono truncate"
              />
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCopied
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Preview:</h3>
            <div className={`border border-zinc-700 rounded-lg p-4 overflow-auto max-h-96 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
              <div ref={previewRef} className="flex items-center justify-center min-h-[200px]" />
            </div>
          </div>

          {/* Security Info & Error */}
          <div className="space-y-3">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Exports used today:</span>
                <span className={`text-sm font-semibold ${remaining <= 5 ? 'text-orange-400' : 'text-green-400'}`}>
                  {RATE_LIMITS.EXPORTS_PER_DAY - remaining} / {RATE_LIMITS.EXPORTS_PER_DAY}
                </span>
              </div>
              <div className="mt-2 w-full bg-zinc-700 rounded-full h-1.5">
                <div 
                  className={`h-full rounded-full transition-all ${remaining <= 5 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${((RATE_LIMITS.EXPORTS_PER_DAY - remaining) / RATE_LIMITS.EXPORTS_PER_DAY) * 100}%` }}
                />
              </div>
            </div>

            {exportError && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                <p className="text-sm text-red-300">{exportError}</p>
              </div>
            )}

            {remaining <= 5 && remaining > 0 && (
              <div className="bg-orange-900/30 border border-orange-700/50 rounded-lg p-3">
                <p className="text-sm text-orange-300">⚠️ Only {remaining} export{remaining === 1 ? '' : 's'} remaining today</p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || exportError !== null}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                isExporting || exportError !== null
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
