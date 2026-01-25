/**
 * ResourceLinks component displays a list of external resource cards for students to access course materials and files.
 * Handles opening links in a new tab and provides a notice about external hosting for large files.
 *
 * Usage:
 * Use this component in the student dashboard or resources page to provide quick access to important links.
 *
 * Avoid hardcoding URLs in multiple places or bypassing the openResource helper to ensure maintainability.
 */
import { ExternalLink, FolderOpen } from 'lucide-react';
import { Button } from '@mui/material';

const ResourceLinks = () => {
  const resources = [
    {
      id: 1,
      title: 'Resources & Files',
      description: 'Access course materials, notes, and documents',
      icon: FolderOpen,
      url: 'https://www.notion.so/Resources-Files-2474174c24878063a205f54ff51bf3a2', // Add your Notion resources URL here
      color: 'dark:bg-emerald-600 light:bg-blue-600',
      shadowColor: 'shadow-emerald-500/20',
      hoverColor: 'hover:shadow-emerald-500/40',
    },
  ];

  const openResource = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Please configure this resource URL in the code');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <ExternalLink className="w-7 h-7 text-sky-400" aria-hidden="true" />
        <h2 className="text-2xl font-bold dark:text-dark-text-primary light:text-light-text-primary">
          Resources & Links
        </h2>
      </div>

      {/* Notice about external hosting for large files */}
        <div className="mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm dark:text-yellow-200 light:text-yellow-800">
          <strong>Note:</strong> Large files (PPTs, PDFs, slide decks, and other course materials) are hosted externally in the course Notion workspace. Click the resource card or "Open in New Tab" to view/download files on Notion.
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <div
              key={resource.id}
              className="dark:bg-slate-900/30 light:!bg-blue-600 border dark:border-slate-800/50 light:!border-blue-500 rounded-xl p-5 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/10 transition-all group cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Open resource: ${resource.title}`}
              onClick={() => openResource(resource.url)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openResource(resource.url);
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 ${resource.color} rounded-lg ${resource.shadowColor} shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold dark:text-dark-text-primary light:text-light-text-primary mb-1 flex items-center gap-2">
                    {resource.title}
                    <ExternalLink className="w-4 h-4 dark:text-sky-400 light:!text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </h3>
                  <p className="text-xs dark:text-dark-text-muted light:text-light-text-muted leading-relaxed">
                    {resource.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExternalLink className="w-3 h-3" aria-hidden="true" />}
                className="mt-4! w-full! normal-case! text-sm! font-medium! dark:border-slate-700! light:border-blue-400 dark:text-sky-400! light:text-light-text-primary hover:border-sky-500! hover:bg-sky-500/5!"
                onClick={e => {
                  e.stopPropagation();
                  openResource(resource.url);
                }}
                aria-label={`Open ${resource.title} in new tab`}
              >
                Open in New Tab
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceLinks;
