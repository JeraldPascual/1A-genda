/**
 * MarkdownEditor component provides a rich text editor for writing and previewing markdown content with toolbar shortcuts.
 * Supports undo/redo, formatting buttons, and live preview using ReactMarkdown and remark-gfm.
 *
 * Props:
 * - value (string): The current markdown content.
 * - onChange (function): Callback to update the content.
 * - label (string): Optional label for the editor.
 * - rows (number): Number of visible text rows.
 * - placeholder (string): Placeholder text for the editor.
 * - required (boolean): Whether the field is required.
 * - size (string): Size of the input (e.g., 'small').
 * - showToolbar (boolean): Whether to show the formatting toolbar.
 * - defaultMode (string): Initial mode ('edit' or 'preview').
 *
 * Usage:
 * Use this component for content submissions, announcements, or any feature requiring markdown input.
 *
 * Avoid mutating the value prop directly or bypassing the onChange handler to prevent state bugs.
 */
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
  size = 'small',
  showToolbar = true,
  defaultMode = 'edit',
}) => {
  const [mode, setMode] = useState(defaultMode);
  const textareaRef = useRef(null);
  const [history, setHistory] = useState([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Insert markdown formatting at cursor
  const insertMarkdown = (prefix, suffix = '', placeholderText = 'text') => {
    const textarea = textareaRef.current?.querySelector('textarea') || textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholderText;
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newText);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Insert heading
  const insertHeading = (level) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix, '', 'Heading');
  };

  // Undo/redo logic
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

  // Markdown preview custom components
  const markdownComponents = {
    h1: ({node: _node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4" style={{ color: 'var(--color-primary)' }} {...props} />,
    h2: ({node: _node, ...props}) => <h2 className="text-xl font-bold mb-2 mt-3" style={{ color: 'var(--color-primary)' }} {...props} />,
    h3: ({node: _node, ...props}) => <h3 className="text-lg font-bold mb-1 mt-2" style={{ color: 'var(--color-primary)' }} {...props} />,
    code: ({node: _node, inline, ...props}) =>
      inline ? <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded" {...props} /> : <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto"><code {...props} /></pre>,
    a: ({node: _node, ...props}) => <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props} />,
    ul: ({node: _node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
    ol: ({node: _node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
  };

  // Handle text change and update history
  const handleChange = (e) => {
    onChange(e.target.value);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(e.target.value);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <Box>
      {showToolbar && (
        <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {/* Mode Toggle */}
          <ButtonGroup size="small" aria-label="Markdown editor mode toggle">
            <Button
              onClick={() => setMode('edit')}
              variant={mode === 'edit' ? 'contained' : 'outlined'}
              aria-label="Switch to edit mode"
              tabIndex={0}
              startIcon={<Edit className="w-4 h-4" />}
              sx={{ textTransform: 'none' }}
            >
              Edit
            </Button>
            <Button
              onClick={() => setMode('preview')}
              variant={mode === 'preview' ? 'contained' : 'outlined'}
              aria-label="Switch to preview mode"
              tabIndex={0}
              startIcon={<Eye className="w-4 h-4" />}
              sx={{ textTransform: 'none' }}
            >
              Preview
            </Button>
          </ButtonGroup>
          {/* Undo/Redo */}
          <ButtonGroup size="small" aria-label="Markdown undo/redo toolbar">
            <Button onClick={handleUndo} disabled={historyIndex === 0} aria-label="Undo" tabIndex={0}><Undo className="w-4 h-4" /></Button>
            <Button onClick={handleRedo} disabled={historyIndex >= history.length - 1} aria-label="Redo" tabIndex={0}><Redo className="w-4 h-4" /></Button>
          </ButtonGroup>
          {/* Formatting Toolbar */}
          <ButtonGroup size="small" aria-label="Markdown formatting toolbar">
            <Button onClick={() => insertHeading(1)} aria-label="Heading 1" tabIndex={0}><Heading1 className="w-4 h-4" /></Button>
            <Button onClick={() => insertHeading(2)} aria-label="Heading 2" tabIndex={0}><Heading2 className="w-4 h-4" /></Button>
            <Button onClick={() => insertHeading(3)} aria-label="Heading 3" tabIndex={0}><Heading3 className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('**', '**', 'bold text')} aria-label="Bold" tabIndex={0}><Bold className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('*', '*', 'italic text')} aria-label="Italic" tabIndex={0}><Italic className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('`', '`', 'code')} aria-label="Code" tabIndex={0}><Code className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('[', '](url)', 'link text')} aria-label="Link" tabIndex={0}><Link className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('- ', '', 'list item')} aria-label="Unordered List" tabIndex={0}><List className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('1. ', '', 'list item')} aria-label="Ordered List" tabIndex={0}><ListOrdered className="w-4 h-4" /></Button>
            <Button onClick={() => insertMarkdown('> ', '', 'quote')} aria-label="Blockquote" tabIndex={0}><Quote className="w-4 h-4" /></Button>
          </ButtonGroup>
        </Box>
      )}
      {mode === 'edit' && (
        <TextField
          inputRef={textareaRef}
          label={label}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          multiline
          minRows={rows}
          maxRows={20}
          size={size}
          fullWidth
          variant="outlined"
          inputProps={{
            spellCheck: 'true',
            'aria-label': label || 'Markdown editor',
            'aria-multiline': 'true',
          }}
        />
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
            overflowY: 'auto',
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
