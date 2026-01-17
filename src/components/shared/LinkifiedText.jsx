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
