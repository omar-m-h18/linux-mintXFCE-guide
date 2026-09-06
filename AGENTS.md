# AGENTS.md: AI Agent Operational Guide

> **Target Audience**: Autonomous AI Agents, Code Assistants, LLM Pair Programmers  
> **Repository**: `linux-mintXFCE-guide` (Linux Mint XFCE Guide)  
> **Primary Language**: Vanilla HTML5 / Modern CSS3 / Vanilla JavaScript (ES6+)  
> **Build System**: None (Pure Static Web Application)  

---

## 1. Prime Directives & Inviolable Constraints

When analyzing, modifying, or extending this repository, every AI agent **MUST** adhere to the following non-negotiable rules:

1. **ABSOLUTELY NO PACKAGE MANAGERS OR EXTERNAL INSTALLS**:
   - Never run `npm install`, `yarn add`, `pnpm`, `pip`, or `cargo`.
   - Never introduce `package.json`, `node_modules`, or build scripts.
   - The user strictly requires zero installations.
2. **ZERO EXTERNAL CDNs OR REMOTE ASSETS**:
   - Never introduce `<script src="https://cdn...">` or `<link rel="stylesheet" href="https://cdnjs...">`.
   - All typography uses system fonts. All icons use native Unicode emojis or inline SVG.
   - The application must remain 100% functional when loaded offline via `file:///`.
3. **DEFENSIVE STORAGE ACCESS VIA `safeStorage`**:
   - Never call `window.localStorage.getItem()`, `setItem()`, or `removeItem()` directly.
   - Always route all storage operations through the internal `safeStorage` proxy in `js/app.js`.
   - Direct calls to `localStorage` throw fatal exceptions in strict browser sandbox environments.
