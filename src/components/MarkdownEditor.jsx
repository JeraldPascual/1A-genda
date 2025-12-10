import { useState, useRef } from 'react';
import { TextField, Button, ButtonGroup, Box, Tooltip } from '@mui/material';
import { Eye, Edit, Bold, Italic, Link, Code, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2, Heading3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownEditor = ({
  value = '',
  onChange,
  label,
  rows = 4,
  placeholder = 'Write your content here...',
  required = false,
  size = "small",
  showToolbar = true,
  defaultMode = 'edit'
}) => {
  const [mode, setMode] = useState(defaultMode);
  const textareaRef = useRef(null);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);  const insertMarkdown = (prefix, suffix = '', placeholder = 'text') => {
    const textarea = textareaRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const insertHeading = (level) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix, '', 'Heading');
  };  const markdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4" style={{ color: 'var(--color-primary)' }} {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2 mt-3" style={{ color: 'var(--color-primary)' }} {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-2" style={{ color: 'var(--color-primary)' }} {...props} />,
    code: ({node, inline, ...props}) =>
      inline ?
        <code className="markdown-inline-code" {...props} /> :
        <code className="markdown-code-block" {...props} />,
    a: ({node, ...props}) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}) => <blockquote className="markdown-blockquote" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* Mode Toggle */}
      <ButtonGroup size="small" sx={{ mb: 1 }}>
        <Button
          onClick={() => setMode('edit')}
          variant={mode === 'edit' ? 'contained' : 'outlined'}
          startIcon={<Edit className="w-4 h-4" />}
          sx={{ textTransform: 'none' }}
        >
          Edit
        </Button>
        <Button
          onClick={() => setMode('preview')}
          variant={mode === 'preview' ? 'contained' : 'outlined'}
          startIcon={<Eye className="w-4 h-4" />}
          sx={{ textTransform: 'none' }}
        >
          Preview
        </Button>
      </ButtonGroup>

      {mode === 'edit' && (
        <>
          {showToolbar && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <ButtonGroup size="small">
                <Tooltip title="Undo (Ctrl+Z)">
                  <span>
                    <Button onClick={handleUndo} disabled={historyIndex <= 0}>
                      <Undo className="w-4 h-4" />
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Redo (Ctrl+Y)">
                  <span>
                    <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                      <Redo className="w-4 h-4" />
                    </Button>
                  </span>
                </Tooltip>
              </ButtonGroup>

              <ButtonGroup size="small">
                <Tooltip title="Heading 1">
                  <Button onClick={() => insertHeading(1)}>
                    <Heading1 className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Heading 2">
                  <Button onClick={() => insertHeading(2)}>
                    <Heading2 className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Heading 3">
                  <Button onClick={() => insertHeading(3)}>
                    <Heading3 className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </ButtonGroup>

              <ButtonGroup size="small">
                <Tooltip title="Bold (Ctrl+B)">
                  <Button onClick={() => insertMarkdown('**', '**', 'bold text')}>
                    <Bold className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Italic (Ctrl+I)">
                  <Button onClick={() => insertMarkdown('*', '*', 'italic text')}>
                    <Italic className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Code">
                  <Button onClick={() => insertMarkdown('`', '`', 'code')}>
                    <Code className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Link">
                  <Button onClick={() => insertMarkdown('[', '](url)', 'link text')}>
                    <Link className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Bullet List">
                  <Button onClick={() => insertMarkdown('- ', '', 'list item')}>
                    <List className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Numbered List">
                  <Button onClick={() => insertMarkdown('1. ', '', 'list item')}>
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip title="Quote">
                  <Button onClick={() => insertMarkdown('> ', '', 'quote')}>
                    <Quote className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>
          )}

          <TextField
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            label={label}
            multiline
            rows={rows}
            fullWidth
            size={size}
            placeholder={placeholder}
            required={required}
            sx={{
              '& .MuiInputBase-root': {
                color: 'var(--color-text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              },
              '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-border)' },
              '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary)'
              },
              '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--color-primary)'
              }
            }}
          />
        </>
      )}

      {mode === 'preview' && (
        <Box
          className="markdown-preview"
          sx={{
            minHeight: `${rows * 24}px`,
            p: 2,
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            overflowY: 'auto'
          }}
        >
          {value ? (
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Nothing to preview yet. Switch to Edit mode to write content.
            </span>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MarkdownEditor;
