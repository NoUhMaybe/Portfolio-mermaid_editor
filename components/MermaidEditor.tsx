'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useDebouncedCallback } from 'use-debounce';

interface MermaidEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MermaidEditor({ value, onChange }: MermaidEditorProps) {
  const editorRef = useRef<any>(null);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useDebouncedCallback((newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }, 300);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Register Mermaid language if not already registered
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'mermaid')) {
      monaco.languages.register({ id: 'mermaid' });

      // Define syntax highlighting for Mermaid
      monaco.languages.setMonarchTokensProvider('mermaid', {
        keywords: [
          'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 
          'erDiagram', 'gantt', 'pie', 'gitGraph', 'journey', 'requirementDiagram',
          'TD', 'TB', 'BT', 'RL', 'LR', 'participant', 'actor', 'class', 'state',
          'title', 'dateFormat', 'section', 'loop', 'alt', 'opt', 'par', 'and',
          'else', 'end', 'Note', 'autonumber', 'activate', 'deactivate'
        ],
        operators: [
          '-->', '--->', '-.->','==>','--', '->','<->','o--o', 
          '|', '||--||', '||--|{', '}|..|{', '||--o{', '}o--||'
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        tokenizer: {
          root: [
            [/[a-z_$][\w$]*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/[A-Z][\w\$]*/, 'type.identifier'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string'],
            [/\d+/, 'number'],
            [/[;,.]/, 'delimiter'],
            [/[()\[\]{}]/, '@brackets'],
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
          ],
          string: [
            [/[^\\"]+/, 'string'],
            [/"/, 'string', '@pop']
          ],
        }
      });
    }

    // Always define/redefine the dark theme to ensure it's applied
    monaco.editor.defineTheme('mermaidDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'operator', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'type.identifier', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.background': '#18181b',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#27272a',
        'editorLineNumber.foreground': '#71717a',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editorCursor.foreground': '#60a5fa',
        'editor.selectionBackground': '#3b82f640',
        'editor.inactiveSelectionBackground': '#3b82f620',
      }
    });
    
    // Set the theme explicitly
    monaco.editor.setTheme('mermaidDark');
  };

  return (
    <div className="h-[400px] lg:h-[calc(100vh-220px)] lg:min-h-[600px] w-full">
      <Editor
        height="100%"
        defaultLanguage="mermaid"
        language="mermaid"
        value={value}
        onChange={debouncedOnChange}
        onMount={handleEditorDidMount}
        theme="mermaidDark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
