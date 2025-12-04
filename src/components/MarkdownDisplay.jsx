import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownDisplay = ({ content, className = '' }) => {
  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4" style={{ color: 'var(--color-primary)' }} {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2 mt-3" style={{ color: 'var(--color-primary)' }} {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-2" style={{ color: 'var(--color-primary)' }} {...props} />,
    code: ({node, inline, ...props}) =>
      inline ?
        <code className="markdown-inline-code" {...props} /> :
        <code className="markdown-code-block" {...props} />,
    a: ({node, href, ...props}) => {
      // Fix URLs that don't start with http:// or https://
      let fixedHref = href;
      if (href && !href.match(/^https?:\/\//i) && !href.match(/^mailto:/i)) {
        fixedHref = 'https://' + href;
      }
      return <a className="markdown-link" href={fixedHref} target="_blank" rel="noopener noreferrer" {...props} />;
    },
    blockquote: ({node, ...props}) => <blockquote className="markdown-blockquote" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    p: ({node, ...props}) => <p className="mb-2" {...props} />,
    hr: ({node, ...props}) => <hr className="my-4" style={{ borderColor: 'var(--color-border)' }} {...props} />,
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownDisplay;
