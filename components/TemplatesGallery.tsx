'use client';

import { MermaidTemplate } from '../lib/templates';

interface TemplatesGalleryProps {
  templates: MermaidTemplate[];
  onSelectTemplate: (code: string) => void;
  onClose: () => void;
}

export function TemplatesGallery({ templates, onSelectTemplate, onClose }: TemplatesGalleryProps) {
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MermaidTemplate[]>);

  const categories = Object.keys(groupedTemplates);

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 shadow-sm">
      <div className="container-grid py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">Templates Gallery</h2>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center">
                <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs font-semibold mr-2">
                  {category}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedTemplates[category].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template.code)}
                    className="text-left p-4 border border-zinc-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group bg-zinc-900"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-zinc-100 group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h4>
                      <svg 
                        className="h-5 w-5 text-zinc-500 group-hover:text-blue-400 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-zinc-400">{template.description}</p>
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <code className="text-xs text-zinc-500 font-mono line-clamp-2">
                        {template.code.split('\n')[0]}...
                      </code>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
