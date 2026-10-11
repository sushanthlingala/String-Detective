import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  isFindBugCase?: boolean;
  selectedLineNumber?: number;
  onSelectLineNumber?: (lineNum: number) => void;
  faultyLineNumber?: number;
  highlightedLine?: number;
}

// Java syntax highlighter helper with theme support
function highlightJavaLine(lineText: string) {
  // Strip existing line number prefix if template has "1: "
  const cleanLine = lineText.replace(/^\d+:\s*/, '');

  // Comments
  if (cleanLine.trim().startsWith('//')) {
    return <span className="theme-code-comment italic">{cleanLine}</span>;
  }

  // Tokenize line with regex for strings, keywords, numbers, methods
  const parts = cleanLine.split(/("[^"]*"|'[^']*'|\/\/.*$)/g);

  return parts.map((part, idx) => {
    if (!part) return null;

    // String literal
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <span key={idx} className="theme-code-string font-semibold">
          {part}
        </span>
      );
    }
    // Char literal
    if (part.startsWith("'") && part.endsWith("'")) {
      return (
        <span key={idx} className="theme-code-char font-semibold">
          {part}
        </span>
      );
    }
    // Inline comment
    if (part.startsWith('//')) {
      return (
        <span key={idx} className="theme-code-comment italic">
          {part}
        </span>
      );
    }

    // Keyword & identifier styling
    const subParts = part.split(/(\b[a-zA-Z_][a-zA-Z0-9_]*\b)/g);
    return subParts.map((word, subIdx) => {
      const keywords = [
        'public',
        'class',
        'static',
        'void',
        'main',
        'new',
        'return',
        'if',
        'else',
        'for',
        'while',
        'int',
        'char',
        'boolean',
        'null',
        'true',
        'false',
      ];
      const types = ['String', 'StringBuilder', 'StringBuffer', 'Object', 'System'];
      const methods = [
        'println',
        'print',
        'toUpperCase',
        'toLowerCase',
        'concat',
        'substring',
        'charAt',
        'length',
        'equals',
        'indexOf',
        'lastIndexOf',
        'replace',
        'replaceAll',
        'split',
        'trim',
        'append',
        'insert',
        'delete',
        'reverse',
        'intern',
        'compareTo',
        'isEmpty',
        'isBlank',
        'valueOf',
      ];

      if (keywords.includes(word)) {
        return (
          <span key={subIdx} className="theme-code-keyword font-semibold">
            {word}
          </span>
        );
      }
      if (types.includes(word)) {
        return (
          <span key={subIdx} className="theme-code-type font-medium">
            {word}
          </span>
        );
      }
      if (methods.includes(word)) {
        return (
          <span key={subIdx} className="theme-code-method">
            {word}
          </span>
        );
      }
      return <span key={subIdx} className="theme-code-plain">{word}</span>;
    });
  });
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  isFindBugCase = false,
  selectedLineNumber,
  onSelectLineNumber,
  highlightedLine,
}) => {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = () => {
    // Strip line number prefixes if any
    const raw = lines.map((l) => l.replace(/^\d+:\s*/, '')).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      key={code}
      className="theme-code-container border rounded-xl overflow-hidden shadow-sm flex flex-col font-mono text-sm animate-fade-slide"
    >
      {/* File Header Tab */}
      <div className="theme-code-header border-b px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <span className="theme-text-primary font-semibold">TestCase.java</span>
        </div>

        <div className="flex items-center gap-2">
          {isFindBugCase && (
            <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Click faulty line to flag
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded theme-btn-copy text-xs transition cursor-pointer"
            title="Copy Java Snippet"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-3.5 overflow-x-auto select-text leading-relaxed theme-code-body">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isSelected = selectedLineNumber === lineNum;
              const isHighlighted = highlightedLine === lineNum;

              return (
                <tr
                  key={idx}
                  onClick={() => {
                    if (isFindBugCase && onSelectLineNumber) {
                      onSelectLineNumber(lineNum);
                    }
                  }}
                  className={`group transition ${
                    isFindBugCase ? 'cursor-pointer theme-line-clickable' : ''
                  } ${isSelected ? 'theme-line-selected' : ''} ${
                    isHighlighted ? 'theme-line-highlighted' : ''
                  }`}
                >
                  {/* Line Number */}
                  <td className="w-10 pr-3 text-right select-none theme-code-lineno text-xs font-mono group-hover:opacity-100 align-top">
                    {lineNum}
                  </td>

                  {/* Code Content */}
                  <td className="font-mono text-[13px] whitespace-pre pl-2">
                    {highlightJavaLine(lineText)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
