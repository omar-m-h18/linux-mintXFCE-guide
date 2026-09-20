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
│   └── style.css         # Mint-Y CSS variables, layout grids, components (~1465 lines)
├── js/
│   └── app.js            # Taste-station simulators, theme, preview modal (~1310 lines)
├── knowledge.md          # Domain knowledge base & Lovable project brief
├── TECHNICAL_REPORT.md   # Architectural whitepaper & subsystem state machines
├── AGENTS.md             # This agent operation manual
└── README.md             # Human-facing project overview
```

### 2.1 Key DOM Anchors in `index.html`
| Section / Component | Container ID / Class | Key Sub-Elements |
| :--- | :--- | :--- |
| **Sticky Navigation** | `header.top-nav` | `.brand`, `.nav-links`, `#theme-toggle-btn` |
| **Hero** | `section.hero` | `h2`, `.hero-cta` (`a[href="#taste"]`) |
| **The Deal** | `section#the-deal` | `.deal-lede`, `.deal-list` |
| **Taste Stations** | `main#taste` | `article#module-1` … `article#module-5`, `.taste-takeaway` |
| **Timeshift Taste** | `#window-timeshift` | `#timeshift-status`, `#btn-take-snapshot`, `#btn-simulate-break`, `#btn-restore-snapshot` |
| **Whisker Taste** | `#window-whisker` | `#whisker-search`, `#whisker-apps-container`, `#whisker-menu-trigger`, `.xfce-mock-panel` |
| **Software Taste** | `#window-software` | `#software-search`, `#software-category-filter`, `#software-grid` |
| **Thunar Taste** | `#window-thunar` | `#thunar-sidebar-items`, `#thunar-breadcrumbs`, `#thunar-files`, `#thunar-file-info` |
| **Terminal Taste** | `#window-terminal` | `#terminal-screen`, `#terminal-input`, `#term-run-btn`, `#terminal-command-chips` |
| **Decide** | `section#decide` | `.decide-card`, `.decide-actions` |
| **Preview Modal** | `#mock-preview-modal` | `#mock-modal-title`, `#mock-modal-body`, `#mock-modal-close-btn` |

---

## 3. JavaScript Subsystems & Variable Registry (`js/app.js`)

### 3.1 Core Utilities & State Proxies
- `safeStorage`: Resilient wrapper providing `.getItem(key)`, `.setItem(key, val)`, and `.removeItem(key)` with in-memory fallback.
- `initTheme()`: Manages dark/light theme toggle (calls `applyTheme()`), binds click events on `#theme-toggle-btn`, and syncs with `safeStorage` keys `mint_theme` and `mint_guide_theme`.
- `initWindowControls()`: Attaches event listeners to mock desktop window buttons (`.xfce-btn-min`, `.xfce-btn-max`, `.xfce-btn-close`) across all modules.

### 3.2 Key Data Dictionaries
- **`COMMANDS`** (Terminal REPL): Dictionary mapping command strings (`pwd`, `ls`, `uname -a`, `free -h`, `cat welcome_notes.txt`, `neofetch`, etc.) to HTML response strings.
- **`THUNAR_DIRS`** (VFS): Object mapping absolute simulated path strings (e.g. `'/home/newcomer'`, `'/home/newcomer/Documents'`) to arrays of file/directory objects (`{ name, type, icon, size }`).
- **`SOFTWARE_CATALOG`** (Software Manager): Array of software package objects (`{ id, name, cat, icon, desc, rating, size, type, installed }`).
- **`WHISKER_APPS`** (Menu Launcher): Array of launcher items (`{ name, cat, icon, desc }`).
- There is intentionally **no persisted quiz, checklist, level, or progress state** anywhere in the codebase. Do not reintroduce `QUIZ_DATA`, `TRACKED_TASKS`, `LEVELS`, `markProgress`, or `updateProgressUI` without explicit user approval.
- **Session-only gamification exception (approved 2026)**: A cosmetic streak counter + achievement badges (`gamiEarnBadge`, `gamiInit`, `gamiBurstConfetti`) light up five station badges and a progress ring in memory only. It is **never persisted** (no new `safeStorage` keys), **never gates or disables any station**, and resets on every page load. Do not extend it to per-user storage, toasts, or locked content without explicit user approval.

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
4. Optionally add a quick-run chip button in `index.html` under `#terminal-command-chips`:
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
1. In `js/app.js`, locate `const SOFTWARE_CATALOG = [ ... ]`.
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

### Recipe 4: Adding a Taste Station
New stations are rare — the page is fixed at five tastes plus the decision card.
1. Copy an existing `article.module-card` block in `index.html` (keep the `id="module-N"` sequence unbroken) with one context paragraph (`.module-intro`), the interactive demo, and one takeaway (`.status-alert.success.taste-takeaway`).
2. Wire the demo with a new `initXSimulator()` in `js/app.js`, registered in `bootstrap()`, with existence guards on every `getElementById`.
3. Never add quizzes, locks, progress tracking, or gating — all stations are always interactive.
4. Gamification is additive and cosmetic only: badge-earning calls (`gamiEarnBadge`) and the confetti burst must never disable buttons, gate content, or touch `safeStorage`. Badges re-pop on repeat triggers but the streak only increments once per module per page load.

---

## 5. Verification & Testing Matrix for AI Agents

Whenever making changes, an AI agent must perform the following self-checks:

| Check | Expected Result | Action if Failed |
| :--- | :--- | :--- |
| **Syntax Validation** | Zero parse errors, balanced brackets, escaped strings | Inspect template literals for raw backticks (`` ` ``) |
| **Music Reference Audit** | 0 occurrences of "music" or music platforms project-wide | Grep for `music`, `spotify`, etc. and purge project-wide |
| **Storage Fault Test** | Mocking `localStorage = null` does not crash app | Ensure `safeStorage` fallback dictionary is active |
| **Theme Switching** | Toggling theme sets `data-theme` attribute on `<html>` | Verify `initTheme()` listener binding |
| **Station Interactivity** | All five taste stations respond on load with no gating | Confirm no lock overlays, disabled states, or level checks block input |
| **Terminal Output** | Executing commands appends HTML and scrolls to bottom | Verify `#terminal-screen` container and `.scrollTop` |
| **Thunar Breadcrumbs** | Clicking breadcrumbs navigates to parent directories | Verify breadcrumb click handler in `initThunarSimulator()` |
| **Preview Modal** | Opening a file/app preview traps Tab focus; Escape closes; focus returns to trigger | Verify `trapTab`, `focusDialog`, `restoreFocus` wiring in `initMockModal()` |
| **Anchor Navigation** | Nav links and hero CTA smooth-scroll to `#the-deal`, `#taste`, `#decide` | Verify target IDs exist and are unique |
| **No Dead References** | No JS references to removed quiz/level/checklist/translator IDs | Grep for `quiz-`, `check-`, `level-`, `completion-modal`, `updateProgressUI` → zero hits |

---

## 6. Coding Conventions & Best Practices

- **JavaScript Style**: Modern ES6+ syntax (`const`, `let`, arrow functions where appropriate, functional array methods). Maintain clean IIFE or modular function scoping.
- **DOM Manipulation**: Use `querySelector` and `querySelectorAll`. Always check for element existence before attaching event listeners.
- **CSS Architecture**: Use existing CSS custom properties (`--mint-primary`, `--bg-surface`, `--text-main`). Never hardcode hex color codes directly into inline styles or new CSS rules unless defining new theme tokens.
- **HTML Accessibility**: Preserve semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), form label associations, and meaningful `aria-label` attributes on icon-only buttons.

