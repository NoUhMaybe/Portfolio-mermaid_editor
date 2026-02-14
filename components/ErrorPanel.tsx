'use client';

interface ErrorPanelProps {
  error: string;
  onClose: () => void;
}

export function ErrorPanel({ error, onClose }: ErrorPanelProps) {
  // Parse error message to extract useful information
  const parseError = (errorMsg: string) => {
    const lines = errorMsg.split('\n');
    const mainError = lines[0];
    
    // Try to extract line number if present
    const lineMatch = errorMsg.match(/line (\d+)/i);
    const line = lineMatch ? lineMatch[1] : null;
    
    // Try to extract position if present
    const posMatch = errorMsg.match(/position (\d+)/i);
    const position = posMatch ? posMatch[1] : null;
    
    return {
      message: mainError,
      line,
      position,
      fullError: errorMsg
    };
  };

  const parsedError = parseError(error);

  return (
    <div className="bg-red-950 border border-red-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-white font-semibold">Mermaid Parse Error</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-red-200 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error Content */}
      <div className="p-6">
        {/* Main Error Message */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-300 mb-2">Error Message:</h4>
          <p className="text-sm text-red-200 bg-red-900/50 p-3 rounded border border-red-800 font-mono">
            {parsedError.message}
          </p>
        </div>

        {/* Location Information */}
        {(parsedError.line || parsedError.position) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-300 mb-2">Location:</h4>
            <div className="flex gap-4 text-sm">
              {parsedError.line && (
                <div className="bg-red-900/50 px-3 py-2 rounded border border-red-800">
                  <span className="text-red-300 font-medium">Line:</span>{' '}
                  <span className="text-red-100 font-mono">{parsedError.line}</span>
                </div>
              )}
              {parsedError.position && (
                <div className="bg-red-900/50 px-3 py-2 rounded border border-red-800">
                  <span className="text-red-300 font-medium">Position:</span>{' '}
                  <span className="text-red-100 font-mono">{parsedError.position}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Error Details */}
        {parsedError.fullError !== parsedError.message && (
          <details className="mt-4">
            <summary className="text-sm font-medium text-red-300 cursor-pointer hover:text-red-200">
              Show Full Error Details
            </summary>
            <pre className="mt-2 text-xs text-red-200 bg-red-900/50 p-3 rounded border border-red-800 overflow-x-auto font-mono whitespace-pre-wrap">
              {parsedError.fullError}
            </pre>
          </details>
        )}

        {/* Help Text */}
        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-800 rounded">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Check for syntax errors in your Mermaid code</li>
                <li>Ensure all brackets and parentheses are properly closed</li>
                <li>Verify that diagram type keywords are spelled correctly</li>
                <li>Try selecting a template to see valid syntax examples</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
