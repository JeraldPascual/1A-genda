/**
 * LinkifiedText component scans plain text for URLs and renders them as clickable, safe external links.
 * Automatically adds https:// to 'www.' links and prevents event propagation on link clicks.
 *
 * Props:
 * - text (string): The text to scan and render with links.
 * - className (string): Optional additional class names for the container.
 *
 * Usage:
 * Use this component to safely display user or admin text with automatic URL linking in announcements, tasks, or comments.
 *
 * Avoid injecting raw HTML or bypassing the linkification logic to prevent XSS and navigation bugs.
 */
import { ExternalLink } from 'lucide-react';

const LinkifiedText = ({ text, className = '' }) => {
  if (!text) return null;

  // Regular expression to detect URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

  // Split text by URLs
  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlRegex)) {
          // Add https:// if it starts with www.
          const href = part.startsWith('www.') ? `https://${part}` : part;

          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline decoration-sky-400/50 hover:decoration-sky-300 transition-colors inline-flex items-center gap-1 break-all"
              onClick={(e) => e.stopPropagation()}
              aria-label={`External link: ${part}`}
            >
              {part}
              <ExternalLink className="w-3 h-3 inline shrink-0" />
            </a>
          );
        }
        // Return regular text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default LinkifiedText;
