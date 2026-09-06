/**
 * Linux Mint XFCE Newcomer Guide & Interactive Simulators
 * Pure Vanilla JavaScript - Lightweight, Zero Dependencies, 100% Robust
 */

(function () {
  'use strict';

  // --- 0. IDEMPOTENT EXECUTION GUARD ---
  if (typeof window !== 'undefined') {
    if (window.__MINT_APP_INITIALIZED__) {
      return;
    }
    window.__MINT_APP_INITIALIZED__ = true;
  }

  // --- 1. RESILIENT STORAGE LAYER ---
  const STORAGE_KEY_THEME = 'mint_theme';
  const STORAGE_KEY_THEME_LEGACY = 'mint_guide_theme';
  const STORAGE_KEY_PROGRESS = 'mint_guide_progress_v2';
  const STORAGE_KEY_QUIZ = 'mint_quiz_progress';
  const STORAGE_KEY_CHECKLIST = 'mint_checklist_progress';
  const STORAGE_KEY_APPS = 'mint_installed_apps';

  const safeStorage = {
    _memory: {},
    getItem: function (key) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const val = window.localStorage.getItem(key);
          if (val !== null) return val;
        }
      } catch (e) {
        // Fallback to in-memory store
      }
      return Object.prototype.hasOwnProperty.call(this._memory, key) ? this._memory[key] : null;
    },
    setItem: function (key, val) {
      const strVal = String(val);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, strVal);
        }
      } catch (e) {
        // Fallback to in-memory store
      }
      this._memory[key] = strVal;
    },
    removeItem: function (key) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        // Fallback to in-memory store
      }
      delete this._memory[key];
    }
  };

  // --- APP STATE ---
  let initialProgress = {};
  try {
    const raw = safeStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) initialProgress = JSON.parse(raw);
  } catch (e) {
    initialProgress = {};
  }

  // Sync with mint_checklist_progress and mint_quiz_progress
  try {
    const rawChecklist = safeStorage.getItem(STORAGE_KEY_CHECKLIST);
    if (rawChecklist) {
      const parsedChecklist = JSON.parse(rawChecklist);
      if (Array.isArray(parsedChecklist)) {
        parsedChecklist.forEach(function (t) { initialProgress[t] = true; });
      }
    }
    const rawQuiz = safeStorage.getItem(STORAGE_KEY_QUIZ);
    if (rawQuiz) {
      const parsedQuiz = JSON.parse(rawQuiz);
      Object.keys(parsedQuiz).forEach(function (q) {
        if (parsedQuiz[q]) initialProgress[q] = true;
      });
    }
  } catch (e) {
    // Ignore parse errors
  }

  // Initial installed apps
  let initialApps = ['Firefox Web Browser'];
  try {
    const rawApps = safeStorage.getItem(STORAGE_KEY_APPS);
    if (rawApps) {
      const parsedApps = JSON.parse(rawApps);
      if (Array.isArray(parsedApps) && parsedApps.length > 0) {
        initialApps = parsedApps;
      }
    }
  } catch (e) {
    initialApps = ['Firefox Web Browser'];
  }

  // Initial theme detection: storage first, then prefers-color-scheme
  let initialTheme = safeStorage.getItem(STORAGE_KEY_THEME) || safeStorage.getItem(STORAGE_KEY_THEME_LEGACY);
  if (!initialTheme && typeof window !== 'undefined' && window.matchMedia) {
    initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (!initialTheme) initialTheme = 'light';

  const appState = {
    theme: initialTheme,
    progress: initialProgress,
    timeshiftStep: 1,
    thunarCurrentPath: '/home/newcomer',
    installedApps: new Set(initialApps),
    terminalHistory: [],
    celebrationShown: false
  };

  // --- 2. THEME CONTROLLER ---
  function applyTheme(theme) {
    appState.theme = theme;
    const isDark = theme === 'dark';

    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
      document.body.classList.toggle('dark', isDark);
      document.body.classList.toggle('light', !isDark);
    }
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);

    safeStorage.setItem(STORAGE_KEY_THEME, theme);
    safeStorage.setItem(STORAGE_KEY_THEME_LEGACY, theme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      if (isDark) {
        themeBtn.innerHTML = '☀️ Light Mode';
        themeBtn.setAttribute('title', 'Switch to Mint Light Mode');
      } else {
        themeBtn.innerHTML = '🌙 Dark Mode';
        themeBtn.setAttribute('title', 'Switch to Mint Dark Mode');
      }
    }
  }

  function initTheme() {
    applyTheme(appState.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = function (e) {
        e.preventDefault();
        const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      };
    }
  }

  // --- 3. REUSABLE MODAL PREVIEW & COMPLETION MODAL ---
  function openMockModal(title, icon, contentHtml) {
    const modal = document.getElementById('mock-preview-modal');
    const titleEl = document.getElementById('mock-modal-title');
    const bodyEl = document.getElementById('mock-modal-body');

    if (!modal || !titleEl || !bodyEl) return;

    titleEl.innerHTML = '<span class="xfce-title-icon">' + icon + '</span> <span>' + title + '</span>';
    bodyEl.innerHTML = contentHtml;
    modal.style.display = 'flex';

    // Auto-bind close buttons inside modal
    const closeButtons = bodyEl.querySelectorAll('.modal-dismiss-btn');
    closeButtons.forEach(function (btn) {
      btn.onclick = closeMockModal;
    });
  }

  function closeMockModal() {
    const modal = document.getElementById('mock-preview-modal');
    if (modal) modal.style.display = 'none';
  }

  function openCompletionModal() {
    const modal = document.getElementById('completion-modal');
    if (modal) {
      modal.style.display = 'flex';
      const dismissBtn = document.getElementById('completion-modal-dismiss-btn');
      if (dismissBtn) dismissBtn.onclick = closeCompletionModal;
      const closeBtn = document.getElementById('completion-modal-close-btn');
      if (closeBtn) closeBtn.onclick = closeCompletionModal;
    }
  }

  function closeCompletionModal() {
    const modal = document.getElementById('completion-modal');
    if (modal) modal.style.display = 'none';
  }

  function initMockModal() {
    const closeBtn = document.getElementById('mock-modal-close-btn');
    const modal = document.getElementById('mock-preview-modal');
    const compModal = document.getElementById('completion-modal');
    const compCloseBtn = document.getElementById('completion-modal-close-btn');
    const compDismissBtn = document.getElementById('completion-modal-dismiss-btn');

    if (closeBtn) closeBtn.onclick = closeMockModal;
    if (compCloseBtn) compCloseBtn.onclick = closeCompletionModal;
    if (compDismissBtn) compDismissBtn.onclick = closeCompletionModal;

    if (modal) {
      modal.onclick = function (e) {
        if (e.target === modal) closeMockModal();
      };
    }

    if (compModal) {
      compModal.onclick = function (e) {
        if (e.target === compModal) closeCompletionModal();
      };
    }

    // Escape key closes modals
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMockModal();
        closeCompletionModal();
      }
    });
  }

  // --- 4. XFCE WINDOW CHROME CONTROLS ---
  function initWindowControls() {
    const windows = document.querySelectorAll('.xfce-window, .terminal-window');
    windows.forEach(function (win) {
      const minBtn = win.querySelector('.xfce-btn-min');
      const maxBtn = win.querySelector('.xfce-btn-max');
      const closeBtn = win.querySelector('.xfce-btn-close');
      const closedBanner = win.querySelector('.xfce-closed-banner');
      const reopenBtn = closedBanner ? closedBanner.querySelector('button') : null;

      if (minBtn) {
        minBtn.onclick = function (e) {
          e.preventDefault();
          win.classList.toggle('is-collapsed');
        };
      }

      if (maxBtn) {
        maxBtn.onclick = function (e) {
          e.preventDefault();
          win.classList.toggle('is-maximized');
        };
      }

      if (closeBtn) {
        closeBtn.onclick = function (e) {
          e.preventDefault();
          win.classList.add('is-collapsed');
          if (closedBanner) closedBanner.style.display = 'block';
        };
      }

      if (reopenBtn) {
        reopenBtn.onclick = function (e) {
          e.preventDefault();
          win.classList.remove('is-collapsed');
          if (closedBanner) closedBanner.style.display = 'none';
        };
      }
    });
  }

  // --- 5. WINDOWS TO MINT TRANSLATOR ---
  const TRANSLATIONS = [
    {
      win: '.exe installers (from random websites)',
      mint: 'Software Manager & Flatpak',
      desc: 'In Linux Mint, you install apps from the curated Software Manager with 1-click. No sketchy download sites, adware, or malware installers needed!',
      tags: ['exe', 'installer', 'install', 'download', 'program', 'setup']
    },
    {
      win: 'C:\\ Drive and Program Files',
      mint: 'Home Directory (/home/username/)',
      desc: 'No drive letters like C: or D:. All personal files live safely in your Home folder. Applications are managed cleanly by the operating system.',
      tags: ['c drive', 'c:', 'disk', 'program files', 'hard drive', 'storage', 'd:']
    },
    {
      win: 'Windows Start Menu',
      mint: 'Whisker Menu',
      desc: 'The bottom-left button opens the Whisker Menu. Instant search, customizable categories, and favorite pins just like you are used to.',
      tags: ['start menu', 'start', 'whisker', 'search', 'taskbar', 'windows button']
    },
    {
      win: 'Control Panel / Windows Settings',
      mint: 'XFCE Settings Manager',
      desc: 'A unified single window containing all display, audio, mouse, keyboard, and appearance settings. Simple with zero confusing nested menus.',
      tags: ['control panel', 'settings', 'config', 'options', 'personalize', 'preferences']
    },
    {
      win: 'Windows Update (Forced Reboots)',
      mint: 'Update Manager (Shield Icon)',
      desc: 'Mint never forces a restart during your work. Updates only apply when you click, and you can keep working uninterrupted.',
      tags: ['windows update', 'update', 'reboot', 'restart', 'patch']
    },
    {
      win: 'Task Manager (Ctrl+Shift+Esc)',
      mint: 'Task Manager / System Monitor',
      desc: 'Shows live CPU, RAM memory usage, and running processes with 1-click process termination. Searchable and lightweight.',
      tags: ['task manager', 'taskmgr', 'processes', 'cpu', 'ram', 'memory', 'kill']
    },
    {
      win: 'Microsoft Office (Word, Excel, PPT)',
      mint: 'LibreOffice Suite (Writer, Calc, Impress)',
      desc: 'Pre-installed for free in Linux Mint. Completely compatible with .docx, .xlsx, and .pptx files without recurring subscriptions or serial keys.',
      tags: ['word', 'excel', 'powerpoint', 'office', 'libreoffice', 'doc', 'docs', 'sheet']
    },
    {
      win: 'Windows File Explorer',
      mint: 'Thunar File Manager',
      desc: 'The fast, lightweight XFCE file manager. Supports tabbed browsing, custom folder colors, and instant USB flash drive detection.',
      tags: ['explorer', 'files', 'folders', 'my computer', 'thunar', 'directory']
    },
    {
      win: 'Adobe Photoshop',
      mint: 'GIMP or Photopea',
      desc: 'GIMP provides professional image manipulation and layer editing, while Photopea runs in any browser with familiar Photoshop shortcuts.',
      tags: ['photoshop', 'photo', 'edit image', 'gimp', 'graphics', 'adobe']
    },
    {
      win: 'Notepad',
      mint: 'Xed Text Editor / Mousepad',
      desc: 'Clean, tabbed plain-text editor with syntax highlighting, search & replace, and dark mode support.',
      tags: ['notepad', 'text editor', 'txt', 'mousepad', 'xed']
    },
    {
      win: 'Command Prompt (CMD) / PowerShell',
      mint: 'XFCE Terminal',
      desc: 'The command line interface. Optional for daily driving, but powerful and friendly once you see how predictable it is.',
      tags: ['cmd', 'powershell', 'terminal', 'command prompt', 'cli', 'bash']
    },
    {
      win: 'System Restore / Antivirus',
      mint: 'Timeshift Snapshots',
      desc: 'Timeshift automatically takes system snapshots. If any tweak goes wrong, roll back your system in 1-click while your personal documents stay untouched.',
      tags: ['antivirus', 'system restore', 'backup', 'timeshift', 'virus', 'security']
    },
    {
      win: 'PC Gaming & Steam',
      mint: 'Steam + Valve Proton',
      desc: 'Install Steam directly from the Software Manager. Valve Proton enables thousands of Windows games to run automatically with 1-click.',
      tags: ['gaming', 'games', 'steam', 'play', 'proton']
    }
  ];

  function initTranslator() {
    const input = document.getElementById('translator-search');
    const resultBox = document.getElementById('translator-result');
    const quickTagContainer = document.getElementById('quick-tags');

    if (!input || !resultBox || !quickTagContainer) return;

    function renderResult(item) {
      resultBox.innerHTML =
        '<div class="trans-col">' +
        '  <h4>In Windows</h4>' +
        '  <div class="trans-item">' + item.win + '</div>' +
        '  <div class="trans-desc">What you are accustomed to on Windows machines.</div>' +
        '</div>' +
        '<div class="trans-col">' +
        '  <h4>In Linux Mint XFCE</h4>' +
        '  <div class="trans-item" style="color: var(--mint-primary);">' + item.mint + '</div>' +
        '  <div class="trans-desc">' + item.desc + '</div>' +
        '</div>';
    }

    function search(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        renderResult(TRANSLATIONS[0]);
        return;
      }

      const match = TRANSLATIONS.find(function (t) {
        return (
          t.win.toLowerCase().indexOf(q) !== -1 ||
          t.mint.toLowerCase().indexOf(q) !== -1 ||
          t.tags.some(function (tag) { return tag.indexOf(q) !== -1; })
        );
      });

      if (match) {
        renderResult(match);
      } else {
        resultBox.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 1rem;">' +
          '  <div style="font-weight: 600; margin-bottom: 0.35rem;">No direct match found for "' + query + '"</div>' +
          '  <div class="trans-desc">Try clicking one of the popular suggestions below like "exe", "Start Menu", "Office", or "C: Drive"!</div>' +
          '</div>';
      }
    }

    input.oninput = function (e) {
      search(e.target.value);
    };

    const popularTags = ['exe', 'Start Menu', 'C: Drive', 'Control Panel', 'Office', 'Task Manager', 'Windows Update', 'Antivirus', 'Steam'];
    quickTagContainer.innerHTML = popularTags.map(function (tag) {
      return '<button type="button" class="quick-tag-btn" data-query="' + tag + '">' + tag + '</button>';
    }).join('');

    quickTagContainer.onclick = function (e) {
      const btn = e.target.closest('.quick-tag-btn');
      if (btn) {
        const q = btn.getAttribute('data-query');
        input.value = q;
        search(q);
      }
    };

    renderResult(TRANSLATIONS[0]);
  }

  // --- 6. MODULE 1: TIMESHIFT & SAFETY NET ---
  function initTimeshiftSimulator() {
    const btnSnapshot = document.getElementById('btn-take-snapshot');
    const btnBreak = document.getElementById('btn-simulate-break');
    const btnRestore = document.getElementById('btn-restore-snapshot');
    const statusBox = document.getElementById('timeshift-status');
    const step1 = document.getElementById('step-snapshot-1');
    const step2 = document.getElementById('step-snapshot-2');

    if (!btnSnapshot || !btnBreak || !btnRestore || !statusBox) return;

    btnSnapshot.onclick = function () {
      btnSnapshot.disabled = true;
      btnSnapshot.innerHTML = '⏳ Creating Snapshot...';
      statusBox.className = 'status-alert info';
      statusBox.innerHTML = '📸 <strong>Capturing RSYNC Snapshot:</strong> Scanning system files (/etc, /usr, /bin)...';

      setTimeout(function () {
        appState.timeshiftStep = 1;
        if (step1) step1.className = 'timeline-step active';
        if (step2) step2.className = 'timeline-step';
        statusBox.className = 'status-alert success';
        statusBox.innerHTML = '🛡️ <strong>Safety Snapshot Saved:</strong> Clean snapshot captured. Your system files and settings are safely preserved!';
        btnSnapshot.disabled = false;
        btnSnapshot.innerHTML = '📸 Create Snapshot';
        markProgress('task-snapshot');
      }, 700);
    };

    btnBreak.onclick = function () {
      appState.timeshiftStep = 2;
      if (step1) step1.className = 'timeline-step';
      if (step2) step2.className = 'timeline-step compromised';
      statusBox.className = 'status-alert warning';
      statusBox.innerHTML = '⚠️ <strong>Simulated Mistake:</strong> You installed an incompatible graphics theme and the panel looks broken. Don\'t panic! Click "Restore Snapshot" below to roll back.';
    };

    btnRestore.onclick = function () {
      btnRestore.disabled = true;
      btnRestore.innerHTML = '⏳ Restoring System...';
      statusBox.className = 'status-alert info';
      statusBox.innerHTML = '↺ <strong>Timeshift Rollback:</strong> Replacing altered system files with pristine snapshot...';

      setTimeout(function () {
        appState.timeshiftStep = 1;
        if (step1) step1.className = 'timeline-step active';
        if (step2) step2.className = 'timeline-step';
        statusBox.className = 'status-alert success';
        statusBox.innerHTML = '✨ <strong>System Restored in 5 Seconds:</strong> Everything is back to normal! Notice how Timeshift gives you complete peace of mind to explore.';
        btnRestore.disabled = false;
        btnRestore.innerHTML = '↺ Restore Snapshot';
        markProgress('task-snapshot');
      }, 700);
    };
  }

  // --- 7. MODULE 2: WHISKER MENU & PANEL LAUNCHERS ---
  const WHISKER_APPS = [
    { name: 'Firefox Web Browser', cat: 'internet', icon: '🌐', desc: 'Browse the World Wide Web safely' },
    { name: 'Thunderbird Mail', cat: 'internet', icon: '✉️', desc: 'Send and receive emails and manage calendar' },
    { name: 'LibreOffice Writer', cat: 'office', icon: '📝', desc: 'Create and edit documents and letters (Word alternative)' },
    { name: 'LibreOffice Calc', cat: 'office', icon: '📊', desc: 'Perform calculations and spreadsheets (Excel alternative)' },
    { name: 'VLC Media Player', cat: 'multimedia', icon: '🎬', desc: 'Play movies, videos, and multimedia streams' },
    { name: 'Kdenlive Video Editor', cat: 'multimedia', icon: '🎞️', desc: 'Powerful multi-track video editing and rendering' },
    { name: 'Thunar File Manager', cat: 'system', icon: '📁', desc: 'Manage files, folders, and USB drives' },
    { name: 'Software Manager', cat: 'system', icon: '📦', desc: 'Install and remove applications safely' },
    { name: 'Update Manager', cat: 'system', icon: '🛡️', desc: 'Manage system and security updates' },
    { name: 'XFCE Terminal', cat: 'system', icon: '💻', desc: 'Optional command-line interface' },
    { name: 'Calculator', cat: 'accessories', icon: '🧮', desc: 'Perform arithmetic and scientific calculations' },
    { name: 'Screenshot Tool', cat: 'accessories', icon: '📸', desc: 'Take screenshots of whole screen or window' },
    { name: 'Text Editor (Xed)', cat: 'accessories', icon: '📄', desc: 'Clean, tabbed plain text document editor' }
  ];

  function initWhiskerSimulator() {
    const catButtons = document.querySelectorAll('.whisker-cat-btn');
    const searchInput = document.getElementById('whisker-search');
    const appsList = document.getElementById('whisker-apps-container');
    const triggerBtn = document.getElementById('whisker-menu-trigger');
    const whiskerWindow = document.getElementById('whisker-window-body');
    const feedbackToast = document.getElementById('whisker-feedback-toast');

    let currentCat = 'all';

    function renderApps(cat, query) {
      if (!appsList) return;
      const q = (query || '').toLowerCase().trim();
      const filtered = WHISKER_APPS.filter(function (app) {
        const matchesCat =
          cat === 'all' ||
          app.cat === cat ||
          (cat === 'favorites' && ['Firefox Web Browser', 'LibreOffice Writer', 'Thunar File Manager', 'Software Manager'].indexOf(app.name) !== -1);
        const matchesQuery = !q || app.name.toLowerCase().indexOf(q) !== -1 || app.desc.toLowerCase().indexOf(q) !== -1;
        return matchesCat && matchesQuery;
      });

      if (filtered.length === 0) {
        appsList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">No applications found matching "' + query + '".</div>';
        return;
      }

      appsList.innerHTML = filtered.map(function (app) {
        return (
          '<div class="whisker-app-item" data-app="' + app.name + '" data-icon="' + app.icon + '" data-desc="' + app.desc + '">' +
          '  <div class="whisker-app-icon">' + app.icon + '</div>' +
          '  <div class="whisker-app-info">' +
          '    <div class="whisker-app-name">' + app.name + '</div>' +
          '    <div class="whisker-app-desc">' + app.desc + '</div>' +
          '  </div>' +
          '</div>'
        );
      }).join('');
    }

    catButtons.forEach(function (btn) {
      btn.onclick = function () {
        catButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCat = btn.getAttribute('data-cat') || 'all';
        renderApps(currentCat, searchInput ? searchInput.value : '');
      };
    });

    if (searchInput) {
      searchInput.oninput = function (e) {
        renderApps(currentCat, e.target.value);
      };
    }

    if (appsList) {
      appsList.onclick = function (e) {
        const item = e.target.closest('.whisker-app-item');
        if (item) {
          const appName = item.getAttribute('data-app');
          const appIcon = item.getAttribute('data-icon') || '🚀';
          const appDesc = item.getAttribute('data-desc') || '';

          if (feedbackToast) {
            feedbackToast.style.display = 'block';
            feedbackToast.innerHTML = '🚀 <strong>Launched:</strong> "' + appName + '" opened on your desktop!';
            setTimeout(function () {
              feedbackToast.style.display = 'none';
            }, 3000);
          }

          openMockModal(
            appName,
            appIcon,
            '<div style="text-align: center; padding: 1.5rem 0.5rem;">' +
            '  <div style="font-size: 3rem; margin-bottom: 0.75rem;">' + appIcon + '</div>' +
            '  <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">' + appName + ' is Running</h4>' +
            '  <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">' + appDesc + '</p>' +
            '  <div class="status-alert success" style="text-align: left; margin-bottom: 1rem;">' +
            '    ✓ Linux Mint XFCE launches applications instantly with minimal memory usage.' +
            '  </div>' +
            '  <button type="button" class="sim-btn sim-btn-primary modal-dismiss-btn">' +
            '    Close Application' +
            '  </button>' +
            '</div>'
          );

          markProgress('task-whisker');
        }
      };
    }

    if (triggerBtn && whiskerWindow) {
      triggerBtn.onclick = function (e) {
        e.preventDefault();
        const isHidden = window.getComputedStyle(whiskerWindow).display === 'none';
        whiskerWindow.style.display = isHidden ? 'grid' : 'none';
        triggerBtn.style.opacity = isHidden ? '1' : '0.85';
      };
    }

    // Panel launcher buttons
    const btnBrowser = document.getElementById('panel-btn-browser');
    const btnFiles = document.getElementById('panel-btn-files');
    const btnTerminal = document.getElementById('panel-btn-terminal');
    const btnShield = document.getElementById('panel-btn-shield');
    const btnVolume = document.getElementById('panel-btn-volume');
    const btnWifi = document.getElementById('panel-btn-wifi');
    const btnClock = document.getElementById('panel-btn-clock');
    const popupContainer = document.getElementById('panel-popup-content');

    let activePanelPopupType = null;

    function togglePanelPopup(type, contentHtml) {
      if (!popupContainer) return;
      if (popupContainer.style.display === 'block' && activePanelPopupType === type) {
        popupContainer.style.display = 'none';
        activePanelPopupType = null;
      } else {
        activePanelPopupType = type;
        popupContainer.innerHTML = contentHtml;
        popupContainer.style.display = 'block';

        const closeBtn = popupContainer.querySelector('.popup-close-btn');
        if (closeBtn) {
          closeBtn.onclick = function () {
            popupContainer.style.display = 'none';
            activePanelPopupType = null;
          };
        }
      }
    }

    // Close panel popup on outside click
    document.addEventListener('click', function (e) {
      if (popupContainer && popupContainer.style.display === 'block') {
        const isClickInside = popupContainer.contains(e.target) || e.target.closest('.panel-right');
        if (!isClickInside) {
          popupContainer.style.display = 'none';
          activePanelPopupType = null;
        }
      }
    });

    if (btnBrowser) {
      btnBrowser.onclick = function () {
        openMockModal(
          'Firefox Web Browser — Linux Mint Start',
          '🌐',
          '<div style="padding: 1rem 0;">' +
          '  <div style="background: var(--bg-tertiary); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1rem;">' +
          '    🔒 https://start.linuxmint.com' +
          '  </div>' +
          '  <div style="text-align: center; padding: 1rem;">' +
          '    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍃</div>' +
          '    <h3>Welcome to Linux Mint 22 Wilma</h3>' +
          '    <p style="color: var(--text-secondary); margin: 0.5rem 0 1.25rem;">' +
          '      Firefox comes pre-installed with enhanced privacy protection and zero telemetry tracking.' +
          '    </p>' +
          '    <button type="button" class="sim-btn sim-btn-primary modal-dismiss-btn">Done Exploring</button>' +
          '  </div>' +
          '</div>'
        );
      };
    }

    if (btnFiles) {
      btnFiles.onclick = function () {
        const mod4 = document.getElementById('module-4');
        if (mod4) mod4.scrollIntoView({ behavior: 'smooth' });
      };
    }

    if (btnTerminal) {
      btnTerminal.onclick = function () {
        const mod5 = document.getElementById('module-5');
        if (mod5) {
          mod5.scrollIntoView({ behavior: 'smooth' });
          const termInput = document.getElementById('terminal-input');
          if (termInput) setTimeout(function () { termInput.focus(); }, 400);
        }
      };
    }

    if (btnShield) {
      btnShield.onclick = function (e) {
        e.stopPropagation();
        togglePanelPopup(
          'shield',
          '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">' +
          '  <strong style="display: flex; align-items: center; gap: 0.4rem;">🛡️ Update Manager</strong>' +
          '  <button type="button" class="sim-btn popup-close-btn" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">✕</button>' +
          '</div>' +
          '<div class="status-alert success" style="margin-bottom: 0.5rem;">' +
          '  ✓ <strong>Your system is up to date.</strong> All security and kernel updates are verified safe.' +
          '</div>' +
          '<p style="font-size: 0.8rem; color: var(--text-secondary);">' +
          '  Linux Mint updates in the background without disturbing your workflow. No reboot required!' +
          '</p>'
        );
      };
    }

    if (btnVolume) {
      btnVolume.onclick = function (e) {
        e.stopPropagation();
        togglePanelPopup(
          'volume',
          '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">' +
          '  <strong>🔊 Volume Control</strong>' +
          '  <button type="button" class="sim-btn popup-close-btn" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">✕</button>' +
          '</div>' +
          '<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0;">' +
          '  <span>🔈</span>' +
          '  <input type="range" min="0" max="100" value="80" style="flex: 1;" aria-label="Volume Slider">' +
          '  <span>🔊</span>' +
          '</div>' +
          '<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center;">Built-in PulseAudio / PipeWire Sound System</div>'
        );
      };
    }

    if (btnWifi) {
      btnWifi.onclick = function (e) {
        e.stopPropagation();
        togglePanelPopup(
          'wifi',
          '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">' +
          '  <strong>📶 Wi-Fi Network</strong>' +
          '  <button type="button" class="sim-btn popup-close-btn" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">✕</button>' +
          '</div>' +
          '<div style="font-size: 0.85rem; margin-bottom: 0.5rem;">Connected to: <strong>Home_WiFi_5G</strong> (Signal: 98%)</div>' +
          '<div style="font-size: 0.75rem; color: var(--mint-primary); font-weight: 600;">✓ Hardware Wi-Fi drivers active & secure</div>'
        );
      };
    }

    if (btnClock) {
      function updateClock() {
        const now = new Date();
        btnClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      updateClock();
      setInterval(updateClock, 30000);

      btnClock.onclick = function (e) {
        e.stopPropagation();
        const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        togglePanelPopup(
          'clock',
          '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">' +
          '  <strong>📅 Date & Time</strong>' +
          '  <button type="button" class="sim-btn popup-close-btn" style="padding: 0.15rem 0.4rem; font-size: 0.75rem;">✕</button>' +
          '</div>' +
          '<div style="font-size: 0.95rem; font-weight: 700; color: var(--mint-primary);">' + today + '</div>' +
          '<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.35rem;">Synchronized automatically via Network Time (NTP).</div>'
        );
      };
    }

    renderApps('all');
  }

  // --- 8. MODULE 3: SOFTWARE MANAGER ---
  const SOFTWARE_CATALOG = [
    {
      id: 'vlc',
      name: 'VLC Media Player',
      cat: 'multimedia',
      icon: '🎬',
      desc: 'Plays virtually every video and movie file format imaginable without needing extra codecs.',
      size: '68 MB',
      type: 'System Package'
    },
    {
      id: 'steam',
      name: 'Steam',
      cat: 'system',
      featured: true,
      icon: '🎮',
      desc: 'Play thousands of PC games on Linux Mint seamlessly using Valve Proton with 1-click.',
      size: '85 MB',
      type: 'Flatpak'
    },
    {
      id: 'gimp',
      name: 'GIMP Image Editor',
      cat: 'graphics',
      featured: true,
      icon: '🎨',
      desc: 'Free Photoshop alternative for photo retouching, graphics composition, and authoring.',
      size: '142 MB',
      type: 'System Package'
    },
    {
      id: 'blender',
      name: 'Blender 3D Suite',
      cat: 'graphics',
      icon: '🧊',
      desc: 'Complete open-source 3D creation suite for modeling, animation, and video rendering.',
      size: '280 MB',
      type: 'Flatpak'
    },
    {
      id: 'obs',
      name: 'OBS Studio',
      cat: 'multimedia',
      icon: '📹',
      desc: 'Free and open-source software for live video recording and streaming.',
      size: '120 MB',
      type: 'Flatpak'
    },
    {
      id: 'discord',
      name: 'Discord',
      cat: 'internet',
      featured: true,
      icon: '💬',
      desc: 'Voice, video, and text communication service for chatting with friends and gaming communities.',
      size: '110 MB',
      type: 'Flatpak'
    },
    {
      id: 'libreoffice',
      name: 'LibreOffice Suite',
      cat: 'office',
      featured: true,
      icon: '📝',
      desc: 'Comprehensive office productivity suite including Writer, Calc, and Impress.',
      size: '195 MB',
      type: 'System Package'
    },
    {
      id: 'thunderbird',
      name: 'Thunderbird Email',
      cat: 'internet',
      icon: '✉️',
      desc: 'Open-source email, newsfeed, chat, and calendaring client from Mozilla.',
      size: '75 MB',
      type: 'System Package'
    }
  ];

  function initSoftwareSimulator() {
    const grid = document.getElementById('software-grid');
    const searchInput = document.getElementById('software-search');
    const categoryContainer = document.getElementById('software-category-filter');

    if (!grid) return;

    let currentSoftCat = 'all';

    function renderSoftware(query) {
      const q = (query || (searchInput ? searchInput.value : '')).toLowerCase().trim();
      const filtered = SOFTWARE_CATALOG.filter(function (s) {
        const matchesCategory =
          currentSoftCat === 'all' ||
          s.cat === currentSoftCat ||
          (currentSoftCat === 'featured' && s.featured);
        const matchesQuery = !q || s.name.toLowerCase().indexOf(q) !== -1 || s.desc.toLowerCase().indexOf(q) !== -1;
        return matchesCategory && matchesQuery;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted);">No software found for "' + (q || currentSoftCat) + '". Try searching "Steam" or "VLC"!</div>';
        return;
      }

      grid.innerHTML = filtered.map(function (item) {
        const isInstalled = appState.installedApps.has(item.name);
        let actionBtnHtml = '';

        if (isInstalled) {
          actionBtnHtml =
            '<div class="soft-action-group">' +
            '  <button type="button" class="sim-btn btn-open-app" data-id="' + item.id + '" data-name="' + item.name + '" data-icon="' + item.icon + '" data-desc="' + item.desc + '">✓ Open</button>' +
            '  <button type="button" class="btn-remove-app" data-id="' + item.id + '" data-name="' + item.name + '" title="Uninstall application">🗑️ Remove</button>' +
            '</div>';
        } else {
          actionBtnHtml =
            '<button type="button" class="sim-btn sim-btn-primary btn-install-app" data-id="' + item.id + '" data-name="' + item.name + '" data-icon="' + item.icon + '" data-desc="' + item.desc + '">' +
            '  📥 Install (1-Click)' +
            '</button>';
        }

        return (
          '<div class="software-item-card" data-id="' + item.id + '">' +
          '  <div class="soft-top">' +
          '    <div class="soft-icon">' + item.icon + '</div>' +
          '    <div class="soft-meta">' +
          '      <h5>' + item.name + '</h5>' +
          '      <p>' + item.desc + '</p>' +
          '      <span class="soft-type-tag">' + item.type + '</span>' +
          '    </div>' +
          '  </div>' +
          '  <div class="install-progress-bar" id="prog-' + item.id + '">' +
          '    <div class="install-progress-fill" id="fill-' + item.id + '"></div>' +
          '  </div>' +
          '  <div class="soft-bottom">' +
          '    <span class="soft-size">' + item.size + ' • Verified Mint Safe</span>' +
          '    ' + actionBtnHtml +
          '  </div>' +
          '</div>'
        );
      }).join('');
    }

    // Category filter buttons
    if (categoryContainer) {
      categoryContainer.onclick = function (e) {
        const catBtn = e.target.closest('.soft-cat-btn');
        if (catBtn) {
          categoryContainer.querySelectorAll('.soft-cat-btn').forEach(function (b) {
            b.classList.remove('active');
          });
          catBtn.classList.add('active');
          currentSoftCat = catBtn.getAttribute('data-cat') || 'all';
          renderSoftware();
        }
      };
    }

    grid.onclick = function (e) {
      // 1. Install action
      const installBtn = e.target.closest('.btn-install-app');
      if (installBtn) {
        const appId = installBtn.getAttribute('data-id');
        const appName = installBtn.getAttribute('data-name');
        const progBar = document.getElementById('prog-' + appId);
        const progFill = document.getElementById('fill-' + appId);

        installBtn.disabled = true;
        installBtn.innerHTML = '⏳ Installing...';

        if (progBar && progFill) {
          progBar.style.display = 'block';
          let progress = 0;
          const timer = setInterval(function () {
            progress += 25;
            progFill.style.width = progress + '%';
            if (progress >= 100) {
              clearInterval(timer);
              appState.installedApps.add(appName);
              safeStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(Array.from(appState.installedApps)));
              markProgress('task-software');
              renderSoftware();
            }
          }, 90);
        } else {
          appState.installedApps.add(appName);
          safeStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(Array.from(appState.installedApps)));
          markProgress('task-software');
          renderSoftware();
        }
        return;
      }

      // 2. Open action
      const openBtn = e.target.closest('.btn-open-app');
      if (openBtn) {
        const appName = openBtn.getAttribute('data-name');
        const appIcon = openBtn.getAttribute('data-icon') || '📦';
        const appDesc = openBtn.getAttribute('data-desc') || '';

        openMockModal(
          appName,
          appIcon,
          '<div style="text-align: center; padding: 1.5rem 0.5rem;">' +
          '  <div style="font-size: 3rem; margin-bottom: 0.75rem;">' + appIcon + '</div>' +
          '  <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">' + appName + '</h4>' +
          '  <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">' + appDesc + '</p>' +
          '  <div class="status-alert success" style="text-align: left; margin-bottom: 1rem;">' +
          '    ✓ Installed securely from the official Linux Mint software repository.' +
          '  </div>' +
          '  <button type="button" class="sim-btn sim-btn-primary modal-dismiss-btn">Close App</button>' +
          '</div>'
        );
        return;
      }

      // 3. Remove / Uninstall action
      const removeBtn = e.target.closest('.btn-remove-app');
      if (removeBtn) {
        const appId = removeBtn.getAttribute('data-id');
        const appName = removeBtn.getAttribute('data-name');
        const progBar = document.getElementById('prog-' + appId);
        const progFill = document.getElementById('fill-' + appId);

        removeBtn.disabled = true;
        removeBtn.innerHTML = '⏳ Removing...';

        if (progBar && progFill) {
          progBar.style.display = 'block';
          let progress = 100;
          const timer = setInterval(function () {
            progress -= 35;
            progFill.style.width = Math.max(0, progress) + '%';
            if (progress <= 0) {
              clearInterval(timer);
              appState.installedApps.delete(appName);
              safeStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(Array.from(appState.installedApps)));
              renderSoftware();
            }
          }, 80);
        } else {
          appState.installedApps.delete(appName);
          safeStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(Array.from(appState.installedApps)));
          renderSoftware();
        }
      }
    };

    if (searchInput) {
      searchInput.oninput = function (e) {
        renderSoftware(e.target.value);
      };
    }

    renderSoftware();
  }

  // --- 9. MODULE 4: THUNAR FILE EXPLORER ---
  const THUNAR_DIRS = {
    '/home/newcomer': {
      label: 'Home',
      items: [
        { name: 'Desktop', type: 'folder', icon: '🖥️' },
        { name: 'Documents', type: 'folder', icon: '📁' },
        { name: 'Downloads', type: 'folder', icon: '📥' },
        { name: 'Pictures', type: 'folder', icon: '🖼️' },
        { name: 'Videos', type: 'folder', icon: '🎬' },
        { name: 'welcome_notes.txt', type: 'file', icon: '📄', desc: 'Welcome to Linux Mint! No C: drive needed. Everything is in /home/newcomer.' }
      ]
    },
    '/home/newcomer/Desktop': {
      label: 'Desktop',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'Steam Launcher', type: 'file', icon: '🎮', desc: 'Desktop shortcut to Steam' },
        { name: 'Project_Notes.txt', type: 'file', icon: '📄', desc: 'Desktop scratchpad notes' }
      ]
    },
    '/home/newcomer/Documents': {
      label: 'Documents',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'Resume_2026.docx', type: 'file', icon: '📝', desc: 'Opens cleanly with LibreOffice Writer' },
        { name: 'Budget_Q3.xlsx', type: 'file', icon: '📊', desc: 'Opens with LibreOffice Calc' },
        { name: 'Mint_Cheatsheet.pdf', type: 'file', icon: '📑', desc: 'Everyday Linux Mint shortcuts and tips' }
      ]
    },
    '/home/newcomer/Downloads': {
      label: 'Downloads',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'linuxmint-22-xfce.iso', type: 'file', icon: '💿', desc: 'Mint Installation Image (2.7 GB)' },
        { name: 'wallpaper-emerald.png', type: 'file', icon: '🖼️', desc: 'Scenic mountain wallpaper' }
      ]
    },
    '/home/newcomer/Pictures': {
      label: 'Pictures',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'family_trip.jpg', type: 'file', icon: '📸', desc: 'Vacation photo (1920x1080)' },
        { name: 'avatar.png', type: 'file', icon: '🖼️', desc: 'Profile photo' }
      ]
    },
    '/home/newcomer/Videos': {
      label: 'Videos',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'Mint_Tutorial.mp4', type: 'file', icon: '🎬', desc: 'Video recording of Mint XFCE tour' }
      ]
    },
    '/media/newcomer/USB_DRIVE': {
      label: 'USB Drive (Kingston 32GB)',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'Backup_Photos', type: 'folder', icon: '📁' },
        { name: 'Work_Projects', type: 'folder', icon: '📁' },
        { name: 'notes.txt', type: 'file', icon: '📄', desc: 'Notes on USB drive' }
      ]
    },
    '/media/newcomer/USB_DRIVE/Backup_Photos': {
      label: 'Backup_Photos',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'beach_sunset.jpg', type: 'file', icon: '📸', desc: 'High-resolution sunset photo' }
      ]
    },
    '/media/newcomer/USB_DRIVE/Work_Projects': {
      label: 'Work_Projects',
      items: [
        { name: '.. (Go Up)', type: 'up', icon: '⬆️' },
        { name: 'project_spec.pdf', type: 'file', icon: '📑', desc: 'Work project specifications' }
      ]
    }
  };

  function initThunarSimulator() {
    const fileGrid = document.getElementById('thunar-files');
    const pathBar = document.getElementById('thunar-path');
    const breadcrumbsBar = document.getElementById('thunar-breadcrumbs');
    const sidebar = document.getElementById('thunar-sidebar-items');
    const fileInfoToast = document.getElementById('thunar-file-info');

    if (!fileGrid) return;

    function renderBreadcrumbs(path) {
      if (!breadcrumbsBar) return;
      const parts = path.split('/').filter(Boolean);
      const crumbsHtml = [];

      // Root crumb
      crumbsHtml.push('<button type="button" class="thunar-crumb-btn" data-path="/home/newcomer">🏠 Home</button>');

      let currentAccum = '';
      for (let i = 0; i < parts.length; i++) {
        currentAccum += '/' + parts[i];
        if (currentAccum === '/home' || currentAccum === '/home/newcomer') {
          continue;
        }
        crumbsHtml.push('<span class="thunar-crumb-sep">/</span>');
        crumbsHtml.push(
          '<button type="button" class="thunar-crumb-btn" data-path="' + currentAccum + '">' + parts[i] + '</button>'
        );
      }

      breadcrumbsBar.innerHTML = crumbsHtml.join('');

      breadcrumbsBar.querySelectorAll('.thunar-crumb-btn').forEach(function (btn) {
        btn.onclick = function () {
          const targetPath = btn.getAttribute('data-path');
          if (targetPath) {
            renderDir(targetPath);
          }
        };
      });
    }

    function renderDir(path) {
      const validPath = THUNAR_DIRS[path] ? path : '/home/newcomer';
      appState.thunarCurrentPath = validPath;

      if (pathBar) pathBar.textContent = validPath;
      renderBreadcrumbs(validPath);

      const dirData = THUNAR_DIRS[validPath];
      fileGrid.innerHTML = dirData.items.map(function (item) {
        return (
          '<div class="thunar-file-item" data-name="' + item.name + '" data-type="' + item.type + '" data-desc="' + (item.desc || '') + '" data-icon="' + item.icon + '">' +
          '  <div class="thunar-file-icon">' + item.icon + '</div>' +
          '  <div class="thunar-file-label">' + item.name + '</div>' +
          '</div>'
        );
      }).join('');

      if (sidebar) {
        sidebar.querySelectorAll('.thunar-side-item').forEach(function (el) {
          if (el.getAttribute('data-path') === validPath) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }
    }

    fileGrid.onclick = function (e) {
      const item = e.target.closest('.thunar-file-item');
      if (!item) return;

      const name = item.getAttribute('data-name');
      const type = item.getAttribute('data-type');
      const desc = item.getAttribute('data-desc');
      const icon = item.getAttribute('data-icon') || '📄';

      if (type === 'up') {
        const segments = appState.thunarCurrentPath.split('/').filter(Boolean);
        segments.pop();
        const parentPath = '/' + segments.join('/');
        renderDir(THUNAR_DIRS[parentPath] ? parentPath : '/home/newcomer');
        return;
      }

      if (type === 'folder') {
        const targetPath = appState.thunarCurrentPath === '/' ? '/' + name : appState.thunarCurrentPath + '/' + name;
        if (THUNAR_DIRS[targetPath]) {
          renderDir(targetPath);
        } else {
          renderDir('/home/newcomer');
        }
        markProgress('task-thunar');
      } else {
        if (fileInfoToast) {
          fileInfoToast.style.display = 'block';
          fileInfoToast.innerHTML = '📄 <strong>' + name + '</strong>: ' + (desc || 'File in your Home directory.');
          setTimeout(function () {
            fileInfoToast.style.display = 'none';
          }, 3500);
        }

        openMockModal(
          name,
          icon,
          '<div style="padding: 1rem 0;">' +
          '  <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">' +
          '    <span style="font-size: 2.25rem;">' + icon + '</span>' +
          '    <div>' +
          '      <h4 style="font-size: 1.1rem; font-weight: 700;">' + name + '</h4>' +
          '      <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">' +
          '        ' + appState.thunarCurrentPath + '/' + name +
          '      </div>' +
          '    </div>' +
          '  </div>' +
          '  <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">' + desc + '</p>' +
          '  <div class="status-alert info" style="margin-bottom: 1rem;">' +
          '    💡 Linux Mint seamlessly associates every file with its native viewer without asking you to buy licenses.' +
          '  </div>' +
          '  <button type="button" class="sim-btn sim-btn-primary modal-dismiss-btn">Close File</button>' +
          '</div>'
        );

        markProgress('task-thunar');
      }
    };

    if (sidebar) {
      sidebar.onclick = function (e) {
        const item = e.target.closest('.thunar-side-item');
        if (item) {
          const path = item.getAttribute('data-path');
          if (path && THUNAR_DIRS[path]) {
            renderDir(path);
            markProgress('task-thunar');
          }
        }
      };
    }

    renderDir('/home/newcomer');
  }

  // --- 10. MODULE 5: FEAR-FREE TERMINAL ---
  const COMMANDS = {
    'neofetch': {
      output: [
        '<span style="color: #4ade80;">             ...-:::::-...             </span><span style="color: #f1f5f9;">user@mint-xfce</span>',
        '<span style="color: #4ade80;">          .-MMMMMMMMMMMMMMM-.          </span><span style="color: #94a3b8;">-------------</span>',
        '<span style="color: #4ade80;">      .-MMMM&#96;..-:::::::-..&#96;MMMM-.      </span><span style="color: #60a5fa;">OS</span>: Linux Mint 22 Wilma x86_64',
        '<span style="color: #4ade80;">    .:MMMM.:MMMMMMMMMMMMMMM:.MMMM:.    </span><span style="color: #60a5fa;">Host</span>: PC Desktop / Laptop',
        '<span style="color: #4ade80;">   -MMM-M---MMMMMMMMMMMMMMMMMMM.MMM-   </span><span style="color: #60a5fa;">Kernel</span>: 6.8.0-generic',
        '<span style="color: #4ade80;">  :MMM:MM&#96;  :MMMM:....   .MMMM: :MMM:  </span><span style="color: #60a5fa;">Uptime</span>: 2 hours, 14 mins',
        '<span style="color: #4ade80;"> :MMM.MM&#96;   :MM:          MMMM:  .MMM: </span><span style="color: #60a5fa;">Packages</span>: 2140 (dpkg), 12 (flatpak)',
        '<span style="color: #4ade80;"> :MMM.MM&#96;   :MM:          MMMM:  .MMM: </span><span style="color: #60a5fa;">Shell</span>: bash 5.2.21',
        '<span style="color: #4ade80;">  :MMM:MM&#96;  :MMMM:....   .MMMM: :MMM:  </span><span style="color: #60a5fa;">DE</span>: Xfce 4.18',
        '<span style="color: #4ade80;">   -MMM-M---MMMMMMMMMMMMMMMMMMM.MMM-   </span><span style="color: #60a5fa;">WM</span>: Xfwm4 (Mint-Y Theme)',
        '<span style="color: #4ade80;">    .:MMMM.:MMMMMMMMMMMMMMM:.MMMM:.    </span><span style="color: #60a5fa;">Memory</span>: 2150MiB / 8000MiB (26%)',
        '<span style="color: #4ade80;">      .-MMMM&#96;..-:::::::-..&#96;MMMM-.      </span>',
        '<span style="color: #4ade80;">          .-MMMMMMMMMMMMMMM-.          </span>',
        '<span style="color: #4ade80;">             ...-:::::-...             </span>',
        '<br><span style="color: #94a3b8;">💡 Plain English: neofetch displays your system summary, memory usage, and desktop info. Harmless and fun!</span>'
      ].join('<br>')
    },
    'pwd': {
      output: '/home/newcomer<br><span style="color: #94a3b8;">💡 Plain English: "pwd" stands for "Print Working Directory". It tells you which folder you are currently sitting inside!</span>'
    },
    'ls': {
      output: '<span style="color: #60a5fa; font-weight: 700;">Desktop   Documents   Downloads   Pictures   Videos</span>   welcome_notes.txt<br><span style="color: #94a3b8;">💡 Plain English: "ls" stands for "List". It simply shows all files and folders in your current location, identical to opening Thunar!</span>'
    },
    'dir': {
      output: '<span style="color: #60a5fa; font-weight: 700;">Desktop   Documents   Downloads   Pictures   Videos</span>   welcome_notes.txt<br><span style="color: #94a3b8;">💡 Plain English: Coming from Windows? \'dir\' works in Linux too! (Though most Linux users prefer typing \'ls\').</span>'
    },
    'free -h': {
      output: [
        '               total        used        free      shared  buff/cache   available',
        'Mem:           7.8Gi       2.1Gi       3.9Gi       120Mi       1.8Gi       5.4Gi',
        'Swap:          2.0Gi          0B       2.0Gi',
        '<br><span style="color: #94a3b8;">💡 Plain English: "free -h" prints your RAM memory usage in human-readable units (Gigabytes). Linux Mint XFCE uses only ~2GB, leaving plenty of speed for your programs!</span>'
      ].join('<br>')
    },
    'cat welcome_notes.txt': {
      output: [
        '<span style="color: #86efac; font-weight: 600;">Welcome to Linux Mint XFCE!</span>',
        '• No drive letters (C: or D:). All personal files reside in /home/newcomer.',
        '• Software is installed safely from the Software Manager.',
        '• Timeshift automatically keeps snapshots so your computer is always safe.',
        '<br><span style="color: #94a3b8;">💡 Plain English: "cat" displays the contents of a text file right on screen without opening an editor window.</span>'
      ].join('<br>')
    },
    'cat': {
      output: 'Usage: cat [filename]<br><span style="color: #94a3b8;">💡 Plain English: Try typing <strong>cat welcome_notes.txt</strong> to view the file\'s contents!</span>'
    },
    'type welcome_notes.txt': {
      output: [
        '<span style="color: #86efac; font-weight: 600;">Welcome to Linux Mint XFCE!</span>',
        '• No drive letters (C: or D:). All personal files reside in /home/newcomer.',
        '• Software is installed safely from the Software Manager.',
        '• Timeshift automatically keeps snapshots so your computer is always safe.',
        '<br><span style="color: #94a3b8;">💡 Plain English: Windows alias recognized! In Windows CMD you type \'type file.txt\', but in Linux the equivalent is \'cat file.txt\'.</span>'
      ].join('<br>')
    },
    'sudo apt update': {
      output: [
        'Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease',
        'Hit:2 http://security.ubuntu.com/ubuntu noble-security InRelease',
        'Hit:3 http://packages.linuxmint.com wilma InRelease',
        'Reading package lists... Done',
        'Building dependency tree... Done',
        'Reading state information... Done',
        'All packages are up to date.',
        '<br><span style="color: #4ade80;">✓ All software repositories checked safely.</span>',
        '<span style="color: #94a3b8;">💡 Plain English: "sudo" means "Run as Administrator". "apt update" checks the official Mint catalog for new security patches. You can do this exact same check with 1-click in the graphical Update Manager!</span>'
      ].join('<br>')
    },
    'uname -a': {
      output: 'Linux mint-xfce 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux<br><span style="color: #94a3b8;">💡 Plain English: Prints the exact version number of the Linux kernel running on your computer.</span>'
    },
    'whoami': {
      output: 'newcomer<br><span style="color: #94a3b8;">💡 Plain English: Prints the current logged-in username. You are logged in as "newcomer"!</span>'
    },
    'date': {
      output: new Date().toString() + '<br><span style="color: #94a3b8;">💡 Plain English: Prints the system calendar date and time.</span>'
    },
    'help': {
      output: [
        '<span style="color: #60a5fa; font-weight: 700;">Available beginner commands in this simulator:</span>',
        '• <strong>neofetch</strong> - Displays friendly system specifications and Mint ASCII logo',
        '• <strong>ls</strong> (or <strong>dir</strong>) - Lists files in current folder',
        '• <strong>pwd</strong> - Shows current folder path',
        '• <strong>free -h</strong> - Displays system RAM memory usage',
        '• <strong>cat welcome_notes.txt</strong> - Prints the welcome notes file',
        '• <strong>whoami</strong> - Prints your user account name',
        '• <strong>sudo apt update</strong> - Checks for system and security updates',
        '• <strong>uname -a</strong> - Displays Linux kernel version',
        '• <strong>date</strong> - Shows current date & time',
        '• <strong>clear</strong> (or <strong>cls</strong>) - Wipes the terminal screen'
      ].join('<br>')
    },
    'ip a': {
      output: '1: lo: &lt;LOOPBACK,UP&gt; mtu 65536<br>2: wlan0: &lt;BROADCAST,MULTICAST,UP&gt; inet 192.168.1.104/24<br><span style="color: #94a3b8;">💡 Plain English: Displays your Wi-Fi/Ethernet network IP addresses.</span>'
    },
    'ipconfig': {
      output: 'Windows command recognized! In Linux, network info is checked with <strong>ip a</strong>:<br>wlan0: inet 192.168.1.104/24<br><span style="color: #94a3b8;">💡 Plain English: "ipconfig" in Windows translates to "ip a" in Linux.</span>'
    },
    'systeminfo': {
      output: 'Windows command recognized! In Linux, system info is usually viewed with <strong>neofetch</strong> or <strong>uname -a</strong>.<br><span style="color: #94a3b8;">💡 Try clicking "neofetch" above!</span>'
    },
    'cd': {
      output: 'In Linux, "cd" changes folder, e.g. "cd Documents". In this simulator you can navigate visually in Thunar or use the quick buttons!<br><span style="color: #94a3b8;">💡 Plain English: "cd" stands for "Change Directory".</span>'
    },
    'clear': {
      clear: true
    },
    'cls': {
      clear: true
    }
  };

  function initTerminalSimulator() {
    const screen = document.getElementById('terminal-screen');
    const input = document.getElementById('terminal-input');
    const runBtn = document.getElementById('term-run-btn');
    const chipsContainer = document.getElementById('terminal-command-chips');

    if (!screen || !input) return;

    function runCommand(cmdText) {
      const clean = (cmdText || '').trim();
      if (!clean) return;

      const lower = clean.toLowerCase();

      if (lower === 'clear' || lower === 'cls') {
        screen.innerHTML =
          '<div style="color: #94a3b8; margin-bottom: 0.75rem;">' +
          '  Linux Mint 22 (XFCE Edition) - Welcome to the safe newcomer terminal playground.<br>' +
          '  Type any command below or click one of the quick suggestions. Zero danger!' +
          '</div>';
        return;
      }

      // Append prompt and command
      const cmdBlock = document.createElement('div');
      cmdBlock.style.marginTop = '0.5rem';
      cmdBlock.innerHTML =
        '<div style="display: flex; gap: 0.4rem;">' +
        '  <span style="color: #4ade80; font-weight: 600;">newcomer@mint-xfce:~$</span>' +
        '  <span style="color: #f1f5f9;">' + clean + '</span>' +
        '</div>';
      screen.appendChild(cmdBlock);

      // Check known command
      const known = COMMANDS[lower];
      const outBlock = document.createElement('div');
      outBlock.style.margin = '0.35rem 0 0.85rem 0';
      outBlock.style.lineHeight = '1.45';

      if (known) {
        outBlock.innerHTML = known.output;
      } else {
        outBlock.innerHTML =
          '<span style="color: #fca5a5;">Command \'' + clean + '\' not recognized in this beginner demo.</span><br>' +
          '<span style="color: #94a3b8;">Try typing <strong>help</strong> or clicking one of the safe preset buttons below!</span>';
      }

      screen.appendChild(outBlock);
      screen.scrollTop = screen.scrollHeight;
      markProgress('task-terminal');
    }

    function submitInput() {
      runCommand(input.value);
      input.value = '';
    }

    input.onkeydown = function (e) {
      if (e.key === 'Enter') submitInput();
    };

    if (runBtn) {
      runBtn.onclick = submitInput;
    }

    if (chipsContainer) {
      chipsContainer.onclick = function (e) {
        const chip = e.target.closest('.cmd-chip, .quick-cmd-btn');
        if (chip) {
          const cmd = chip.getAttribute('data-cmd');
          if (cmd) {
            input.value = cmd;
            runCommand(cmd);
            input.value = '';
          }
        }
      };
    }
  }

  // --- 11. INTERACTIVE QUIZZES ---
  const QUIZ_DATA = {
    'quiz-1': {
      answer: 'b',
      feedback: 'Correct! The Update Manager safely handles updates in the background. Mint will never abruptly shut down or force a reboot while you are working.'
    },
    'quiz-2': {
      answer: 'c',
      feedback: 'Exactly! Just click the Mint button in the bottom-left corner or tap the Windows/Super key on your keyboard and start typing what you need.'
    },
    'quiz-3': {
      answer: 'a',
      feedback: 'Spot on! In Linux Mint, you simply open the Software Manager and click Install. No suspicious third-party download websites required.'
    },
    'quiz-4': {
      answer: 'b',
      feedback: 'Correct! Your Home directory (/home/username) houses all your personal files (Documents, Downloads, Pictures, Videos). There are no drive letters like C: or D:.'
    },
    'quiz-5': {
      answer: 'c',
      feedback: 'You nailed it! You can do 100% of your daily computing in Linux Mint XFCE via the visual interface without ever opening the terminal.'
    }
  };

  function initQuizzes() {
    document.querySelectorAll('.quiz-box').forEach(function (box) {
      const quizId = box.getAttribute('data-quiz-id');
      const options = box.querySelectorAll('.quiz-option-btn');
      const feedback = box.querySelector('.quiz-feedback');
      const resetBtn = box.querySelector('.quiz-reset-btn');
      const qMeta = QUIZ_DATA[quizId];

      if (!qMeta) return;

      function resetQuiz() {
        options.forEach(function (o) {
          o.disabled = false;
          o.classList.remove('correct', 'incorrect');
        });
        if (feedback) {
          feedback.style.display = 'none';
          feedback.innerHTML = '';
        }
        if (resetBtn) resetBtn.style.display = 'none';
        delete appState.progress[quizId];
        safeStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(appState.progress));

        let quizData = {};
        try {
          const rawQ = safeStorage.getItem(STORAGE_KEY_QUIZ);
          if (rawQ) quizData = JSON.parse(rawQ);
        } catch (e) {}
        delete quizData[quizId];
        safeStorage.setItem(STORAGE_KEY_QUIZ, JSON.stringify(quizData));

        const checklistArr = Object.keys(appState.progress).filter(function (k) {
          return appState.progress[k] && TRACKED_TASKS.indexOf(k) !== -1;
        });
        safeStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklistArr));

        updateProgressUI(false);
      }

      // Restore answered state if previously saved
      if (appState.progress[quizId]) {
        const correctBtn = box.querySelector('.quiz-option-btn[data-val="' + qMeta.answer + '"]');
        if (correctBtn) {
          options.forEach(function (o) { o.disabled = true; });
          correctBtn.classList.add('correct');
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'quiz-feedback status-alert success';
            feedback.innerHTML = '🎉 ' + qMeta.feedback;
          }
          if (resetBtn) resetBtn.style.display = 'inline-block';
        }
      }

      options.forEach(function (opt) {
        opt.onclick = function (e) {
          e.preventDefault();
          const chosen = opt.getAttribute('data-val');
          options.forEach(function (o) {
            o.disabled = true;
            o.classList.remove('correct', 'incorrect');
          });

          if (chosen === qMeta.answer) {
            opt.classList.add('correct');
            if (feedback) {
              feedback.style.display = 'block';
              feedback.className = 'quiz-feedback status-alert success';
              feedback.innerHTML = '🎉 ' + qMeta.feedback;
            }
            markProgress(quizId);
          } else {
            opt.classList.add('incorrect');
            const correctBtn = box.querySelector('.quiz-option-btn[data-val="' + qMeta.answer + '"]');
            if (correctBtn) correctBtn.classList.add('correct');
            if (feedback) {
              feedback.style.display = 'block';
              feedback.className = 'quiz-feedback status-alert warning';
              feedback.innerHTML = '💡 Not quite. ' + qMeta.feedback;
            }
          }

          if (resetBtn) resetBtn.style.display = 'inline-block';
        };
      });

      if (resetBtn) {
        resetBtn.onclick = function (e) {
          e.preventDefault();
          resetQuiz();
        };
      }
    });
  }

  // --- 12. PROGRESS TRACKER & READINESS CHECKLIST ---
  const TRACKED_TASKS = [
    'task-snapshot',
    'task-whisker',
    'task-software',
    'task-thunar',
    'task-terminal',
    'quiz-1',
    'quiz-2',
    'quiz-3',
    'quiz-4',
    'quiz-5'
  ];

  function markProgress(taskId) {
    appState.progress[taskId] = true;
    safeStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(appState.progress));

    // Also persist under mint_quiz_progress and mint_checklist_progress
    if (taskId.indexOf('quiz-') === 0) {
      let quizData = {};
      try {
        const rawQ = safeStorage.getItem(STORAGE_KEY_QUIZ);
        if (rawQ) quizData = JSON.parse(rawQ);
      } catch (e) {}
      quizData[taskId] = true;
      safeStorage.setItem(STORAGE_KEY_QUIZ, JSON.stringify(quizData));
    }

    const checklistArr = Object.keys(appState.progress).filter(function (k) {
      return appState.progress[k] && TRACKED_TASKS.indexOf(k) !== -1;
    });
    safeStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(checklistArr));

    updateProgressUI(true);
  }

  function updateProgressUI(fromUserAction) {
    const completedCount = Object.keys(appState.progress).filter(function (k) {
      return TRACKED_TASKS.indexOf(k) !== -1 && appState.progress[k];
    }).length;
    const total = TRACKED_TASKS.length;
    const pct = Math.round((completedCount / total) * 100);

    const progressFill = document.getElementById('global-progress-fill');
    const progressText = document.getElementById('global-progress-text');
    const certPercent = document.getElementById('cert-percent-text');

    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '% Mastered';
    if (certPercent) certPercent.textContent = completedCount + ' of ' + total + ' Milestones Completed (' + pct + '%)';

    // Update readiness checklist items
    TRACKED_TASKS.forEach(function (task) {
      const el = document.getElementById('check-' + task);
      if (el) {
        const icon = el.querySelector('.check-icon');
        if (appState.progress[task]) {
          el.className = 'check-item done';
          if (icon) icon.textContent = '✓';
        } else {
          el.className = 'check-item';
          if (icon) icon.textContent = '○';
        }
      }
    });

    // Update module status indicators
    const modMappings = {
      'mod-status-1': ['task-snapshot', 'quiz-1'],
      'mod-status-2': ['task-whisker', 'quiz-2'],
      'mod-status-3': ['task-software', 'quiz-3'],
      'mod-status-4': ['task-thunar', 'quiz-4'],
      'mod-status-5': ['task-terminal', 'quiz-5']
    };

    Object.keys(modMappings).forEach(function (elemId) {
      const statusEl = document.getElementById(elemId);
      if (statusEl) {
        const tasks = modMappings[elemId];
        const allDone = tasks.every(function (t) { return appState.progress[t]; });
        if (allDone) {
          statusEl.className = 'module-status done';
          statusEl.innerHTML = '✓ Completed';
        } else {
          statusEl.className = 'module-status';
          statusEl.innerHTML = '● In Progress';
        }
      }
    });

    // Trigger completion celebration modal if 100% achieved by user action
    if (pct === 100 && fromUserAction) {
      openCompletionModal();
    }
  }

  function initChecklistClicks() {
    document.querySelectorAll('.readiness-checklist .check-item').forEach(function (item) {
      item.onclick = function () {
        const targetId = item.getAttribute('data-target');
        if (targetId) {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            targetEl.style.outline = '2px solid var(--mint-primary)';
            setTimeout(function () {
              targetEl.style.outline = 'none';
            }, 1500);
          }
        }
      };
    });

    const resetProgressBtn = document.getElementById('btn-reset-progress');
    if (resetProgressBtn) {
      resetProgressBtn.onclick = function () {
        appState.progress = {};
        safeStorage.setItem(STORAGE_KEY_PROGRESS, '{}');
        safeStorage.setItem(STORAGE_KEY_QUIZ, '{}');
        safeStorage.setItem(STORAGE_KEY_CHECKLIST, '[]');
        updateProgressUI(false);
        document.querySelectorAll('.quiz-box').forEach(function (box) {
          const resetBtn = box.querySelector('.quiz-reset-btn');
          if (resetBtn) {
            const options = box.querySelectorAll('.quiz-option-btn');
            const feedback = box.querySelector('.quiz-feedback');
            options.forEach(function (o) {
              o.disabled = false;
              o.classList.remove('correct', 'incorrect');
            });
            if (feedback) {
              feedback.style.display = 'none';
              feedback.innerHTML = '';
            }
            resetBtn.style.display = 'none';
          }
        });
      };
    }
  }

  // --- 13. BULLETPROOF BOOTSTRAP ---
  function bootstrap() {
    try {
      initTheme();
      initMockModal();
      initWindowControls();
      initTranslator();
      initTimeshiftSimulator();
      initWhiskerSimulator();
      initSoftwareSimulator();
      initThunarSimulator();
      initTerminalSimulator();
      initQuizzes();
      initChecklistClicks();
      updateProgressUI(false);
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('Error during Mint Guide initialization:', err);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