4. **TEMPLATE LITERAL ESCAPING RULE**:
   - Never use raw backticks (`` ` ``) inside ES6 template literals.
   - Always use array joins, string concatenation, or HTML character entities (`&#96;`) when constructing multiline strings or ASCII art.
5. **STRICT ZERO-MUSIC DIRECTIVE**:
   - In accordance with user specifications, the entire project must remain completely free of any references to "music", songs, audio streaming, or music platforms (e.g. Spotify, Rhythmbox).

---

## 2. Codebase Topology & File Map

```
linux-mintXFCE-guide/
├── index.html            # Primary UI layout & semantic DOM tree
├── css/
│   └── style.css         # Mint-Y CSS variables, layout grids, components (~660 lines)
├── js/
│   └── app.js            # Modular application controller (~1300 lines)
├── knowledge.md          # Domain knowledge base & Lovable project brief
├── TECHNICAL_REPORT.md   # Architectural whitepaper & subsystem state machines
├── AGENTS.md             # This agent operation manual
└── README.md             # Human-facing project overview
```

### 2.1 Key DOM Anchors in `index.html`
| Section / Component | Container ID / Class | Key Sub-Elements |
| :--- | :--- | :--- |
| **Sticky Navigation** | `header.site-header` | `#theme-toggle-btn`, `.nav-links` |
| **Hero Reassurance** | `section.hero-section` | `.hero-title`, `.hero-badges` |
| **Rosetta Stone** | `section#rosetta-stone` | `.comparison-table`, `.concept-row` |
| **Timeshift Module** | `section#timeshift-module` | `#timeshift-step-container`, `#timeshift-wizard-btn` |
| **Whisker Menu** | `section#whisker-module` | `#whisker-search-input`, `#whisker-categories`, `#whisker-app-list` |
| **Software Manager** | `section#software-module` | `#software-search-input`, `#software-category-filter`, `#software-grid` |
| **Thunar File Manager**| `section#thunar-module` | `#thunar-sidebar`, `#thunar-breadcrumbs`, `#thunar-file-grid`, `#thunar-modal` |
| **Terminal Sandbox** | `section#terminal-module`| `#terminal-output`, `#terminal-input`, `.quick-cmd-btn` |
| **Knowledge Checks** | `section#quizzes` | `.quiz-box[data-quiz-id="quiz-1"..."quiz-5"]`, `.quiz-option-btn`, `.quiz-retry-btn` |
| **Readiness Tracker** | `section#checklist` | `#checklist-form`, `.checklist-item input`, `#readiness-progress-bar`, `#completion-modal` |

---

## 3. JavaScript Subsystems & Variable Registry (`js/app.js`)

### 3.1 Core Utilities & State Proxies
- `safeStorage`: Resilient wrapper providing `.getItem(key)`, `.setItem(key, val)`, and `.removeItem(key)` with in-memory fallback.
- `initThemeToggle()`: Manages dark/light theme toggle, binds click events, and syncs with `safeStorage.getItem('mint_theme')`.
- `initWindowControls()`: Attaches event listeners to mock desktop window buttons (`.btn-min`, `.btn-max`, `.btn-close`) across all modules.

### 3.2 Key Data Dictionaries
- **`COMMANDS`** (Terminal REPL): Dictionary mapping command strings (`pwd`, `ls`, `uname -a`, `free -h`, `cat welcome_notes.txt`, `neofetch`, etc.) to HTML response strings.
- **`THUNAR_DIRS`** (VFS): Object mapping absolute simulated path strings (e.g. `'/home/newcomer'`, `'/home/newcomer/Documents'`) to arrays of file/directory objects (`{ name, type, icon, size }`).
- **`APPS`** (Software Manager): Array of software package objects (`{ id, name, cat, icon, desc, rating, size, type, installed }`).
- **`WHISKER_APPS`** (Menu Launcher): Array of launcher items (`{ name, cat, icon, desc }`).
- **`QUIZ_DATA`** (Knowledge Checks): Object mapping quiz IDs (`quiz-1` through `quiz-5`) to `{ answer: 'a'|'b'|'c', feedback: '...' }`.

---

## 4. Step-by-Step Extension Recipes

### Recipe 1: Adding a New Terminal Command
To register a new command in the Demystified Terminal simulator:
1. Locate `const COMMANDS = { ... }` in `js/app.js`.
2. Insert a new entry with the sanitized lowercase command as the key:
   ```javascript
   'whoami': {
     output: 'newcomer<br><span style="color: #94a3b8;">💡 Plain English: "whoami" displays your active username. In Linux, you are currently logged in as "newcomer"!</span>'
   },
   ```
3. If this command corresponds to a Windows equivalent, add an alias mapping:
   ```javascript
   // In handleTerminalSubmit(input):
   // Aliases map automatically if key exists in COMMANDS
   ```
4. Optionally add a quick-run chip button in `index.html` under `#terminal-quick-cmds`:
   ```html
   <button class="quick-cmd-btn" data-cmd="whoami">whoami</button>
   ```

### Recipe 2: Adding a Directory or File in Thunar
To create a new navigable folder or previewable file:
1. Open `js/app.js` and locate `const THUNAR_DIRS`.
2. Add the item to its parent directory's array:
   ```javascript
   '/home/newcomer/Documents': [
     // ... existing items
     { name: 'cheatsheet.pdf', type: 'file', icon: '📕', size: '150 KB' }
   ]
   ```
3. If it is a directory, declare its internal contents under a new dictionary key:
   ```javascript
   '/home/newcomer/Documents/Cheatsheets': [
     { name: 'shortcuts.txt', type: 'file', icon: '📄', size: '2 KB' }
   ]
   ```
4. Ensure no references to music or music platforms are included anywhere in path names, app descriptors, or filenames.

### Recipe 3: Adding an Application to the Software Manager
1. In `js/app.js`, locate `const APPS = [ ... ]`.
2. Append the new application descriptor:
   ```javascript
   {
     id: 'inkscape',
     name: 'Inkscape Vector Graphics',
     cat: 'graphics',
     icon: '🎨',
     desc: 'Professional vector graphics editor for illustrations and design.',
     rating: '4.8 ★★★★★',
     size: '85 MB',
     type: 'System Package',
     installed: false
   }
   ```
3. The UI will automatically render the card, categorize it, enable search indexing, and attach install/uninstall lifecycle listeners.

---

## 5. Verification & Testing Matrix for AI Agents

Whenever making changes, an AI agent must perform the following self-checks:

| Check | Expected Result | Action if Failed |
| :--- | :--- | :--- |
| **Syntax Validation** | Zero parse errors, balanced brackets, escaped strings | Inspect template literals for raw backticks (`` ` ``) |
| **Music Reference Audit** | 0 occurrences of "music" or music platforms project-wide | Grep for `music`, `spotify`, etc. and purge project-wide |
| **Storage Fault Test** | Mocking `localStorage = null` does not crash app | Ensure `safeStorage` fallback dictionary is active |
| **Theme Switching** | Toggling theme sets `data-theme` attribute on `<html>` | Verify `initThemeToggle()` listener binding |
| **Terminal Output** | Executing commands appends HTML and scrolls to bottom | Verify `#terminal-output` container and `.scrollTop` |
| **Thunar Breadcrumbs** | Clicking breadcrumbs navigates to parent directories | Verify `renderBreadcrumbs()` click handler |
| **Quiz Retries** | Clicking "Try Again" clears selections and error banner | Verify `initQuizzes()` reset logic |
| **Readiness Percentage** | Checking boxes increments progress from 0% to 100% | Verify `updateReadinessProgress()` computation |

---

## 6. Coding Conventions & Best Practices

- **JavaScript Style**: Modern ES6+ syntax (`const`, `let`, arrow functions where appropriate, functional array methods). Maintain clean IIFE or modular function scoping.
- **DOM Manipulation**: Use `querySelector` and `querySelectorAll`. Always check for element existence before attaching event listeners.
- **CSS Architecture**: Use existing CSS custom properties (`--mint-primary`, `--bg-surface`, `--text-main`). Never hardcode hex color codes directly into inline styles or new CSS rules unless defining new theme tokens.
- **HTML Accessibility**: Preserve semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), form label associations, and meaningful `aria-label` attributes on icon-only buttons.

