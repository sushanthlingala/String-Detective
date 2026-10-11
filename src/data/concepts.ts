import { ConceptId, ConceptMeta } from '../types/game';

export const CONCEPTS: Record<ConceptId, ConceptMeta> = {
  immutability: {
    id: 'immutability',
    name: 'Immutability & Ignored Returns',
    tagline: 'String objects in Java can never be modified in-place',
    levelRange: [1, 3],
    mysteryDossier:
      'Developers often assume calling methods like concat(), toUpperCase(), or replace() alters the original String variable. In Java, Strings are immutable—all mutator methods return a brand-new String instance. If the return value is not reassigned, the mutation is lost.',
    goldenRule:
      'Always capture the returned reference! e.g., s = s.toUpperCase(); or the original string remains untouched.',
    traps: [
      'Calling s.concat("X") on line 2 without assignment (s still has old value).',
      'Calling s.replace(\'a\', \'b\') expecting s to change.',
      'Calling s.trim() or s.substring() without reassigning the variable.',
    ],
    exampleCode: `String s = "mystery";
s.toUpperCase(); // Ignored return value!
System.out.println(s); // Outputs: "mystery"

s = s.toUpperCase(); // Captured return
System.out.println(s); // Outputs: "MYSTERY"`,
    explanation:
      'The java.lang.String class is final and backed by an immutable byte array. Any method that appears to change a String actually returns a new String on the heap or pool.',
  },

  equality: {
    id: 'equality',
    name: 'Reference Identity (==) vs (.equals)',
    tagline: '== tests pointer memory address; .equals() tests character content',
    levelRange: [1, 3],
    mysteryDossier:
      'A classic pitfall in Java Strings: == checks if two references point to the exact same memory address on the JVM heap. .equals() checks if the sequence of characters inside both strings match. new String("A") always creates a distinct heap object, making == false even when .equals() is true.',
    goldenRule:
      'Use .equals() for content comparison. == only returns true if both references point to the identical object in memory.',
    traps: [
      'Expecting s1 == s2 to be true when one was constructed via new String().',
      'Comparing String with null using s.equals(null) vs null.equals(s) (which throws NullPointerException).',
      'Using == on user input or dynamically computed Strings.',
    ],
    exampleCode: `String a = new String("clue");
String b = new String("clue");
System.out.println(a == b);      // false (different heap objects)
System.out.println(a.equals(b)); // true  (same characters)`,
    explanation:
      'Constructing strings with `new` guarantees a distinct object on the Java heap, bypassing literal identity optimization unless manually interned.',
  },

  string_pool: {
    id: 'string_pool',
    name: 'String Pool, Literals & intern()',
    tagline: 'Literal reuse in JVM constant pool vs heap instances',
    levelRange: [3, 5],
    mysteryDossier:
      'The JVM maintains a String Constant Pool. String literals ("vault") are automatically pooled. Compile-time constant expressions ("a" + "b") are folded by javac into a single pooled literal! However, runtime concatenation (s1 + "b") produces a new heap object that is NOT pooled unless .intern() is called.',
    goldenRule:
      'Compile-time constants are pooled and share identity (==). Runtime variable concatenation creates unpooled heap objects. .intern() fetches or deposits into the pool.',
    traps: [
      'Assuming "a" + "b" creates a new heap object at runtime (it is folded by javac to "ab").',
      'Assuming String a = "x"; String b = a + "y"; is pooled (it is built on heap).',
      'Assuming new String("test").intern() == new String("test") (the interned reference equals the literal pool reference, not the uninterned new instance).',
    ],
    exampleCode: `String s1 = "evidence";
String s2 = "evidence";
System.out.println(s1 == s2); // true (both point to pool literal)

String s3 = new String("evidence");
System.out.println(s1 == s3); // false
System.out.println(s1 == s3.intern()); // true!`,
    explanation:
      'The constant pool avoids duplicate String objects for identical string literals. intern() queries the pool for a string with identical content.',
  },

  indexing: {
    id: 'indexing',
    name: 'Indexing & Bounds (charAt, substring)',
    tagline: 'Zero-based indexes, inclusive-begin, exclusive-end',
    levelRange: [1, 3],
    mysteryDossier:
      'Off-by-one errors are common in string traversal. String indexing in Java is 0-indexed. The method substring(begin, end) is inclusive of begin but EXCLUSIVE of end. The length of substring(begin, end) is always exactly (end - begin). Accessing charAt(s.length()) throws StringIndexOutOfBoundsException.',
    goldenRule:
      'Valid indices for charAt are 0 to s.length() - 1. For substring(a, b), valid range is 0 <= a <= b <= s.length(). Note that substring(len, len) returns "" (empty string), NOT an exception!',
    traps: [
      'charAt(s.length()) throws StringIndexOutOfBoundsException because length is not an accessible index.',
      'substring(0, 3) yields 3 characters (indices 0, 1, 2), not index 3.',
      'substring(k, k) returns "" safely without throwing.',
      'indexOf("missing") returns -1, which if passed directly into charAt(-1) triggers an exception.',
    ],
    exampleCode: `String s = "DETECTIVE";
System.out.println(s.charAt(0));         // 'D'
System.out.println(s.substring(0, 3));   // "DET"
System.out.println(s.substring(3, 3));   // "" (empty string)
// s.charAt(s.length());                 // StringIndexOutOfBoundsException!`,
    explanation:
      'Java strictly guards boundaries. The exclusive upper bound in substring allows natural slicing where length = end - start.',
  },

  methods: {
    id: 'methods',
    name: 'Standard Methods (contains, split, isBlank)',
    tagline: 'Character searches, regex splits, and modern whitespace checks',
    levelRange: [1, 3],
    mysteryDossier:
      'Java provides specialized inspection methods. contains() checks exact character sequence. replaceAll() uses Regular Expressions (beware: replaceAll(".", "x") matches EVERY character, while replace(".", "x") replaces literal dots!). Java 11 added isEmpty() (length == 0) and isBlank() (empty or all whitespace).',
    goldenRule:
      'replace() replaces literal target sequences; replaceAll() compiles regex. isBlank() checks for whitespace-only strings; isEmpty() checks length == 0.',
    traps: [
      'Confusing replaceAll(".", "-") with replace(".", "-") — regex dot matches any char!',
      'Using split(".") without escaping — regex dot splits on everything resulting in an empty array!',
      'Assuming "  ".isEmpty() is true (it is false; use isBlank() for true).',
    ],
    exampleCode: `String s = "A.B.C";
System.out.println(s.replace(".", "-"));    // "A-B-C"
System.out.println(s.replaceAll(".", "-")); // "-----" (regex matched all!)

String blank = "   ";
System.out.println(blank.isEmpty()); // false
System.out.println(blank.isBlank()); // true`,
    explanation:
      'Knowing whether a method treats its parameter as a raw CharSequence vs a regex Pattern is critical to preventing unintended replacements or splits.',
  },

  concatenation: {
    id: 'concatenation',
    name: 'Concatenation & Order of Evaluation',
    tagline: 'Left-to-right precedence and implicit String conversions',
    levelRange: [1, 3],
    mysteryDossier:
      'The + operator is overloaded in Java. When applied between numbers, it performs integer arithmetic. As soon as one operand is a String, all subsequent additions perform string concatenation left-to-right unless parentheses override precedence!',
    goldenRule:
      '1 + 2 + "X" evaluates (1 + 2) first -> 3 + "X" -> "3X". But "X" + 1 + 2 evaluates ("X" + 1) -> "X1", then "X1" + 2 -> "X12".',
    traps: [
      '"A" + 1 + 2 results in "A12", NOT "A3".',
      '1 + 2 + "A" results in "3A".',
      '"A" + (1 + 2) results in "A3" because parentheses force arithmetic first.',
      'null + "text" yields "nulltext" without throwing, but ((String)null).concat("text") throws NullPointerException.',
    ],
    exampleCode: `System.out.println("Sum: " + 10 + 20);   // "Sum: 1020"
System.out.println("Sum: " + (10 + 20)); // "Sum: 30"
System.out.println(10 + 20 + " Sum");   // "30 Sum"`,
    explanation:
      'Binary + is left-associative. Type coercion to String occurs at the moment a String operand is encountered in the left-to-right chain.',
  },

  string_builder: {
    id: 'string_builder',
    name: 'StringBuilder vs String Mutation',
    tagline: 'Mutable buffers, in-place modification, and method chaining',
    levelRange: [2, 4],
    mysteryDossier:
      'Unlike String, StringBuilder is mutable! Calling sb.append(), sb.delete(), or sb.reverse() modifies the existing buffer in place. Moreover, those methods return `this` (the very same StringBuilder reference), meaning chaining modifies the original object.',
    goldenRule:
      'StringBuilder methods modify the underlying object. sb.append("X") changes sb directly, unlike String.',
    traps: [
      'Assuming sb.append() does not change sb unless assigned back (it DOES modify sb!).',
      'Calling sb.reverse() modifies the original StringBuilder object.',
      'Creating an alias `StringBuilder sb2 = sb1;` and expecting changes to sb2 to not affect sb1.',
      'sb.delete(1, 3) deletes characters at index 1 and 2 (end is exclusive).',
    ],
    exampleCode: `StringBuilder sb = new StringBuilder("Sherlock");
sb.append(" Holmes");
System.out.println(sb); // "Sherlock Holmes" (modified in place!)

StringBuilder alias = sb;
alias.reverse();
System.out.println(sb == alias); // true! Both point to same mutated buffer`,
    explanation:
      'StringBuilder manages an expandable char array. It avoids generating garbage objects in loops by mutating its internal array directly.',
  },

  escapes_nulls: {
    id: 'escapes_nulls',
    name: 'Escapes, Whitespace & Null Traps',
    tagline: 'Null references, escape codes (\\n, \\t, \\\\) and NPE defense',
    levelRange: [2, 4],
    mysteryDossier:
      'A null String reference holds no memory object. Calling any instance method on null (like null.length() or null.toUpperCase()) triggers a fatal java.lang.NullPointerException. However, String.valueOf(null) outputs the literal characters "null"!',
    goldenRule:
      'null.method() -> NullPointerException. String.valueOf(null) -> "null". "hello" + null -> "hellonull". Escape sequence \\" is quote, \\\\ is backslash.',
    traps: [
      'Calling .equals() on a null variable instead of "CONST".equals(variable).',
      'Thinking "X" + null throws an NPE (it concatenates "Xnull").',
      'Counting escape sequence length: "\\n".length() is 1, not 2! "\\\\".length() is 1, not 2!',
    ],
    exampleCode: `String s = "\\n";
System.out.println(s.length()); // 1 (single newline character!)

String missing = null;
System.out.println("File: " + missing); // "File: null"
// System.out.println(missing.length()); // NullPointerException!`,
    explanation:
      'Java translates two-character escape sequences in source code into a single 16-bit unicode character at compile time.',
  },

  compare_to: {
    id: 'compare_to',
    name: 'Lexicographical Comparison (compareTo)',
    tagline: 'Dictionary ordering, ASCII character arithmetic and return signs',
    levelRange: [3, 5],
    mysteryDossier:
      'The compareTo() method compares two Strings lexicographically based on Unicode values of each character. If characters differ, it returns (char1 - char2). If one string is a prefix of another, it returns (len1 - len2). If they are identical, it returns 0.',
    goldenRule:
      's1.compareTo(s2) returns negative if s1 < s2, zero if s1.equals(s2), positive if s1 > s2. Uppercase letters (A=65) come BEFORE lowercase letters (a=97) in Unicode!',
    traps: [
      'Assuming "a".compareTo("A") is negative (it is positive: \'a\'(97) - \'A\'(65) = 32).',
      'Assuming compareTo() only returns -1, 0, or 1 (it returns the difference between differing chars or lengths!).',
      'Comparing "apple" with "applepie": returns 5 - 8 = -3 (length difference).',
    ],
    exampleCode: `System.out.println("A".compareTo("B")); // -1 ('A' - 'B' = 65 - 66)
System.out.println("apple".compareTo("app")); // 2 (5 chars vs 3 chars)
System.out.println("cat".compareTo("cat"));   // 0`,
    explanation:
      'Lexicographical comparison steps character-by-character through the common prefix. If characters differ, the difference in unicode points is returned immediately.',
  },

  precedence: {
    id: 'precedence',
    name: 'Expressions & Operator Precedence',
    tagline: 'Arithmetic operations versus string coercion precedence',
    levelRange: [2, 4],
    mysteryDossier:
      'Operator precedence dictates how expressions decompose. Multiplication and division have higher precedence than binary addition. Left-to-right evaluation applies among equal-precedence operators.',
    goldenRule:
      'Multiplication happens before concatenation: "Result: " + 3 * 4 -> "Result: 12" because 3 * 4 is evaluated first!',
    traps: [
      '"Total: " + 5 + 5 * 2 -> evaluated as 5 * 2 = 10, then "Total: " + 5 -> "Total: 5", then "Total: 5" + 10 -> "Total: 510".',
      'Assuming unary operations behave as strings.',
      'Misinterpreting character arithmetic: \'A\' + 1 + "B" -> 65 + 1 = 66 -> "66B".',
    ],
    exampleCode: `System.out.println("Score: " + 2 * 3); // "Score: 6" (multiplication first!)
System.out.println("Score: " + 2 + 3); // "Score: 23" (+ is left-to-right)
System.out.println('A' + 1 + "!");     // "66!" ('A' promoted to int 65)`,
    explanation:
      'char in arithmetic expressions is promoted to int. String concatenation operator + only triggers when at least one operand in the binary + expression is a String.',
  },

  loops_traversal: {
    id: 'loops_traversal',
    name: 'Loops & Character Traversal',
    tagline: 'Iterating strings, off-by-one loop conditions, and accumulators',
    levelRange: [3, 5],
    mysteryDossier:
      'Loops traversing strings often trip on boundary conditions: for (int i = 0; i <= s.length(); i++) will throw a StringIndexOutOfBoundsException on the final iteration because the last valid index is s.length() - 1.',
    goldenRule:
      'Valid iteration condition is i < s.length(), NOT i <= s.length(). Concatenating strings inside a loop creates a new object on each iteration.',
    traps: [
      'Using i <= s.length() causing StringIndexOutOfBoundsException.',
      'Counting loop iterations starting from 1 instead of 0.',
      'Reversing strings by concatenating in reverse order: res = c + res vs res = res + c.',
    ],
    exampleCode: `String s = "CODE";
String rev = "";
for (int i = 0; i < s.length(); i++) {
    rev = s.charAt(i) + rev; // prepends!
}
System.out.println(rev); // "EDOC"`,
    explanation:
      'Each loop iteration that evaluates s.charAt(i) requires safe bounds. In loops, understanding loop termination and accumulator order is key.',
  },

  edge_cases: {
    id: 'edge_cases',
    name: 'Subtle Edge Cases & Exception Traps',
    tagline: 'Empty slices, replace missing targets, String.valueOf, and subtle JVM behavior',
    levelRange: [4, 5],
    mysteryDossier:
      'Edge cases push Java String specifications to their limits: calling s.substring(2, 2) returns "" without error; calling s.replace("Z", "W") on "ABC" returns "ABC" without error; String.valueOf((Object)null) returns "null", but String.valueOf((char[])null) throws NullPointerException due to method overload resolution!',
    goldenRule:
      'Empty substrings at valid endpoints are valid (""). Non-matching replaces return the original string. Method overloads can choose array vs Object signatures.',
    traps: [
      'Expecting substring(len, len) to throw (it returns ""!).',
      'Assuming replace("NOT_FOUND", "NEW") causes an error.',
      'String.valueOf((char[]) null) throws NullPointerException due to char[] overload.',
      'Testing s.indexOf("") returns 0, not -1!',
    ],
    exampleCode: `String s = "JAVA";
System.out.println(s.substring(4, 4)); // "" (safe empty string!)
System.out.println(s.indexOf(""));      // 0 (empty string matches at index 0)
System.out.println(s.replace("Z", "X")); // "JAVA" (unchanged)`,
    explanation:
      'The Java Language Specification specifically defines boundary handling for substring and indexOf empty string queries.',
  },
};
