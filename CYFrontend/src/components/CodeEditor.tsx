import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  minHeight?: string;
}

const LANGUAGE_GRAMMAR: Record<string, Prism.Grammar> = {
  javascript: Prism.languages.javascript,
  python: Prism.languages.python,
  bash: Prism.languages.bash,
  json: Prism.languages.json,
};

function highlight(code: string, language: string): string {
  const grammar = LANGUAGE_GRAMMAR[language] || Prism.languages.javascript;
  return Prism.highlight(code, grammar, language);
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = '// write your code here...',
  minHeight = '200px',
}: CodeEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl border transition-all duration-200 ${
        isFocused
          ? 'border-red-700/60 ring-2 ring-red-600/30 shadow-lg shadow-red-900/20'
          : 'border-red-950/40 hover:border-red-900/60'
      }`}
      style={{ minHeight }}
    >
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, language)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        padding={16}
        textareaClassName="focus:outline-none focus:ring-0"
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: 14,
          lineHeight: '24px',
          minHeight: '100%',
          backgroundColor: 'transparent',
          color: '#e2e8f0',
        }}
      />
      <style>{`
        .react-simple-code-editor textarea {
          caret-color: #f87171 !important;
          outline: none !important;
        }
        .react-simple-code-editor textarea::selection {
          background: rgba(239, 68, 68, 0.3) !important;
        }
        .react-simple-code-editor textarea::placeholder {
          color: #3f3f46 !important;
        }
        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata { color: #6a9955; font-style: italic; }
        .token.string,
        .token.char,
        .token.attr-value { color: #ce9178; }
        .token.keyword,
        .token.control,
        .token.selector,
        .token.important { color: #569cd6; }
        .token.number,
        .token.boolean,
        .token.constant { color: #b5cea8; }
        .token.builtin,
        .token.class-name,
        .token.function { color: #4ec9b0; }
        .token.operator,
        .token.punctuation { color: #d4d4d4; }
        .token.property,
        .token.tag { color: #9cdcfe; }
        .token.regex,
        .token.url { color: #d16969; }
        .token.variable { color: #9b9b9b; }
      `}</style>
    </div>
  );
}
