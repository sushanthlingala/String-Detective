import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface RecapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecapTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  codeSnippet?: string;
  bulletPoints: string[];
}

const RECAP_TOPICS: RecapTopic[] = [
  {
    id: 'memory_model',
    title: 'JVM Memory Architecture & String Pool',
    category: 'Memory & Architecture',
    summary:
      'Understanding how the JVM separates the Stack, the Heap, and the String Constant Pool is the cornerstone of mastering Java Strings.',
    bulletPoints: [
      'Stack frames hold local reference variables (pointers).',
      'The String Constant Pool is a special hash table inside the JVM Heap that stores unique string literal instances.',
      'String literals (e.g., "demo") automatically resolve to the pool.',
      'Explicit instantiation via `new String("demo")` allocates a new instance on the general Heap, outside pool deduplication.',
      'Calling `.intern()` queries the pool: if present, it returns the pooled reference; if absent, it registers the string into the pool and returns it.',
    ],
    codeSnippet: `String s1 = "alpha";               // Stored in Constant Pool
String s2 = "alpha";               // Reuses pooled reference
String s3 = new String("alpha");   // Separate Heap object!

System.out.println(s1 == s2);      // true (same pool pointer)
System.out.println(s1 == s3);      // false (pool vs heap object)
System.out.println(s1 == s3.intern()); // true (intern() returns pool ref)`,
  },
  {
    id: 'immutability_contract',
    title: 'The Immutability Contract & Design Rationale',
    category: 'Design Principles',
    summary:
      'Java String is declared final and backed by an unmodifiable array. This architectural decision enables four critical JVM guarantees.',
    bulletPoints: [
      'Security: Prevents tampering when strings represent file paths, network URLs, or database connection strings.',
      'Thread-Safety: Strings can be freely shared across multiple threads without synchronization locks.',
      'Hash Code Caching: The hash code is computed lazily once and cached in a private field `hash`. This makes HashMap keys blazing fast.',
      'Pool Sharing: Sharing would be catastrophic if modifying one string altered another variable sharing the literal.',
    ],
    codeSnippet: `// The internal JDK String structure:
public final class String {
    private final byte[] value; // Immutable byte buffer
    private final byte coder;   // LATIN1 (0) or UTF16 (1)
    private int hash;           // Cached hash code
}`,
  },
  {
    id: 'compiler_desugaring',
    title: 'Compile-Time Constant Folding vs Runtime Concatenation',
    category: 'Compiler Mechanics',
    summary:
      'The javac compiler optimizes constant expressions at compile-time, but dynamically generated strings behave differently.',
    bulletPoints: [
      'Compile-time constants: Expressions composed solely of literals or final variables are calculated by javac and stored as single literals.',
      'Runtime expressions: Concatenations involving variables cannot be evaluated until execution.',
      'In Java 8, runtime concatenation was desugared into `new StringBuilder().append(...)`.',
      'In Java 9+, the JVM uses invokedynamic with `StringConcatFactory` for dynamic optimization.',
    ],
    codeSnippet: `final String PREFIX = "JAVA";
String a = PREFIX + "_17";       // Evaluated at compile-time! -> "JAVA_17" (pooled)

String runtimePrefix = "JAVA";
String b = runtimePrefix + "_17"; // Computed at runtime -> new Heap object!

System.out.println(a == "JAVA_17"); // true (compile constant folded)
System.out.println(b == "JAVA_17"); // false (runtime heap allocation)`,
  },
  {
    id: 'stringbuilder_internals',
    title: 'StringBuilder Mechanics & Buffer Expansion',
    category: 'Performance',
    summary:
      'StringBuilder manages an expandable character array to provide amortized O(1) mutations.',
    bulletPoints: [
      'Default constructor `new StringBuilder()` allocates an internal buffer with initial capacity of 16 characters.',
      'Capacity expansion algorithm: `newCapacity = (oldCapacity * 2) + 2`.',
      'Repeated string concatenation (`s += "x"`) inside a loop creates O(N) discarded objects and takes O(N²) time.',
      'StringBuilder mutates in place and returns `this`, allowing fluent method chaining without object allocations.',
    ],
    codeSnippet: `StringBuilder sb = new StringBuilder(32); // Pre-size capacity
for (int i = 0; i < 1000; i++) {
    sb.append(i).append(","); // O(1) amortized in-place appending
}
String result = sb.toString();`,
  },
  {
    id: 'equality_and_hashcode',
    title: 'Reference Equality vs Value Equality Contract',
    category: 'Object Semantics',
    summary:
      'Never use == for content comparison. The .equals() method follows an optimized three-phase inspection.',
    bulletPoints: [
      'Phase 1: Quick pointer check `if (this == other) return true;`.',
      'Phase 2: Type verification `if (other instanceof String)`.',
      'Phase 3: Fast length check followed by vectorized byte-by-byte memory comparison.',
      'General Contract: If `a.equals(b)` is true, then `a.hashCode() == b.hashCode()` must always be true.',
    ],
    codeSnippet: `String a = "sample";
String b = new String("sample");

// WRONG: Compares pointer memory address
if (a == b) { /* false */ }

// CORRECT: Compares actual character values
if (a.equals(b)) { /* true */ }

// Defensive null-safe comparison:
boolean same = java.util.Objects.equals(a, b);`,
  },
  {
    id: 'compact_strings',
    title: 'Compact Strings & Memory Footprint (Java 9+)',
    category: 'JVM Internals',
    summary:
      'Historical Java strings used `char[]` (2 bytes per character). Compact Strings drastically cut memory usage.',
    bulletPoints: [
      'Modern JDK uses `byte[]` with an encoding flag `coder`.',
      'LATIN-1 (coder = 0): Uses 1 byte per character if all characters fit within ISO-8859-1 (ASCII / Western).',
      'UTF-16 (coder = 1): Uses 2 bytes per character if any character requires multibyte unicode.',
      '`s.length()` returns UTF-16 code units (16-bit units), which may differ from Unicode code points for emoji or surrogate pairs.',
    ],
    codeSnippet: `String ascii = "hello"; // Stored in 5 bytes (LATIN-1)
String unicode = "héllo"; // Stored in 5 bytes (LATIN-1 accented)
String emoji = "👋";     // Stored in UTF-16 (surrogate pair, length() == 2)`,
  },
  {
    id: 'critical_gotchas',
    title: 'Crucial Method Edge Cases Quick Reference',
    category: 'Edge Cases',
    summary:
      'Quick cheat-sheet of common subtle method behaviors defined in the Java Language Specification.',
    bulletPoints: [
      '`s.substring(k, k)`: Returns `""` (empty string) safely without throwing, provided `0 <= k <= s.length()`.',
      '`s.indexOf("")`: Always returns `0`, because the empty string matches at the start of any string.',
      '`s.split(regex)`: Automatically discards trailing empty strings. Use `s.split(regex, -1)` to retain them.',
      '`s.replace(".", "-")`: Replaces literal dots. In contrast, `s.replaceAll(".", "-")` matches EVERY character in regex!',
      '`String.valueOf(Object)`: Returns `"null"` safely. But `String.valueOf((char[]) null)` throws NullPointerException!',
    ],
    codeSnippet: `"JAVA".substring(4, 4);        // "" (empty string, no error!)
"JAVA".indexOf("");            // 0
"A,B,,".split(",").length;     // 2 (trailing empties discarded)
"A,B,,".split(",", -1).length; // 4 (preserves all tokens)`,
  },
];

