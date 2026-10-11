import { Case, CaseType, ConceptId, ChoiceOption, FixOption } from '../types/game';

// Utility helper functions for generator
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const VAR_NAMES = ['clue', 'evidence', 'dossier', 'secret', 'target', 'cipher', 'memo', 'report', 'code', 'token'];
const SUSPECT_WORDS = [
  'DETECTIVE',
  'SUSPECT',
  'EVIDENCE',
  'WITNESS',
  'ALIBI',
  'CIPHER',
  'SHADOW',
  'MYSTERY',
  'VAULT',
  'BADGE',
];

export interface CaseTemplate {
  concept: ConceptId;
  minDiff: number;
  maxDiff: number;
  caseType: CaseType;
  generate: (diff: number, caseNum: number) => Case;
}

export const TEMPLATES: CaseTemplate[] = [
  // 1. IMMUTABILITY: Ignored toUpperCase / toLowerCase
  {
    concept: 'immutability',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const varName = pickRandom(VAR_NAMES);
      const word = pickRandom(['mystery', 'alibi', 'cipher', 'shadow', 'clue']);
      const isReassigned = diff >= 2 && Math.random() > 0.5;

      const code = isReassigned
        ? `public class DetectiveCase {
    public static void main(String[] args) {
        String ${varName} = "${word}";
        ${varName} = ${varName}.toUpperCase();
        System.out.println(${varName});
    }
}`
        : `public class DetectiveCase {
    public static void main(String[] args) {
        String ${varName} = "${word}";
        ${varName}.toUpperCase(); // Mutator called
        System.out.println(${varName});
    }
}`;

      const expected = isReassigned ? word.toUpperCase() : word;

      return {
        id: `case-immut-1-${caseNum}-${Date.now()}`,
        caseNumber: caseNum,
        fingerprint: `immut-case-${varName}-${word}-${isReassigned}`,
        title: isReassigned ? 'The Captured Transformation' : 'The Muted UpperCase Mutation',
        difficulty: diff,
        primaryConcept: 'immutability',
        caseType: 'output_prediction',
        mysteryStory: `Analyze this snippet calling toUpperCase() on a String. What is printed to the console?`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'Remember Java Strings are immutable objects.',
          isReassigned
            ? 'Look at line 4: the variable is being reassigned with the return value.'
            : 'Look at line 4: does the variable receive the return value of toUpperCase()?',
          isReassigned
            ? `Since the result is assigned back, ${varName} holds the uppercase string.`
            : `Because the return value is discarded, ${varName} still holds the original value "${word}".`,
        ],
        autopsy: {
          verdictSummary: isReassigned
            ? `The transformation was captured via reassignment, yielding "${expected}".`
            : `Strings are immutable. Calling .toUpperCase() without reassigning leaves the original variable holding "${expected}".`,
          lineByLineNotes: [
            { line: 3, note: `Initializes ${varName} to "${word}".` },
            {
              line: 4,
              note: isReassigned
                ? `Reassigns ${varName} to newly created String "${word.toUpperCase()}".`
                : `Calls toUpperCase(), creating a new String, but the return value is ignored!`,
            },
            { line: 5, note: `Prints current value of ${varName}.` },
          ],
          deepDive:
            'In Java, String objects can never be mutated in-place. Methods like toUpperCase() construct a new String on the heap. If not assigned back to the variable, the mutation is lost.',
          correctedCodeSnippet: !isReassigned
            ? `String ${varName} = "${word}";\n${varName} = ${varName}.toUpperCase(); // Capture the return!\nSystem.out.println(${varName});`
            : undefined,
        },
      };
    },
  },

  // 1b. IMMUTABILITY: concat() ignored return
  {
    concept: 'immutability',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const varName = pickRandom(VAR_NAMES);
      const prefix = pickRandom(['Sherlock', 'Agent', 'Inspector', 'Officer']);
      const suffix = pickRandom(['Holmes', 'Bond', 'Lestrade', 'Pierce']);
      const reassign = diff >= 3 && Math.random() > 0.5;

      const code = reassign
        ? `public class DetectiveCase {
    public static void main(String[] args) {
        String ${varName} = "${prefix}";
        ${varName} = ${varName}.concat(" ${suffix}");
        System.out.println(${varName});
    }
}`
        : `public class DetectiveCase {
    public static void main(String[] args) {
        String ${varName} = "${prefix}";
        ${varName}.concat(" ${suffix}");
        System.out.println(${varName});
    }
}`;

      const expected = reassign ? `${prefix} ${suffix}` : prefix;

      return {
        id: `case-immut-concat-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `immut-concat-${varName}-${reassign}`,
        title: 'The Ignored Concat Operation',
        difficulty: diff,
        primaryConcept: 'immutability',
        secondaryConcepts: ['concatenation'],
        caseType: 'output_prediction',
        mysteryStory: `Examine the call to concat() and observe variable assignment. Predict the console output.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'What does the concat() method return in Java?',
          'Check whether line 4 stores the result back into the variable.',
          reassign
            ? `The return value was assigned to ${varName}, so it contains the concatenated string.`
            : `The return value of concat() was discarded. ${varName} remains "${prefix}".`,
        ],
        autopsy: {
          verdictSummary: reassign
            ? `Assignment captured the concatenated String: "${expected}".`
            : `concat() returns a new String. Because it wasn't captured, ${varName} stayed "${expected}".`,
          lineByLineNotes: [
            { line: 3, note: `Variable initialized to "${prefix}".` },
            {
              line: 4,
              note: reassign
                ? `concat(" ${suffix}") returned new String and reassigned to ${varName}.`
                : `concat(" ${suffix}") created a new String, but it was dropped!`,
            },
            { line: 5, note: `Prints ${varName}.` },
          ],
          deepDive:
            'String.concat() creates a new String containing the merged characters. The original String instance is untouched.',
        },
      };
    },
  },

  // 1c. IMMUTABILITY: Find the bug in method chain
  {
    concept: 'immutability',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'find_the_bug',
    generate: (diff, caseNum) => {
      const code = `1: public class EvidenceCleaner {
2:     public static void main(String[] args) {
3:         String note = "  CONFIDENTIAL_CASE  ";
4:         note.trim();
5:         note = note.replace('_', ' ');
6:         System.out.println(note.length());
7:     }
8: }`;
      return {
        id: `case-immut-bug-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `immut-bug-trim`,
        title: 'The Ghost Trim Bug',
        difficulty: diff,
        primaryConcept: 'immutability',
        secondaryConcepts: ['methods'],
        caseType: 'find_the_bug',
        mysteryStory: `The code attempts to trim spaces before replacing characters. Identify which line fails to update the string.`,
        codeSnippet: code,
        faultyLineNumber: 4,
        expectedOutput: '4',
        acceptedAnswers: ['4', 'Line 4', 'line 4'],
        hints: [
          'Look for lines where a String method is called without an assignment.',
          'Notice note.trim() on line 4 vs note = note.replace(...) on line 5.',
          'Line 4 calls note.trim() but ignores the return value, so the leading and trailing spaces remain!',
        ],
        autopsy: {
          verdictSummary:
            'Line 4 calls note.trim() without assigning the result back to `note`. The spaces are never removed!',
          lineByLineNotes: [
            { line: 3, note: 'Initializes string with 2 leading and 2 trailing spaces.' },
            { line: 4, note: 'BUG: note.trim() executes but does not reassign `note = note.trim();`.' },
            { line: 5, note: 'Replaces underscores, but the untrimmed spaces are still present.' },
            { line: 6, note: 'Output length is larger than intended due to discarded trim.' },
          ],
          deepDive:
            'Because Strings are immutable, calling note.trim() does nothing unless the returned trimmed String reference is captured.',
          correctedCodeSnippet: `String note = "  CONFIDENTIAL_CASE  ";\nnote = note.trim(); // Fixed line 4!\nnote = note.replace('_', ' ');\nSystem.out.println(note.length());`,
        },
      };
    },
  },

  // 2. EQUALITY: == vs .equals() with new String()
  {
    concept: 'equality',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const word = pickRandom(['vault', 'alibi', 'cipher', 'agent']);
      const comparisonType = pickRandom(['==', 'equals']);

      let code = '';
      let expected = '';
      if (comparisonType === '==') {
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        String s1 = "${word}";
        String s2 = new String("${word}");
        System.out.println(s1 == s2);
    }
}`;
        expected = 'false';
      } else {
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        String s1 = "${word}";
        String s2 = new String("${word}");
        System.out.println(s1.equals(s2));
    }
}`;
        expected = 'true';
      }

      return {
        id: `case-eq-1-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `equality-${word}-${comparisonType}`,
        title: comparisonType === '==' ? 'The Double Equals Trap' : 'The True Identity Match',
        difficulty: diff,
        primaryConcept: 'equality',
        secondaryConcepts: ['string_pool'],
        caseType: 'output_prediction',
        mysteryStory: `Two String variables are compared. Determine whether the comparison evaluates to true or false.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          comparisonType === '=='
            ? '== compares memory addresses (reference identity), not string contents.'
            : '.equals() compares the character sequence of both strings.',
          's1 is a string literal in the constant pool, while s2 is explicitly created on the heap with new.',
          comparisonType === '=='
            ? 'Because they are two distinct objects in memory, == produces false.'
            : 'Because their character sequences are identical, .equals() produces true.',
        ],
        autopsy: {
          verdictSummary:
            comparisonType === '=='
              ? '== checks reference identity. `new String()` forces a separate heap object, so s1 == s2 is false.'
              : '.equals() checks character content. Both contain the same letters, so s1.equals(s2) is true.',
          lineByLineNotes: [
            { line: 3, note: `s1 points to "${word}" in the String Constant Pool.` },
            { line: 4, note: `s2 is allocated as a brand new object on the heap via 'new'.` },
            {
              line: 5,
              note:
                comparisonType === '=='
                  ? 's1 and s2 have different memory addresses -> false.'
                  : 's1 and s2 have identical character sequences -> true.',
            },
          ],
          deepDive:
            'In Java, == evaluates whether references point to the exact same address. Always use .equals() to compare String values.',
        },
      };
    },
  },

  // 3. STRING POOL: Constant folding vs runtime concatenation
  {
    concept: 'string_pool',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const mode = pickRandom(['folded', 'runtime_var', 'intern']);
      let code = '';
      let expected = '';
      let title = '';

      if (mode === 'folded') {
        title = 'The Compiler Constant Fold';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        String s1 = "JA" + "VA";
        String s2 = "JAVA";
        System.out.println(s1 == s2);
    }
}`;
        expected = 'true';
      } else if (mode === 'runtime_var') {
        title = 'The Runtime Heap Dissimilarity';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        String prefix = "JA";
        String s1 = prefix + "VA";
        String s2 = "JAVA";
        System.out.println(s1 == s2);
    }
}`;
        expected = 'false';
      } else {
        title = 'The intern() Reclamation';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        String s1 = new String("CLUE");
        String s2 = s1.intern();
        String s3 = "CLUE";
        System.out.println(s2 == s3);
    }
}`;
        expected = 'true';
      }

      return {
        id: `case-pool-${mode}-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `pool-${mode}`,
        title,
        difficulty: diff,
        primaryConcept: 'string_pool',
        secondaryConcepts: ['equality'],
        caseType: 'output_prediction',
        mysteryStory: `Inspect String instantiation and string pool interaction. Determine the boolean result.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          mode === 'folded'
            ? 'Does javac fold string literal constants at compile time?'
            : mode === 'runtime_var'
            ? 'Does concatenation with a non-final variable happen at compile-time or runtime?'
            : 'What does the intern() method return from the String pool?',
          mode === 'folded'
            ? '"JA" + "VA" is a compile-time constant expression. The compiler stores "JAVA" directly.'
            : mode === 'runtime_var'
            ? 'prefix + "VA" produces a new heap object at runtime using StringBuilder or invokedynamic.'
            : 's1.intern() searches the constant pool and returns the canonical pooled reference.',
          `Therefore, the comparison evaluates to ${expected}.`,
        ],
        autopsy: {
          verdictSummary:
            mode === 'folded'
              ? 'Compile-time constant expressions ("JA" + "VA") are evaluated by the compiler and share the pooled literal "JAVA". Result: true.'
              : mode === 'runtime_var'
              ? 'Concatenation involving variable `prefix` executes at runtime on the heap, producing an unpooled instance. Result: false.'
              : 's1.intern() returns the canonical pool reference, matching the literal s3. Result: true.',
          lineByLineNotes: [
            {
              line: 3,
              note:
                mode === 'folded'
                  ? 'Literal addition folded by javac into "JAVA".'
                  : mode === 'runtime_var'
                  ? 'Defines local variable prefix.'
                  : 'Creates new String object on heap.',
            },
            {
              line: 4,
              note:
                mode === 'folded'
                  ? 'Literal "JAVA" resolved to the same pool entry.'
                  : mode === 'runtime_var'
                  ? 'Runtime concat creates new heap object.'
                  : 'intern() returns the pool entry for "CLUE".',
            },
            { line: 5, note: `Prints equality comparison.` },
          ],
          deepDive:
            'JLS §3.10.5 guarantees that string literals and constant expressions that evaluate to strings are interned automatically.',
        },
      };
    },
  },

  // 4. INDEXING: charAt and substring bounds
  {
    concept: 'indexing',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const word = pickRandom(['DETECTIVE', 'SHERLOCK', 'SUSPECT', 'FORENSIC']);
      const isOutOfBounds = diff >= 4 && Math.random() > 0.6;

      if (isOutOfBounds) {
        const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String badge = "${word}";
        char c = badge.charAt(badge.length());
        System.out.println(c);
    }
}`;
        return {
          id: `case-idx-oob-${caseNum}`,
          caseNumber: caseNum,
          fingerprint: `idx-oob-${word}`,
          title: 'The Off-By-One Boundary Breach',
          difficulty: diff,
          primaryConcept: 'indexing',
          caseType: 'exception_prediction',
          mysteryStory: `The code accesses charAt(badge.length()). Determine the runtime behavior.`,
          codeSnippet: code,
          expectedOutput: 'StringIndexOutOfBoundsException',
          acceptedAnswers: [
            'StringIndexOutOfBoundsException',
            'IndexOutOfBoundsException',
            'java.lang.StringIndexOutOfBoundsException',
            'exception',
          ],
          choices: [
            { id: 'c1', text: 'StringIndexOutOfBoundsException', isCorrect: true },
            { id: 'c2', text: 'NullPointerException', isCorrect: false },
            { id: 'c3', text: 'Prints the last character safely', isCorrect: false },
            { id: 'c4', text: 'Prints empty character \'\\0\'', isCorrect: false },
          ],
          hints: [
            'String indexing in Java is 0-indexed.',
            `The length of "${word}" is ${word.length}. What are the valid index bounds?`,
            `The maximum valid index is length - 1 (${word.length - 1}). Accessing index ${word.length} throws an exception!`,
          ],
          autopsy: {
            verdictSummary:
              'charAt(length) throws StringIndexOutOfBoundsException because indices run from 0 to length - 1.',
            lineByLineNotes: [
              { line: 3, note: `badge has length ${word.length}. Valid indices: 0..${word.length - 1}.` },
              { line: 4, note: `charAt(${word.length}) triggers StringIndexOutOfBoundsException!` },
            ],
            deepDive:
              'In Java, strings are 0-indexed. An attempt to access an index equal to or greater than length() throws StringIndexOutOfBoundsException.',
            correctedCodeSnippet: `char c = badge.charAt(badge.length() - 1); // Last character!`,
          },
        };
      }

      // Safe substring test
      const start = 0;
      const end = randomInt(2, Math.min(4, word.length));
      const expected = word.substring(start, end);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String badge = "${word}";
        String slice = badge.substring(${start}, ${end});
        System.out.println(slice);
    }
}`;

      return {
        id: `case-idx-sub-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `idx-sub-${word}-${start}-${end}`,
        title: 'The Substring Extraction Probe',
        difficulty: diff,
        primaryConcept: 'indexing',
        caseType: 'output_prediction',
        mysteryStory: `Examine the substring indices and predict the extracted string.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'substring(begin, end) is inclusive of begin but exclusive of end.',
          `Characters at indices from ${start} up to ${end - 1} are included.`,
          `Number of characters extracted is exactly end - start (${end - start}).`,
        ],
        autopsy: {
          verdictSummary: `substring(${start}, ${end}) extracts indices ${start} through ${end - 1}, giving "${expected}".`,
          lineByLineNotes: [
            { line: 3, note: `badge initialized to "${word}".` },
            { line: 4, note: `Extracts characters from index ${start} up to index ${end - 1}.` },
            { line: 5, note: `Prints "${expected}".` },
          ],
          deepDive:
            'The end index in substring(begin, end) is exclusive. The length of the resulting string is always (end - begin).',
        },
      };
    },
  },

  // 4b. INDEXING: substring(k, k) returns empty string!
  {
    concept: 'indexing',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const idx = randomInt(1, 4);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String str = "CIPHER";
        String emptySlice = str.substring(${idx}, ${idx});
        System.out.println("[" + emptySlice + "]");
    }
}`;

      return {
        id: `case-empty-slice-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `empty-slice-${idx}`,
        title: 'The Zero-Length Slice Ambush',
        difficulty: diff,
        primaryConcept: 'indexing',
        secondaryConcepts: ['edge_cases'],
        caseType: 'output_prediction',
        mysteryStory: `The substring method is called with identical begin and end indices. What is printed?`,
        codeSnippet: code,
        expectedOutput: '[]',
        acceptedAnswers: ['[]', '"[]"'],
        hints: [
          `Does str.substring(${idx}, ${idx}) throw an exception if ${idx} <= length?`,
          'When beginIndex equals endIndex, Java substring returns an empty string "".',
          'Concatenating "[" + "" + "]" results in "[]".',
        ],
        autopsy: {
          verdictSummary:
            'When beginIndex == endIndex in substring, it safely returns an empty String (""), so "[" + "" + "]" outputs "[]".',
          lineByLineNotes: [
            { line: 3, note: 'str has length 6.' },
            { line: 4, note: `substring(${idx}, ${idx}) where begin == end returns "" (empty string).` },
            { line: 5, note: 'Prints "[" + "" + "]" -> "[]".' },
          ],
          deepDive:
            'According to JLS, substring(k, k) returns an empty string with no exception thrown as long as 0 <= k <= str.length().',
        },
      };
    },
  },

  // 5. METHODS: replace vs replaceAll (regex trap)
  {
    concept: 'methods',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const isRegexAll = Math.random() > 0.5;
      const method = isRegexAll ? 'replaceAll' : 'replace';
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String data = "A.B.C";
        String result = data.${method}(".", "#");
        System.out.println(result);
    }
}`;

      const expected = isRegexAll ? '#####' : 'A#B#C';

      return {
        id: `case-method-replace-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `replace-method-${method}`,
        title: isRegexAll ? 'The Wildcard Regex Ambush' : 'The Literal Character Swap',
        difficulty: diff,
        primaryConcept: 'methods',
        caseType: 'output_prediction',
        mysteryStory: `Inspect how the replacement method processes the string. Predict the resulting output.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          `Look closely at the method: ${method}(".", "#").`,
          isRegexAll
            ? 'replaceAll() interprets the first argument as a regular expression. In regex, what does "." represent?'
            : 'replace() treats the target as a literal CharSequence, not a regex!',
          isRegexAll
            ? 'In regex, "." matches ANY single character. Every character in "A.B.C" (all 5 chars) is replaced with "#".'
            : 'replace() replaces only the literal "." dots, producing "A#B#C".',
        ],
        autopsy: {
          verdictSummary: isRegexAll
            ? 'replaceAll(".", "#") treats "." as a regex wildcard matching every character. All 5 characters become "#" -> "#####".'
            : 'replace(".", "#") treats "." literally, producing "A#B#C".',
          lineByLineNotes: [
            { line: 3, note: 'data has value "A.B.C" (length 5).' },
            {
              line: 4,
              note: isRegexAll
                ? 'replaceAll compiles regex "." which matches ALL characters!'
                : 'replace treats "." as literal string and replaces only dots.',
            },
            { line: 5, note: `Prints "${expected}".` },
          ],
          deepDive:
            'String.replaceAll(regex, replacement) interprets the first parameter as a regex. To replace literal dots with replaceAll, you must escape it: replaceAll("\\\\.", "#").',
        },
      };
    },
  },

  // 5b. METHODS: isEmpty() vs isBlank()
  {
    concept: 'methods',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const spaces = '   ';
      const testBlank = Math.random() > 0.5;
      const method = testBlank ? 'isBlank()' : 'isEmpty()';
      const expected = testBlank ? 'true' : 'false';

      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String whitespace = "${spaces}";
        System.out.println(whitespace.${method});
    }
}`;

      return {
        id: `case-blank-empty-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `blank-empty-${method}`,
        title: 'The Invisible Whitespace Test',
        difficulty: diff,
        primaryConcept: 'methods',
        caseType: 'output_prediction',
        mysteryStory: `A string containing three spaces is tested. Predict what is printed to the console.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          'What is the difference between isEmpty() and isBlank()?',
          'isEmpty() returns true ONLY if length() == 0.',
          'isBlank() returns true if the string is empty OR contains only whitespace codepoints.',
        ],
        autopsy: {
          verdictSummary: testBlank
            ? 'isBlank() checks if the string is empty or contains only whitespace. 3 spaces -> true.'
            : 'isEmpty() checks if length() == 0. "   " has length 3 -> false.',
          lineByLineNotes: [
            { line: 3, note: 'whitespace has 3 space characters (length = 3).' },
            {
              line: 4,
              note: testBlank
                ? 'isBlank() returns true because all characters are whitespace.'
                : 'isEmpty() returns false because length is 3 (not 0).',
            },
          ],
          deepDive:
            'Java 11 introduced isBlank(). isEmpty() strictly verifies length() == 0, whereas isBlank() checks if all codepoints are whitespace according to Character.isWhitespace().',
        },
      };
    },
  },

  // 6. CONCATENATION: Evaluation order and precedence ("A" + 1 + 2 vs 1 + 2 + "A")
  {
    concept: 'concatenation',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const mode = pickRandom(['str_first', 'int_first', 'with_parens']);
      const n1 = randomInt(1, 5);
      const n2 = randomInt(1, 5);
      const letter = pickRandom(['X', 'Z', 'A', 'K']);

      let code = '';
      let expected = '';
      let title = '';

      if (mode === 'str_first') {
        title = 'Left-to-Right Coercion Spill';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        System.out.println("${letter}" + ${n1} + ${n2});
    }
}`;
        expected = `${letter}${n1}${n2}`;
      } else if (mode === 'int_first') {
        title = 'Arithmetic-First Ignition';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        System.out.println(${n1} + ${n2} + "${letter}");
    }
}`;
        expected = `${n1 + n2}${letter}`;
      } else {
        title = 'The Parentheses Barrier';
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        System.out.println("${letter}" + (${n1} + ${n2}));
    }
}`;
        expected = `${letter}${n1 + n2}`;
      }

      return {
        id: `case-concat-order-${mode}-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `concat-${mode}-${n1}-${n2}`,
        title,
        difficulty: diff,
        primaryConcept: 'concatenation',
        secondaryConcepts: ['precedence'],
        caseType: 'output_prediction',
        mysteryStory: `Evaluate the order of operations and string concatenation. Predict the console output.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'Binary + is left-associative in Java.',
          mode === 'str_first'
            ? `("${letter}" + ${n1}) produces "${letter}${n1}", which is then concatenated with ${n2}.`
            : mode === 'int_first'
            ? `(${n1} + ${n2}) produces the integer ${n1 + n2}, which is then concatenated with "${letter}".`
            : `Parentheses force (${n1} + ${n2}) to be computed first as integer ${n1 + n2}.`,
          `Final output is "${expected}".`,
        ],
        autopsy: {
          verdictSummary: `Evaluation proceeds left-to-right: ${expected}.`,
          lineByLineNotes: [
            {
              line: 3,
              note:
                mode === 'str_first'
                  ? `("${letter}" + ${n1}) = "${letter}${n1}"; then ("${letter}${n1}" + ${n2}) = "${expected}".`
                  : mode === 'int_first'
                  ? `(${n1} + ${n2}) = ${n1 + n2}; then (${n1 + n2} + "${letter}") = "${expected}".`
                  : `Parentheses (${n1} + ${n2}) evaluate first to ${n1 + n2}; then concatenated with "${letter}".`,
            },
          ],
          deepDive:
            'When two numbers are added with +, integer addition occurs. Once a String is involved in a + operation, all operands in that operation are converted to Strings.',
        },
      };
    },
  },

  // 7. STRINGBUILDER: In-place mutation and aliases
  {
    concept: 'string_builder',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const base = pickRandom(['Code', 'File', 'Clue', 'Vault']);
      const extra = pickRandom(['99', 'X', 'Red', 'Top']);
      const useAlias = diff >= 5 && Math.random() > 0.5;

      let code = '';
      let expected = '';

      if (useAlias) {
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        StringBuilder sb1 = new StringBuilder("${base}");
        StringBuilder sb2 = sb1;
        sb2.append("${extra}");
        System.out.println(sb1.toString());
    }
}`;
        expected = `${base}${extra}`;
      } else {
        code = `public class DetectiveCase {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("${base}");
        sb.append("${extra}");
        System.out.println(sb.toString());
    }
}`;
        expected = `${base}${extra}`;
      }

      return {
        id: `case-sb-mut-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `sb-mut-${base}-${useAlias}`,
        title: useAlias ? 'The Two-Faced StringBuilder Alias' : 'The Mutable Buffer Mutation',
        difficulty: diff,
        primaryConcept: 'string_builder',
        secondaryConcepts: ['immutability'],
        caseType: 'output_prediction',
        mysteryStory: `Inspect the StringBuilder operations and references. What is printed to the console?`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'Is StringBuilder immutable or mutable?',
          useAlias
            ? 'sb1 and sb2 point to the exact same StringBuilder object in heap memory.'
            : 'sb.append() modifies the existing StringBuilder instance in place.',
          `Calling append("${extra}") modifies the buffer to "${expected}".`,
        ],
        autopsy: {
          verdictSummary: `StringBuilder is mutable. Calling append() modifies the internal buffer directly, producing "${expected}".`,
          lineByLineNotes: [
            { line: 3, note: `Creates StringBuilder with content "${base}".` },
            ...(useAlias
              ? [{ line: 4, note: 'sb2 references the identical StringBuilder instance as sb1.' }]
              : []),
            { line: useAlias ? 5 : 4, note: `append("${extra}") modifies the buffer in-place.` },
            { line: useAlias ? 6 : 5, note: `Prints content: "${expected}".` },
          ],
          deepDive:
            'StringBuilder does not generate discarded String objects on every mutation; it expands an internal char[] buffer and returns `this`.',
        },
      };
    },
  },

  // 7b. STRINGBUILDER: reverse and delete chained
  {
    concept: 'string_builder',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("ABCDE");
        sb.delete(1, 3); // deletes indices 1 and 2
        sb.reverse();
        System.out.println(sb);
    }
}`;

      // ABCDE delete(1, 3) -> indices 1('B') and 2('C') removed -> "ADE"
      // reverse -> "EDA"
      return {
        id: `case-sb-chain-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `sb-chain-del-rev`,
        title: 'The Scrambled Cipher Tape',
        difficulty: diff,
        primaryConcept: 'string_builder',
        caseType: 'output_prediction',
        mysteryStory: `A StringBuilder undergoes chained delete and reverse operations. Predict the resulting string.`,
        codeSnippet: code,
        expectedOutput: 'EDA',
        acceptedAnswers: ['EDA', '"EDA"'],
        hints: [
          'sb.delete(start, end) removes characters from start (inclusive) to end (exclusive).',
          'delete(1, 3) removes indices 1 and 2 (\'B\' and \'C\'). What string remains?',
          '"ADE" reversed becomes "EDA".',
        ],
        autopsy: {
          verdictSummary: 'delete(1, 3) leaves "ADE", and reverse() flips it to "EDA".',
          lineByLineNotes: [
            { line: 3, note: 'sb initialized with "ABCDE" (indices 0..4).' },
            { line: 4, note: 'Deletes characters at index 1 and 2 (B and C). Remaining: "ADE".' },
            { line: 5, note: 'Reverses "ADE" in place to "EDA".' },
            { line: 6, note: 'Prints "EDA".' },
          ],
          deepDive:
            'StringBuilder.delete(start, end) removes the characters in the range [start, end). Like substring, end is exclusive.',
        },
      };
    },
  },

  // 8. ESCAPES & NULLS: Escape sequence lengths and NPE traps
  {
    concept: 'escapes_nulls',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const mode = pickRandom(['escape_len', 'null_concat', 'null_npe']);

      if (mode === 'escape_len') {
        const escapeChar = pickRandom(['\\n', '\\t', '\\\\', '\\"']);
        const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String escape = "${escapeChar}";
        System.out.println(escape.length());
    }
}`;
        return {
          id: `case-escape-len-${caseNum}`,
          caseNumber: caseNum,
          fingerprint: `escape-len-${escapeChar}`,
          title: 'The Optical Illusion Escape Code',
          difficulty: diff,
          primaryConcept: 'escapes_nulls',
          caseType: 'output_prediction',
          mysteryStory: `A string containing an escape sequence has its length evaluated. Predict the integer length.`,
          codeSnippet: code,
          expectedOutput: '1',
          acceptedAnswers: ['1'],
          hints: [
            'How does the Java compiler interpret escape sequences like \\n or \\\\ in string literals?',
            'Even though an escape sequence is written with two keystrokes in source code, it represents a single character in memory.',
            'Therefore, its length() is exactly 1.',
          ],
          autopsy: {
            verdictSummary:
              'In Java string literals, escape sequences such as \\n or \\\\ represent a single char codepoint. The length is 1.',
            lineByLineNotes: [
              { line: 3, note: `The escape sequence represents 1 unicode character.` },
              { line: 4, note: `Prints 1.` },
            ],
            deepDive:
              'Java compiles escape sequences directly into single 16-bit char values (e.g. \\n is ASCII 10, \\\\ is ASCII 92).',
          },
        };
      } else if (mode === 'null_concat') {
        const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String clue = null;
        System.out.println("Status: " + clue);
    }
}`;
        return {
          id: `case-null-concat-${caseNum}`,
          caseNumber: caseNum,
          fingerprint: `null-concat`,
          title: 'The Silent Null Concatenation',
          difficulty: diff,
          primaryConcept: 'escapes_nulls',
          secondaryConcepts: ['concatenation'],
          caseType: 'output_prediction',
          mysteryStory: `A null String reference is concatenated using the + operator. Predict the console output.`,
          codeSnippet: code,
          expectedOutput: 'Status: null',
          acceptedAnswers: ['Status: null', '"Status: null"'],
          hints: [
            'Does using binary + on a null reference throw NullPointerException?',
            'In Java, the + operator automatically converts null references into the literal string "null".',
            'Thus, "Status: " + null produces "Status: null".',
          ],
          autopsy: {
            verdictSummary:
              'The + operator converts null into the 4-letter string "null". Output is "Status: null".',
            lineByLineNotes: [
              { line: 3, note: 'clue reference is null.' },
              {
                line: 4,
                note: 'Binary + converts null to "null" without throwing. Outputs "Status: null".',
              },
            ],
            deepDive:
              'JLS §15.18.1.1 dictates that if a reference is null, it is converted to the string "null" during string conversion.',
          },
        };
      } else {
        const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String suspect = null;
        int len = suspect.length();
        System.out.println(len);
    }
}`;
        return {
          id: `case-null-npe-${caseNum}`,
          caseNumber: caseNum,
          fingerprint: `null-npe`,
          title: 'The Fatal Null Dereference',
          difficulty: diff,
          primaryConcept: 'escapes_nulls',
          caseType: 'exception_prediction',
          mysteryStory: `The length() method is invoked on a null String reference. Predict the runtime outcome.`,
          codeSnippet: code,
          expectedOutput: 'NullPointerException',
          acceptedAnswers: [
            'NullPointerException',
            'java.lang.NullPointerException',
            'NPE',
            'exception',
          ],
          choices: [
            { id: 'c1', text: 'NullPointerException', isCorrect: true },
            { id: 'c2', text: 'Prints 0', isCorrect: false },
            { id: 'c3', text: 'Prints -1', isCorrect: false },
            { id: 'c4', text: 'StringIndexOutOfBoundsException', isCorrect: false },
          ],
          hints: [
            'The variable `suspect` is assigned `null`.',
            'What happens when you invoke any instance method on a null reference in Java?',
            'Dereferencing null throws NullPointerException.',
          ],
          autopsy: {
            verdictSummary:
              'Calling any instance method on a null reference immediately throws NullPointerException.',
            lineByLineNotes: [
              { line: 3, note: 'suspect is assigned null (no object exists).' },
              { line: 4, note: 'Attempting to invoke .length() on null throws NullPointerException!' },
            ],
            deepDive:
              'Unlike primitive types, reference variables can be null. Invoking methods on null triggers java.lang.NullPointerException.',
          },
        };
      }
    },
  },

  // 9. COMPARETO: Lexicographical order and character differences
  {
    concept: 'compare_to',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const mode = pickRandom(['single_char', 'prefix_len', 'case_diff']);
      let s1 = '';
      let s2 = '';
      let expectedNum = 0;
      let explanationText = '';

      if (mode === 'single_char') {
        s1 = 'A';
        s2 = 'C';
        expectedNum = 'A'.charCodeAt(0) - 'C'.charCodeAt(0); // 65 - 67 = -2
        explanationText = `'A' (ASCII 65) - 'C' (ASCII 67) = -2`;
      } else if (mode === 'prefix_len') {
        s1 = 'sherlock';
        s2 = 'sher';
        expectedNum = s1.length - s2.length; // 8 - 4 = 4
        explanationText = `Because "sher" is a prefix of "sherlock", compareTo returns the length difference: 8 - 4 = 4`;
      } else {
        s1 = 'b';
        s2 = 'B';
        expectedNum = 'b'.charCodeAt(0) - 'B'.charCodeAt(0); // 98 - 65 = 33
        explanationText = `'b' (ASCII 98) - 'B' (ASCII 65) = 33`;
      }

      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String str1 = "${s1}";
        String str2 = "${s2}";
        System.out.println(str1.compareTo(str2));
    }
}`;

      return {
        id: `case-compare-${mode}-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `compare-${mode}-${s1}-${s2}`,
        title: 'The Lexicographical Verdict',
        difficulty: diff,
        primaryConcept: 'compare_to',
        caseType: 'output_prediction',
        mysteryStory: `Two strings are compared lexicographically using compareTo(). Calculate the integer return value.`,
        codeSnippet: code,
        expectedOutput: `${expectedNum}`,
        acceptedAnswers: [`${expectedNum}`],
        hints: [
          'compareTo() compares characters by their Unicode codepoints.',
          mode === 'prefix_len'
            ? 'When one string is a prefix of another, compareTo() returns the difference in lengths.'
            : 'At the first differing character, it subtracts the second character code from the first.',
          explanationText,
        ],
        autopsy: {
          verdictSummary: `str1.compareTo(str2) evaluates to ${expectedNum}. ${explanationText}`,
          lineByLineNotes: [
            { line: 3, note: `str1 = "${s1}"` },
            { line: 4, note: `str2 = "${s2}"` },
            { line: 5, note: `Computes lexicographical comparison: ${expectedNum}.` },
          ],
          deepDive:
            'String.compareTo() returns the difference between the Unicode values of the characters at the first mismatch index, or the length difference if one string is a prefix of the other.',
        },
      };
    },
  },

  // 10. PRECEDENCE: Complex expression precedence
  {
    concept: 'precedence',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const a = randomInt(2, 4);
      const b = randomInt(3, 5);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        System.out.println("Result: " + ${a} * ${b});
    }
}`;

      const expected = `Result: ${a * b}`;

      return {
        id: `case-prec-mult-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `prec-mult-${a}-${b}`,
        title: 'The High-Precedence Multiplier',
        difficulty: diff,
        primaryConcept: 'precedence',
        secondaryConcepts: ['concatenation'],
        caseType: 'output_prediction',
        mysteryStory: `Evaluate operator precedence between multiplication and string concatenation.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `"${expected}"`],
        hints: [
          'Which operator has higher precedence: * (multiplication) or + (addition/concatenation)?',
          `* binds tighter than +, so ${a} * ${b} evaluates first.`,
          `"${a} * ${b}" = ${a * b}, which is then concatenated with "Result: ".`,
        ],
        autopsy: {
          verdictSummary: `Multiplication takes precedence over addition/concatenation. ${a} * ${b} = ${a * b}, yielding "${expected}".`,
          lineByLineNotes: [
            {
              line: 3,
              note: `Evaluates ${a} * ${b} first (= ${a * b}), then concatenates with "Result: ".`,
            },
          ],
          deepDive:
            'Multiplicative operators (*, /, %) have strictly higher precedence than additive operators (+, -). Thus, the product is computed as an integer before concatenation.',
        },
      };
    },
  },

  // 11. LOOPS & TRAVERSAL: Off-by-one loop bug
  {
    concept: 'loops_traversal',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'choose_fix',
    generate: (diff, caseNum) => {
      const word = pickRandom(['EVIDENCE', 'SUSPECT', 'DOSSIER', 'SHADOW']);
      const code = `1: public class Traverser {
2:     public static void main(String[] args) {
3:         String word = "${word}";
4:         for (int i = 0; i <= word.length(); i++) {
5:             System.out.print(word.charAt(i));
6:         }
7:     }
8: }`;

      const fixes: FixOption[] = [
        {
          id: 'fix1',
          label: 'Change loop condition to i < word.length()',
          codeSnippet: 'for (int i = 0; i < word.length(); i++)',
          isCorrect: true,
          why: 'Prevents accessing charAt(word.length()), which throws StringIndexOutOfBoundsException.',
        },
        {
          id: 'fix2',
          label: 'Start loop from int i = 1 instead',
          codeSnippet: 'for (int i = 1; i <= word.length(); i++)',
          isCorrect: false,
          why: 'This would skip the first character (index 0) and still crash on word.length()!',
        },
        {
          id: 'fix3',
          label: 'Change word.length() to word.length() + 1',
          codeSnippet: 'for (int i = 0; i <= word.length() + 1; i++)',
          isCorrect: false,
          why: 'This causes the out-of-bounds error even sooner.',
        },
      ];

      return {
        id: `case-loop-fix-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `loop-fix-${word}`,
        title: 'The Infinite Boundary Breach',
        difficulty: diff,
        primaryConcept: 'loops_traversal',
        secondaryConcepts: ['indexing'],
        caseType: 'choose_fix',
        mysteryStory: `A loop traversing a string throws an index out of bounds exception. Select the correct fix.`,
        codeSnippet: code,
        expectedOutput: 'Change loop condition to i < word.length()',
        acceptedAnswers: ['fix1'],
        fixOptions: shuffleArray(fixes),
        hints: [
          'What is the last valid index in a Java string of length N?',
          'The last valid index is length - 1.',
          'Using i <= word.length() attempts to read word.charAt(word.length()), which throws an exception. Use i < word.length().',
        ],
        autopsy: {
          verdictSummary:
            'Line 4 uses <= word.length(), which attempts to access index equal to length. Replacing with < word.length() fixes the bug.',
          lineByLineNotes: [
            { line: 3, note: `String has length ${word.length}. Valid indices 0 to ${word.length - 1}.` },
            { line: 4, note: `BUG: Loop continues while i == ${word.length}.` },
            { line: 5, note: `charAt(${word.length}) throws StringIndexOutOfBoundsException.` },
          ],
          deepDive:
            'Canonical string iteration in Java is always `for (int i = 0; i < str.length(); i++)`. Using `<=` is a classic off-by-one hazard.',
          correctedCodeSnippet: `for (int i = 0; i < word.length(); i++) {\n    System.out.print(word.charAt(i));\n}`,
        },
      };
    },
  },

  // 11b. LOOPS & TRAVERSAL: String accumulator reverse loop
  {
    concept: 'loops_traversal',
    minDiff: 2,
    maxDiff: 4,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const word = pickRandom(['CAT', 'LAW', 'SPY', 'KEY']);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String s = "${word}";
        String acc = "";
        for (int i = 0; i < s.length(); i++) {
            acc = s.charAt(i) + acc;
        }
        System.out.println(acc);
    }
}`;
      const reversed = word.split('').reverse().join('');

      return {
        id: `case-loop-acc-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `loop-acc-${word}`,
        title: 'The Reversing Accumulator',
        difficulty: diff,
        primaryConcept: 'loops_traversal',
        secondaryConcepts: ['concatenation'],
        caseType: 'output_prediction',
        mysteryStory: `Characters are concatenated in a loop into an accumulator string. Predict the resulting output.`,
        codeSnippet: code,
        expectedOutput: reversed,
        acceptedAnswers: [reversed, `"${reversed}"`],
        hints: [
          'Notice how acc is updated: acc = s.charAt(i) + acc;',
          'Each new character is placed at the front (prepended) of acc, not the end.',
          `Prepending characters from "${word}" results in the reversed string "${reversed}".`,
        ],
        autopsy: {
          verdictSummary: `Prepending s.charAt(i) in each iteration reverses the string into "${reversed}".`,
          lineByLineNotes: [
            { line: 3, note: `Input is "${word}".` },
            { line: 5, note: `Loop visits each char from left to right.` },
            { line: 6, note: `Prepends current character to front of acc.` },
            { line: 8, note: `Prints reversed result: "${reversed}".` },
          ],
          deepDive:
            'Concatenating `c + acc` prepends to the accumulator, reversing character order. In production, a StringBuilder with .reverse() is preferred for performance.',
        },
      };
    },
  },

  // 12. EDGE CASES & MIXED: String.valueOf(null) vs Object vs Char[]
  {
    concept: 'edge_cases',
    minDiff: 4,
    maxDiff: 5,
    caseType: 'multiple_choice',
    generate: (diff, caseNum) => {
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        Object obj = null;
        System.out.println(String.valueOf(obj));
    }
}`;

      const choices: ChoiceOption[] = [
        { id: 'c1', text: 'Prints the text "null"', isCorrect: true, explanation: 'String.valueOf(Object) safely returns "null".' },
        { id: 'c2', text: 'Throws NullPointerException', isCorrect: false, explanation: 'Only String.valueOf(char[]) throws NPE on null.' },
        { id: 'c3', text: 'Prints empty string ""', isCorrect: false },
        { id: 'c4', text: 'Compilation error (ambiguous method)', isCorrect: false },
      ];

      return {
        id: `case-edge-null-obj-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `edge-null-obj`,
        title: 'The Ambiguous ValueOf Trap',
        difficulty: diff,
        primaryConcept: 'edge_cases',
        secondaryConcepts: ['escapes_nulls'],
        caseType: 'multiple_choice',
        mysteryStory: `String.valueOf has overloaded signatures for char[] and Object. When passed an Object reference that is null, what happens?`,
        codeSnippet: code,
        expectedOutput: 'Prints the text "null"',
        acceptedAnswers: ['c1', 'Prints the text "null"'],
        choices: shuffleArray(choices),
        hints: [
          'Notice the variable type is Object, not char[].',
          'String.valueOf(Object obj) returns (obj == null) ? "null" : obj.toString().',
          'It safely prints "null" without throwing!',
        ],
        autopsy: {
          verdictSummary:
            'String.valueOf((Object) null) checks if the object is null and returns the literal string "null".',
          lineByLineNotes: [
            { line: 3, note: 'obj is declared as Object and set to null.' },
            {
              line: 4,
              note: 'Invokes String.valueOf(Object), which yields the 4-character string "null".',
            },
          ],
          deepDive:
            'String.valueOf(char[] data) throws NullPointerException if data is null, but String.valueOf(Object obj) returns "null". Because obj is typed as Object, the safe overload is resolved!',
        },
      };
    },
  },

  // 12b. LEVEL 5 MASTER: Mixed Pool + StringBuilder + Identity Challenge
  {
    concept: 'edge_cases',
    minDiff: 4,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const code = `public class MasterDossier {
    public static void main(String[] args) {
        String a = "CASE";
        String b = new StringBuilder("CA").append("SE").toString();
        String c = b.intern();
        
        System.out.println((a == b) + " " + (a == c));
    }
}`;

      return {
        id: `case-master-5-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `master-5-challenge`,
        title: 'Mixed Pool, StringBuilder and intern() Challenge',
        difficulty: 5,
        primaryConcept: 'edge_cases',
        secondaryConcepts: ['string_pool', 'string_builder', 'equality'],
        caseType: 'output_prediction',
        mysteryStory: `Inspect string creation via StringBuilder, string pool interning, and reference equality.`,
        codeSnippet: code,
        expectedOutput: 'false true',
        acceptedAnswers: ['false true', '"false true"'],
        hints: [
          'b is created dynamically via StringBuilder.toString(), which allocates a new object on the heap.',
          'Therefore, a == b compares a pooled literal with a heap instance (false).',
          'c is b.intern(), which returns the pooled reference that matches "CASE" (the same reference as a!).',
        ],
        autopsy: {
          verdictSummary:
            '(a == b) is false because b is a new heap instance. (a == c) is true because c is retrieved from the pool via intern(), matching a.',
          lineByLineNotes: [
            { line: 3, note: 'a points to pooled literal "CASE".' },
            { line: 4, note: 'b is created dynamically on the heap via StringBuilder.' },
            { line: 5, note: 'c is retrieved from the pool via b.intern(), matching a.' },
            { line: 7, note: 'Prints (false) + " " + (true) -> "false true".' },
          ],
          deepDive:
            'StringBuilder.toString() constructs a new String on the heap without pooling it. Calling intern() returns the canonical reference already in the constant pool.',
        },
      };
    },
  },

  // Level 1: Basic charAt(0)
  {
    concept: 'indexing',
    minDiff: 1,
    maxDiff: 2,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const word = pickRandom(['JAVA', 'FILE', 'CLUE', 'SAFE', 'LOCK']);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String code = "${word}";
        System.out.println(code.charAt(0));
    }
}`;
      const expected = word.charAt(0);
      return {
        id: `case-idx-first-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `idx-first-${word}`,
        title: 'The First Glyph Inspection',
        difficulty: diff,
        primaryConcept: 'indexing',
        caseType: 'output_prediction',
        mysteryStory: 'Read the first character of the string at index 0.',
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected, `'${expected}'`],
        hints: [
          'Java Strings use 0-based indexing.',
          'Index 0 refers to the very first character.',
          `The first character of "${word}" is '${expected}'.`,
        ],
        autopsy: {
          verdictSummary: `code.charAt(0) reads index 0, returning '${expected}'.`,
          lineByLineNotes: [
            { line: 3, note: `Initializes code to "${word}".` },
            { line: 4, note: `charAt(0) returns first char '${expected}'.` },
          ],
          deepDive: 'Java strings are indexed from 0 to length() - 1.',
        },
      };
    },
  },

  // Level 1: Basic length()
  {
    concept: 'methods',
    minDiff: 1,
    maxDiff: 2,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const word = pickRandom(['SUSPECT', 'EVIDENCE', 'ALIBI', 'WITNESS']);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String report = "${word}";
        System.out.println(report.length());
    }
}`;
      const expected = `${word.length}`;
      return {
        id: `case-len-basic-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `len-basic-${word}`,
        title: 'The Evidence Character Count',
        difficulty: diff,
        primaryConcept: 'methods',
        caseType: 'output_prediction',
        mysteryStory: 'Determine the character count returned by length().',
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          'The length() method counts all 16-bit unicode characters in the string.',
          `Count the letters in "${word}".`,
          `There are ${word.length} letters.`,
        ],
        autopsy: {
          verdictSummary: `"${word}".length() evaluates to ${word.length}.`,
          lineByLineNotes: [
            { line: 3, note: `report = "${word}"` },
            { line: 4, note: `Counts characters: ${word.length}.` },
          ],
          deepDive: 'String.length() returns the number of UTF-16 code units in the string.',
        },
      };
    },
  },

  // Level 1: Basic equals()
  {
    concept: 'equality',
    minDiff: 1,
    maxDiff: 3,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const isSame = Math.random() > 0.5;
      const w1 = pickRandom(['Sherlock', 'Moriarty', 'Watson', 'Lestrade']);
      const w2 = isSame ? w1 : pickRandom(['Adler', 'Mycroft', 'Hudson']);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String p1 = "${w1}";
        String p2 = "${w2}";
        System.out.println(p1.equals(p2));
    }
}`;
      const expected = isSame ? 'true' : 'false';
      return {
        id: `case-eq-basic-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `eq-basic-${w1}-${w2}`,
        title: 'The Identity Verification Scan',
        difficulty: diff,
        primaryConcept: 'equality',
        caseType: 'output_prediction',
        mysteryStory: 'Compare two strings using the .equals() method.',
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          '.equals() tests whether the sequence of characters is identical.',
          isSame ? 'Both strings contain the exact same characters.' : 'The strings contain different characters.',
          `Result is ${expected}.`,
        ],
        autopsy: {
          verdictSummary: `p1.equals(p2) returns ${expected} because character sequences ${isSame ? 'match' : 'differ'}.`,
          lineByLineNotes: [
            { line: 3, note: `p1 = "${w1}"` },
            { line: 4, note: `p2 = "${w2}"` },
            { line: 5, note: `Evaluates to ${expected}.` },
          ],
          deepDive: 'String.equals() overrides Object.equals() to check value equality char by char.',
        },
      };
    },
  },

  // Level 3-5: indexOf and lastIndexOf
  {
    concept: 'indexing',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const mode = Math.random() > 0.5 ? 'indexOf' : 'lastIndexOf';
      const word = 'ABRACADABRA';
      const target = 'A';
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String formula = "${word}";
        System.out.println(formula.${mode}('${target}'));
    }
}`;
      const expected = mode === 'indexOf' ? '0' : '10';
      return {
        id: `case-idx-search-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `idx-search-${mode}`,
        title: mode === 'indexOf' ? 'The First Footprint Query' : 'The Trailing Trace Search',
        difficulty: diff,
        primaryConcept: 'indexing',
        secondaryConcepts: ['methods'],
        caseType: 'output_prediction',
        mysteryStory: `Search for '${target}' in "${word}" using ${mode}().`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          mode === 'indexOf' ? 'indexOf returns the FIRST occurrence (0-based).' : 'lastIndexOf returns the LAST occurrence (0-based).',
          `The string is "${word}". Indices run 0 to 10.`,
          mode === 'indexOf' ? 'First \'A\' is at index 0.' : 'Last \'A\' is at index 10.',
        ],
        autopsy: {
          verdictSummary: `${mode}('${target}') finds the ${mode === 'indexOf' ? 'first' : 'last'} occurrence at index ${expected}.`,
          lineByLineNotes: [
            { line: 3, note: `formula = "${word}"` },
            { line: 4, note: `Finds index ${expected}.` },
          ],
          deepDive: 'indexOf scans forward from index 0; lastIndexOf scans backward from length - 1.',
        },
      };
    },
  },

  // Level 3-5: split("\\.") regex escape
  {
    concept: 'methods',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const isEscaped = Math.random() > 0.5;
      const code = isEscaped
        ? `public class DetectiveCase {
    public static void main(String[] args) {
        String ip = "192.168.1.1";
        String[] parts = ip.split("\\\\.");
        System.out.println(parts.length);
    }
}`
        : `public class DetectiveCase {
    public static void main(String[] args) {
        String ip = "192.168.1.1";
        String[] parts = ip.split(".");
        System.out.println(parts.length);
    }
}`;

      // In Java:
      // ip.split(".") -> regex "." matches any char -> splits on every char, producing trailing empty strings which are discarded -> length is 0!
      // ip.split("\\.") -> regex "\\." matches literal dots -> 4 parts!
      const expected = isEscaped ? '4' : '0';

      return {
        id: `case-split-dot-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `split-dot-${isEscaped}`,
        title: isEscaped ? 'The Escaped Delimiter Split' : 'The Swallowed Regex Split Trap',
        difficulty: diff,
        primaryConcept: 'methods',
        secondaryConcepts: ['edge_cases'],
        caseType: 'output_prediction',
        mysteryStory: `A string is split using the split() method. Predict the length of the resulting array.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          'split(regex) interprets its parameter as a Regular Expression.',
          isEscaped
            ? '"\\\\." escapes the dot, matching literal period characters.'
            : 'Unescaped "." in regex matches ANY single character!',
          isEscaped
            ? 'There are 3 dots separating 4 segments. Output is 4.'
            : 'Splitting on every character leaves empty matches that are trimmed by split(regex), resulting in array length 0.',
        ],
        autopsy: {
          verdictSummary: isEscaped
            ? 'split("\\\\.") correctly splits on literal dots, producing 4 elements.'
            : 'split(".") matches EVERY character in regex. Splitting on every character discards trailing empties, yielding length 0.',
          lineByLineNotes: [
            { line: 3, note: 'ip has 11 characters and 3 dots.' },
            {
              line: 4,
              note: isEscaped
                ? 'Regex "\\." matches literal dots -> 4 segments.'
                : 'Regex "." matches every char -> produces empty parts trimmed to length 0.',
            },
            { line: 5, note: `Prints array length: ${expected}.` },
          ],
          deepDive:
            'String.split(regex) delegates to Pattern.compile(regex).split(str, 0), which discards trailing empty strings. A regex "." matches every single character.',
        },
      };
    },
  },

  // Level 3-5: compareTo difference with ASCII
  {
    concept: 'compare_to',
    minDiff: 3,
    maxDiff: 5,
    caseType: 'output_prediction',
    generate: (diff, caseNum) => {
      const c1 = pickRandom(['A', 'C', 'E']);
      const c2 = pickRandom(['B', 'D', 'F']);
      const diffVal = c1.charCodeAt(0) - c2.charCodeAt(0);
      const code = `public class DetectiveCase {
    public static void main(String[] args) {
        String a = "${c1}1";
        String b = "${c2}1";
        System.out.println(a.compareTo(b));
    }
}`;
      const expected = `${diffVal}`;
      return {
        id: `case-cmp-ascii-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `cmp-ascii-${c1}-${c2}`,
        title: 'The Cipher ASCII Offset',
        difficulty: diff,
        primaryConcept: 'compare_to',
        caseType: 'output_prediction',
        mysteryStory: `Calculate the exact numeric return of compareTo() at the first mismatch.`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: [expected],
        hints: [
          'compareTo() checks char by char and returns (char1 - char2) at the first mismatch.',
          `First mismatch is '${c1}' (ASCII ${c1.charCodeAt(0)}) vs '${c2}' (ASCII ${c2.charCodeAt(0)}).`,
          `${c1.charCodeAt(0)} - ${c2.charCodeAt(0)} = ${diffVal}.`,
        ],
        autopsy: {
          verdictSummary: `'${c1}' (code ${c1.charCodeAt(0)}) minus '${c2}' (code ${c2.charCodeAt(0)}) yields ${diffVal}.`,
          lineByLineNotes: [
            { line: 3, note: `a = "${c1}1"` },
            { line: 4, note: `b = "${c2}1"` },
            { line: 5, note: `Computes '${c1}' - '${c2}' = ${diffVal}.` },
          ],
          deepDive: 'When strings differ at index k, compareTo() returns charAt(k) - other.charAt(k).',
        },
      };
    },
  },

  // Level 4-5: String.valueOf((char[]) null) throws NPE vs Object null
  {
    concept: 'edge_cases',
    minDiff: 4,
    maxDiff: 5,
    caseType: 'exception_prediction',
    generate: (diff, caseNum) => {
      const isCharArray = Math.random() > 0.5;
      const code = isCharArray
        ? `public class DetectiveCase {
    public static void main(String[] args) {
        char[] chars = null;
        System.out.println(String.valueOf(chars));
    }
}`
        : `public class DetectiveCase {
    public static void main(String[] args) {
        Object obj = null;
        System.out.println(String.valueOf(obj));
    }
}`;

      const expected = isCharArray ? 'NullPointerException' : 'null';

      return {
        id: `case-edge-valueof-${caseNum}`,
        caseNumber: caseNum,
        fingerprint: `edge-valueof-${isCharArray}`,
        title: isCharArray ? 'The Char Array Overload Trap' : 'The Safe Object Conversion',
        difficulty: diff,
        primaryConcept: 'edge_cases',
        secondaryConcepts: ['escapes_nulls'],
        caseType: isCharArray ? 'exception_prediction' : 'output_prediction',
        mysteryStory: `Inspect the overload resolution of String.valueOf(${isCharArray ? 'char[]' : 'Object'}). What happens?`,
        codeSnippet: code,
        expectedOutput: expected,
        acceptedAnswers: isCharArray
          ? ['NullPointerException', 'java.lang.NullPointerException', 'NPE']
          : ['null', '"null"'],
        choices: isCharArray
          ? [
              { id: 'c1', text: 'NullPointerException', isCorrect: true },
              { id: 'c2', text: 'Prints "null"', isCorrect: false },
              { id: 'c3', text: 'Prints empty string ""', isCorrect: false },
              { id: 'c4', text: 'Compilation Error', isCorrect: false },
            ]
          : undefined,
        hints: [
          'String.valueOf has separate overloaded versions for char[] and Object.',
          isCharArray
            ? 'String.valueOf(char[] data) directly creates a new String(data), which throws NullPointerException if data is null!'
            : 'String.valueOf(Object obj) checks `(obj == null) ? "null" : obj.toString()`.',
          isCharArray ? 'It throws NullPointerException!' : 'It prints "null".',
        ],
        autopsy: {
          verdictSummary: isCharArray
            ? 'String.valueOf(char[] data) throws NullPointerException when passed null because String(char[]) constructor rejects null.'
            : 'String.valueOf(Object) safely returns "null".',
          lineByLineNotes: [
            { line: 3, note: `Variable is typed as ${isCharArray ? 'char[]' : 'Object'} and assigned null.` },
            {
              line: 4,
              note: isCharArray
                ? 'Overload String.valueOf(char[]) executes and throws NullPointerException!'
                : 'Overload String.valueOf(Object) executes and returns "null".',
            },
          ],
          deepDive:
            'This is one of Java’s most infamous interview traps: String.valueOf(char[]) throws NPE, whereas String.valueOf(Object) returns "null".',
        },
      };
    },
  },
];

