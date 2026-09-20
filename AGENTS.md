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
│   └── style.css         # Mint-Y CSS variables, layout grids, components (~1950 lines)
├── js/
│   └── app.js            # Taste-station simulators, theme, guided focus, preview modal (~1700 lines)
├── knowledge.md          # Domain knowledge base & Lovable project brief
├── TECHNICAL_REPORT.md   # Architectural whitepaper & subsystem state machines
├── AGENTS.md             # This agent operation manual
└── README.md             # Human-facing project overview
```

### 2.1 Key DOM Anchors in `index.html`
| Section / Component | Container ID / Class | Key Sub-Elements |
| :--- | :--- | :--- |
| **Sticky Navigation** | `header.top-nav` | `.brand`, `.nav-links`, `#theme-toggle-btn`, `#guide-toggle` |
| **Hero** | `section.hero` | `h2`, `.hero-cta` (`a[href="#taste"]`) |
| **The Deal** | `section#the-deal` | `.deal-lede`, `.deal-list` |
| **Stage Track** | `section.gami-strip` | `#gami-ring`, `.stage-track`, `.stage-chip[data-stage]`, `#stage-goal-line`, `#guide-start-btn`, `#guide-exit-btn`, `#stage-complete` |
| **Taste Stations** | `main#taste` | `article#module-1` … `article#module-5`, `.stage-goal`, `.taste-takeaway` |
| **Timeshift Taste** | `#window-timeshift` | `#timeshift-status`, `#btn-take-snapshot`, `#btn-simulate-break`, `#btn-restore-snapshot` |
| **Whisker Taste** | `#window-whisker` | `#whisker-search`, `#whisker-apps-container`, `#whisker-menu-trigger`, `.xfce-mock-panel` |
| **Software Taste** | `#window-software` | `#software-search`, `#software-category-filter`, `#software-grid` |
| **Thunar Taste** | `#window-thunar` | `#thunar-sidebar-items`, `#thunar-breadcrumbs`, `#thunar-files`, `#thunar-file-info` |
| **Terminal Taste** | `#window-terminal` | `#terminal-screen`, `#terminal-input`, `#term-run-btn`, `#terminal-command-chips` |
| **Decide** | `section#decide` | `.decide-card`, `.decide-actions` |
| **Preview Modal** | `#mock-preview-modal` | `#mock-modal-title`, `#mock-modal-body`, `#mock-modal-close-btn` |
| **Guide Drawer** | `#guide-drawer` | `#guide-drawer-title`, `#guide-drawer-body`, `#guide-drawer-close`, `#guide-drawer-scrim` |
| **Coach Layer** | `#coach-layer` | `#coach-hole`, `#coach-bubble`, `#coach-stage-num`, `#coach-bubble-title`, `#coach-bubble-hint`, `#coach-bubble-steps`, `#coach-next-btn`, `#coach-skip-btn`, `#coach-exit-btn` |

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
- **Guided focus exception (approved 2026)**: A session-only guided layer (`initGuide`, `guideState`, `GUIDE_STAGES`, `guideSpotlight`, `guideCompleteStage`) walks the visitor one goal at a time with a spotlight coach-mark, a Guide drawer, and a Stage Track. It is a **lens, not a gate**: every station stays interactive, "Free explore" exits the spotlight at any time, and the track allows jumping to any stage. State is in-memory only (`guideState`), **never** persisted (no `safeStorage` keys), and resets on reload. Do not add locks, prerequisites, `LEVELS`-style progression, or stored progress without explicit user approval.

### 3.3 Guided Focus Subsystem (`initGuide`)
- `guideState`: in-memory `{ current, mode, stepIndex, completed }` — never persisted.
- `GUIDE_STAGES`: map `1..5` → `{ moduleId, label, goal, what, why, help, steps:[{ selector, hint }] }`.
- Functions: `initGuide()`, `guideStart()`, `guideGoTo(n)`, `guideNext()`, `guideCompleteStage(moduleId)`, `guideExit()`, `guideSpotlight()`, `guideRenderTrack()`, `openGuideDrawer()`, `closeGuideDrawer()`.
- `guideCompleteStage(moduleId)` is invoked from `gamiEarnBadge()` so the five existing success paths stay the single source of truth for completion.
- DOM: `#stage-track`/`.stage-track`, `.stage-chip[data-stage]`, `#stage-goal-line`, `#stage-complete`, `#guide-drawer`, `#guide-toggle`, `#coach-layer`, `#coach-hole`, `#coach-bubble`, `.stage-goal`.
- Reuses a11y helpers `getFocusable`, `trapTab`, `restoreFocus`; respects `prefers-reduced-motion`.
- Focus mode dims non-current content visually (`.is-guide-dimmed`) but **never** sets `disabled`, `inert`, or blocks pointer events.

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

### Recipe 5: Adding a Guided Stage
1. Add the stage to `GUIDE_STAGES` in `js/app.js`, keyed by its number `1..5`, with `moduleId` matching `article#module-N`.
2. Point `steps[].selector` at stable selectors (prefer existing IDs such as `#btn-take-snapshot`).
3. Add the `.stage-goal` block in the matching `article#module-N` and a `.stage-chip[data-stage="N"]` in the Stage Track.
4. Ensure the stage's success path calls `gamiEarnBadge('module-N')`; guide completion hooks in automatically.
5. Never gate: no disabled states, prerequisites, or overlays that block other stages.

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
| **Guide Start** | "Start guided tour" spotlights the stage-1 target; Esc / Free explore exits | Verify `guideStart()`, `guideExit()`, `#coach-layer` |
| **Guide Goal Advance** | Each of the 5 goals calls `guideCompleteStage` and advances the track | Verify `gamiEarnBadge` → `guideCompleteStage` wiring |
| **Guide Non-Gating** | All stations interactive while guided; no locks | Confirm no `disabled`, input-blocking overlays, or prerequisites |
| **Guide Storage** | Zero new `safeStorage` keys for guide/stage state | Grep `safeStorage`; guide state must be in-memory |
| **Guide Keyboard** | Tab/Enter/Space/Esc operate coach-marks and drawer | Verify focus trap + Esc handlers |

---

## 6. Coding Conventions & Best Practices

- **JavaScript Style**: Modern ES6+ syntax (`const`, `let`, arrow functions where appropriate, functional array methods). Maintain clean IIFE or modular function scoping.
- **DOM Manipulation**: Use `querySelector` and `querySelectorAll`. Always check for element existence before attaching event listeners.
- **CSS Architecture**: Use existing CSS custom properties (`--mint-primary`, `--bg-surface`, `--text-main`). Never hardcode hex color codes directly into inline styles or new CSS rules unless defining new theme tokens.
- **HTML Accessibility**: Preserve semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), form label associations, and meaningful `aria-label` attributes on icon-only buttons.
- **Guided Focus Naming**: Prefix guided-layer functions with `guide` (e.g. `guideSpotlight`, `guideRenderTrack`). Reuse the per-station badge tokens `--badge-m1..5` and the academic tokens `--academic-*` rather than hardcoding new colors.