export const RecapModal: React.FC<RecapModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('memory_model');

  if (!isOpen) return null;

  const filteredTopics = RECAP_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bulletPoints.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeTopic =
    RECAP_TOPICS.find((t) => t.id === selectedTopicId) || RECAP_TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="theme-modal border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="theme-modal-header px-5 py-3.5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-mono theme-text-primary">
              JAVA STRINGS MECHANICS RECAP
            </h2>
            <p className="text-xs theme-text-secondary mt-0.5">
              Core architectural principles, JVM internals, and fundamental contracts
            </p>
          </div>
          <button
            onClick={onClose}
            className="theme-nav-btn p-1.5 rounded-lg border transition cursor-pointer"
            aria-label="Close recap modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar Topics */}
          <div className="w-full md:w-80 theme-modal-sidebar border-r flex flex-col p-3 gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fundamentals..."
                className="w-full pl-8 pr-3 py-1.5 theme-input text-xs font-mono rounded-lg border focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scroll">
              {filteredTopics.map((topic) => {
                const isSelected = topic.id === selectedTopicId;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      isSelected
                        ? 'theme-topic-selected'
                        : 'theme-topic-inactive'
                    }`}
                  >
                    <div className="font-semibold truncate theme-text-primary">
                      {topic.title}
                    </div>
                    <div className="text-[10px] theme-text-secondary truncate mt-0.5">
                      {topic.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Topic Detail */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll theme-text-primary">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded theme-subpanel border theme-text-secondary inline-block mb-1">
                {activeTopic.category}
              </span>
              <h3 className="text-lg font-bold font-mono theme-text-primary">
                {activeTopic.title}
              </h3>
              <p className="text-xs theme-text-secondary mt-1 leading-relaxed">
                {activeTopic.summary}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="theme-subpanel border rounded-lg p-4 space-y-2 text-xs">
              <span className="font-mono font-bold text-xs uppercase tracking-wider theme-text-primary block mb-2">
                Key Fundamentals & Rules:
              </span>
              <ul className="space-y-2 font-mono">
                {activeTopic.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Code Sample */}
            {activeTopic.codeSnippet && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-semibold theme-text-secondary block">
                  Reference Java Example:
                </span>
                <div className="theme-code-patch border rounded-lg p-3 font-mono text-xs overflow-x-auto whitespace-pre">
                  <code>{activeTopic.codeSnippet}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
