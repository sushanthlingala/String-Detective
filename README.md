# STRING DETECTIVE — Java Strings Debugging Game

---

## Overview

**STRING DETECTIVE** is an interactive, browser-based Java Strings debugging lab designed to master core Java string mechanics, memory architecture, and subtle execution pitfalls. 

Instead of passive reading, learners investigate realistic Java code snippets across **5 difficulty tiers**, diagnose unexpected outputs or bugs, test line-specific fixes, and evaluate runtime behaviors in a live, deterministic environment.

---

## Key Features

- **5 Progressive Difficulty Tiers**:
  - `Level 1`: Beginner — Basic immutability & method return values
  - `Level 2`: Intermediate — `.equals()` vs `==` reference identity
  - `Level 3`: Advanced — String constant pool & compile-time constant folding
  - `Level 4`: Expert — `StringBuilder` buffer expansion & indexing bounds
  - `Level 5`: Master — Complex chaining, regex method traps (`split`, `replaceAll`), and edge cases
- **Multi-Modal Challenge Engine**:
  - **Predict Output**: Trace exact console output, including escape sequences and boolean comparisons.
  - **Find the Bug**: Select the specific failing line and apply target fixes.
  - **Multiple Choice**: Diagnose reference identity and memory allocations.
- **Ink Wash & Classic Noir Themes**:
  - **Ink Wash Light Palette**: Soft Ivory (`#FFFFE3`), Charcoal (`#4A4A4A`), Cool Gray (`#CBCBCB`), and Muted Blue-Gray (`#6D8196`).
  - **Classic Noir Dark Palette**: High-contrast dark editor aesthetics with clear syntax highlighting.
  - Smooth slider toggle with persistence via `localStorage`.
- **Java Strings Recap & Concept Manual**:
  - Interactive cheat sheets on String Pool semantics, byte array memory layouts, mutability vs immutability, and time complexity.
- **Session Tracking & Performance Metrics**:
  - Real-time score ticker, current streak, accuracy percentage, and case history inspection.

---

## Core Java Concepts Tested

1. **Immutability & Ignored Returns**:
   - Understanding why `s.toUpperCase()` leaves `s` unchanged unless captured (`s = s.toUpperCase()`).
2. **Reference Identity (`==`) vs Value Equality (`.equals`)**:
   - Heap memory addresses vs character sequence comparison.
3. **String Constant Pool & `intern()`**:
   - Compile-time constant folding (`"a" + "b"`) vs runtime dynamic concatenation (`str + "b"`).
4. **`StringBuilder` & `StringBuffer`**:
   - In-place mutable buffers, capacity auto-expansion formula (`(oldCapacity * 2) + 2`), and synchronization differences.
5. **Indexing & Boundary Traps**:
   - `substring(begin, end)` half-open intervals `[begin, end)`, `StringIndexOutOfBoundsException`, and `charAt()` zero-indexing.
6. **Method Overloads & Regex Traps**:
   - `split()` regex patterns vs literal delimiters, empty token trimming, `replace()` vs `replaceAll()`.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm` / `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/string-detective.git
   cd string-detective
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server at port 3000 |
| `npm run build` | Compiles TypeScript and builds production bundle into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## Project Structure

```text
├── src/
│   ├── components/
│   │   ├── AnswerPanel.tsx         # Console prediction & bug fixer interface
│   │   ├── AssignmentModal.tsx     # Student & course assignment details modal
│   │   ├── CaseCardHeader.tsx      # Case #, target objective & concept badges
│   │   ├── CodeViewer.tsx          # Java snippet syntax viewer with line numbers
│   │   ├── ConceptFilterBar.tsx    # Topic filter buttons & selector
│   │   ├── DifficultySlider.tsx    # 5-level difficulty progression slider
│   │   ├── Header.tsx              # Score counter, theme toggle slider, navigation
│   │   ├── HistoryDrawer.tsx       # Solved/failed case history review drawer
│   │   ├── RecapModal.tsx          # Fundamentals recap dialog
│   │   ├── ReferenceModal.tsx      # Concept manual with Java dossiers
│   │   ├── SessionReportModal.tsx  # Session analytics & concept accuracy breakdown
│   │   └── VerdictPanel.tsx        # Execution feedback, step-by-step trace & explanations
│   ├── data/
│   │   └── concepts.ts             # Concept definitions, pitfalls, and dossiers
│   ├── engine/
│   │   ├── evaluator.ts            # Case submission grading & output comparator
│   │   ├── generator.ts            # Dynamic test case generator
│   │   └── templates.ts            # Parametric Java challenge blueprints
│   ├── hooks/
│   │   └── useGameState.ts         # Central game state management
│   ├── types/
│   │   └── game.ts                 # TypeScript type contracts
│   ├── App.tsx                     # Main layout and view coordination
│   ├── index.css                   # Theme definitions (Ink Wash & Dark Noir)
│   └── main.tsx                    # React application entry point
├── index.html                      # HTML root template with fonts
├── package.json                    # Project metadata & dependencies
├── tsconfig.json                   # TypeScript compiler options
└── vite.config.ts                  # Vite build setup
```

---

## Author

**Sushanth Lingala**  

