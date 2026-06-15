import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  minHeight?: string;
}

function highlightSyntax(code: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const patterns: [RegExp, string][] = [
    [/\/\/.*/gm, '<span class="hljs-comment">$&</span>'],
    [/\/\*[\s\S]*?\*\//g, '<span class="hljs-comment">$&</span>'],
    [/"([^"\\]|\\.)*"/g, '<span class="hljs-string">$&</span>'],
    [/'([^'\\]|\\.)*'/g, '<span class="hljs-string">$&</span>'],
    [/`([^`\\]|\\.)*`/g, '<span class="hljs-string">$&</span>'],
    [/\b(function|return|const|let|var|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|import|export|from|async|await|try|catch|throw|class|extends|super|this|true|false|null|undefined|of|in)\b/g, '<span class="hljs-keyword">$1</span>'],
    [/\b(\d+\.?\d*)\b/g, '<span class="hljs-number">$1</span>'],
    [/\b(console|Math|JSON|Promise|fetch|setTimeout|setInterval|parseInt|parseFloat)\b/g, '<span class="hljs-built_in">$1</span>'],
  ];

  let highlighted = escaped;
  for (const [regex, replacement] of patterns) {
    highlighted = highlighted.replace(regex, replacement);
  }

  return highlighted;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = '// write your code here...',
  minHeight = '200px',
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + '  ' + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }, [value, onChange]);

  const handleScroll = useCallback(() => {
    const pre = textareaRef.current?.previousElementSibling;
    if (pre && textareaRef.current) {
      pre.scrollTop = textareaRef.current.scrollTop;
      pre.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl border transition-all duration-200 ${
        isFocused
          ? 'border-red-700/60 ring-2 ring-red-600/30 shadow-lg shadow-red-900/20'
          : 'border-red-950/40 hover:border-red-900/60'
      }`}
      style={{ minHeight }}
    >
      <pre
        className="absolute inset-0 m-0 p-4 font-mono text-sm leading-6 pointer-events-none overflow-hidden whitespace-pre-wrap break-all"
        aria-hidden="true"
        style={{ color: 'transparent' }}
      >
        <code
          className="block font-mono text-sm leading-6"
          dangerouslySetInnerHTML={{
            __html: highlightSyntax(value) || placeholder,
          }}
        />
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-red-400 resize-none outline-none border-none focus:outline-none focus:ring-0 placeholder:text-zinc-700"
        style={{ WebkitTextFillColor: 'transparent' }}
      />
      <style>{`
        .hljs-comment { color: #6a9955; font-style: italic; }
        .hljs-string  { color: #ce9178; }
        .hljs-keyword { color: #569cd6; }
        .hljs-number  { color: #b5cea8; }
        .hljs-built_in { color: #4ec9b0; }
        textarea::selection {
          background: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
