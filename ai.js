// -----------------------
// Sample AI data (add url to make name clickable)
const aiData = {
  email: [
    { name: "Flowrite", icon: "✉️", status: "Popular", description: "AI-powered email assistant.", url: "https://flowrite.com" },
    { name: "LoveAB Mail", icon: "📧", status: "Beta", description: "Fast email generator.", url: "https://loveab.com" }
  ],
  image_generations: [
    { name: "midjourney", icon: "✉️", status: "Paid", description: "High-quality image generation", url: "https://www.midjourney.com " },
    { name: "DALL·E", icon: "📧", status: "Paid + Free", description: "Image creation & editing", url: "https://openai.com/dall-e " },
    { name: "Leonardo AI", icon: "📧", status: "Paid + Free", description: "Product, game assets ", url: "https://leonardo.ai " },
    { name: "Adobe Firefly", icon: "📧", status: "Paid + Free", description: "Commercial-safe images", url: "https://firefly.adobe.com " },
    { name: "krea", icon: "📧", status: "Paid + Free", description: "for a live img generation", url: "https://www.krea.ai/" }
  ],
  video_generations: [
    { name: "Runway ML ", icon: "✉️", status: "Paid + Free", description: "AI video creation", url: "https://runwayml.com " },
    { name: "Pika Labs ", icon: "📧", status: "Paid + Free", description: "Text-to-video", url: "https://pika.art " },
    { name: "Synthesia ", icon: "📧", status: "Paid", description: "Corporate avatar videos", url: "https://www.synthesia.io " },
    { name: "HeyGen ", icon: "📧", status: "Paid", description: "AI presenter videos", url: "https://www.heygen.com " }
  ],
  web_development: [
    { name: "Bolt.new", icon: "✉️", status: "Paid", description: "High-quality image generation", url: "https://bolt.new " },
    { name: "Durable", icon: "📧", status: "Free + Paid", description: "Image creation & editing", url: " https://durable.co " },
    { name: "Wix ADI", icon: "📧", status: "BetFree + Paida", description: "Product, game assets", url: "https://www.wix.com/adi " },
    { name: "stich", icon: "📧", status: "BetFree + Paida", description: "for a ui design and front-end web", url: "https://stitch.withgoogle.com" },
    { name: "Framer AI", icon: "📧", status: "Free + Paid", description: "Commercial-safe images", url: "https://firefly.adobe.com " }
  ],
  app_development: [
    { name: "FlutterFlow", icon: "✉️", status: "Free + Paid", description: "No-code app builder", url: " https://flutterflow.io" },
    { name: "Adalo", icon: "📧", status:"Free + Paid", description: "Mobile app creation", url: "https://www.adalo.com " },
    { name: "Glide", icon: "📧", status: "Free + Paid", description: "Database-driven apps", url: "https://www.glideapps.com " }
  ],
  ui_ux_design: [
    { name: "Figma AI ", icon: "✉️", status: "Free + Paid", description: "UI design & prototyping", url: "https://www.figma.com " },
    { name: "stich", icon: "📧", status: "BetFree + Paida", description: "for a ui design and front-end web", url: "https://stitch.withgoogle.com" },
    { name: "Uizard", icon: "📧", status:"Free + Paid", description: "Sketch to UI ", url: "https://uizard.io " },
    { name: "Galileo AI", icon: "📧", status: "Paid", description: "UI generation from text ", url: "https://www.usegalileo.ai " },
    { name: "Visily", icon: "📧", status: "Free + Paid", description: "Wireframes & mockups ", url: "https://www.visily.ai " }
  ],
  presentation: { name: "Gamma", icon: "📊", status: "Popular", description: "AI presentation creator.", url: "https://gamma.app" },
  captions: { name: "Copy.ai", icon: "✍️", status: "Popular", description: "AI caption generator.", url: "https://www.copy.ai" }
};

// -----------------------
// DOM refs (these IDs are expected to exist in index.html)
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');
const suggestList = document.getElementById('suggestList');
const suggestInner = document.getElementById('suggestInner'); // container inside suggestList
const resultBox = document.getElementById('resultBox');
const tableBody = document.getElementById('tableBody');

const historyListEl = document.getElementById('historyList');

const keys = Object.keys(aiData).sort();

// -----------------------
// In-memory history (cleared on page reload)
let historyItems = [];
const HISTORY_LIMIT = 20;

function addToHistory(term) {
  if (!term) return;
  const t = term.trim();
  const idx = historyItems.indexOf(t);
  if (idx !== -1) historyItems.splice(idx, 1); // remove duplicate
  historyItems.unshift(t);
  historyItems = historyItems.slice(0, HISTORY_LIMIT);
  renderHistory();
}

function renderHistory() {
  if (!historyListEl) return;
  historyListEl.innerHTML = '';
  historyItems.forEach(it => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'history-chip px-3 py-1 rounded-full text-sm text-gray-200';
    chip.innerText = it;
    chip.addEventListener('click', () => {
      searchBox.value = it;
      performSearchFromInput();
    });
    historyListEl.appendChild(chip);
  });
}

// initialize empty history UI
renderHistory();

// -----------------------
// Results rendering
function clearResults() {
  tableBody.innerHTML = '';
}

function createRow(key, entry) {
  const row = document.createElement('div');
  row.className = 'grid grid-cols-12 gap-4 px-3 py-4 items-center';

  // Name column (clickable link if url provided)
  const nameCol = document.createElement('div');
  nameCol.className = 'col-span-3';

  const title = document.createElement('a');
  title.className = 'font-semibold hover:underline';
  title.innerText = entry.name || key;
  title.href = entry.url || '#';
  title.target = '_blank';
  title.rel = 'noopener noreferrer';
  // use CSS variable fallback for color if Tailwind hasn't defined it
  title.style.color = 'var(--vscode-accent, #38bdf8)';

  const sub = document.createElement('div');
  sub.className = 'text-xs text-gray-300 truncate';
  sub.innerText = key;

  nameCol.appendChild(title);
  nameCol.appendChild(sub);

  const iconCol = document.createElement('div');
  iconCol.className = 'col-span-1 text-2xl text-center';
  iconCol.innerText = entry.icon || '—';

  const statusCol = document.createElement('div');
  statusCol.className = 'col-span-2';
  const badge = document.createElement('span');
  badge.className = 'inline-block px-3 py-1 text-xs rounded-full';
  badge.innerText = entry.status || 'Unknown';
  const sLower = (entry.status || '').toLowerCase();
  if (sLower.includes('popular')) badge.classList.add('bg-green-700/60');
  else if (sLower.includes('beta')) badge.classList.add('bg-yellow-700/60');
  else badge.classList.add('bg-gray-800/60');
  statusCol.appendChild(badge);

  const descCol = document.createElement('div');
  descCol.className = 'col-span-6 text-sm text-gray-200';
  descCol.innerText = entry.description || '—';

  row.appendChild(nameCol);
  row.appendChild(iconCol);
  row.appendChild(statusCol);
  row.appendChild(descCol);

  return row;
}

function showResults(matches) {
  clearResults();
  if (!matches || matches.length === 0) {
    tableBody.innerHTML = '<div class="px-3 py-4 text-center text-red-400">No results found.</div>';
  } else {
    matches.forEach(m => tableBody.appendChild(createRow(m.key, m.entry)));
  }
  resultBox.classList.remove('hidden');
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// -----------------------
// Search logic (supports comma-separated tokens & substring fallback)
function parseAndSearch(input) {
  if (!input) return [];
  const parts = input.split(',').map(p => p.trim()).filter(Boolean);
  const results = [];
  const seen = new Set();

  parts.forEach(part => {
    const key = part.toLowerCase();

    if (aiData[key]) {
      const list = Array.isArray(aiData[key]) ? aiData[key] : [aiData[key]];
      list.forEach(item => {
        const id = key + '::' + (item.name || '');
        if (!seen.has(id)) { seen.add(id); results.push({ key, entry: item }); }
      });
      return;
    }

    // fallback: substring match across keys and entries
    Object.entries(aiData).forEach(([k, v]) => {
      const list = Array.isArray(v) ? v : [v];
      list.forEach(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        if (k.includes(key) || name.includes(key) || desc.includes(key)) {
          const id = k + '::' + (item.name || '');
          if (!seen.has(id)) { seen.add(id); results.push({ key: k, entry: item }); }
        }
      });
    });
  });

  return results;
}

function performSearchFromInput() {
  const raw = searchBox.value.trim();
  if (!raw) {
    resultBox.classList.add('hidden');
    return;
  }
  const matches = parseAndSearch(raw);
  showResults(matches);
  addToHistory(raw);
}

// -----------------------
// Suggestion UI & keyboard handling
let suggestionElements = [];
let selectedIndex = -1;

function sampleName(key) {
  const val = aiData[key];
  const item = Array.isArray(val) ? val[0] : val;
  return item && item.name ? item.name : '';
}

function renderSuggestions(filteredKeys) {
  if (!suggestInner) return;
  suggestInner.innerHTML = '';
  suggestionElements = [];
  selectedIndex = -1;

  if (!filteredKeys || filteredKeys.length === 0) {
    suggestList.classList.add('hidden');
    return;
  }

  filteredKeys.forEach((k, idx) => {
    const row = document.createElement('div');
    row.className = 'px-4 py-2 flex items-center justify-between cursor-pointer';
    row.innerHTML = `<div class="flex items-center gap-3">
                       <div class="w-36 truncate text-sm">${k}</div>
                       <div class="text-xs text-gray-400">${sampleName(k)}</div>
                     </div>
                     <div class="text-xs text-gray-400"></div>`;
    row.dataset.value = k;

    // mousedown prevents input blur before pick
    row.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      chooseSuggestionAndSearch(k);
    });

    row.addEventListener('mouseover', () => {
      selectedIndex = idx;
      updateHighlight();
    });

    suggestInner.appendChild(row);
    suggestionElements.push(row);
  });

  // auto-select first suggestion
  selectedIndex = 0;
  updateHighlight();
  suggestList.classList.remove('hidden');
}

function updateHighlight() {
  suggestionElements.forEach((el, i) => {
    if (i === selectedIndex) {
      el.classList.add('bg-vscode-accent/40');
      el.classList.add('text-white');
    } else {
      el.classList.remove('bg-vscode-accent/40');
      el.classList.remove('text-white');
    }
  });

  if (selectedIndex >= 0 && suggestionElements[selectedIndex]) {
    suggestionElements[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

function hideSuggestions() {
  suggestList.classList.add('hidden');
  selectedIndex = -1;
  suggestionElements = [];
}

// choose suggestion: fill input but do NOT search (used for Tab)
function chooseSuggestionAutocomplete(key) {
  searchBox.value = key;
  hideSuggestions();
  searchBox.focus();
}

// choose suggestion: fill input and immediately search (used for click/Enter)
function chooseSuggestionAndSearch(key) {
  searchBox.value = key;
  hideSuggestions();
  performSearchFromInput();
  searchBox.focus();
}

// -----------------------
// Events

// input: update suggestion list
searchBox.addEventListener('input', () => {
  const raw = searchBox.value.trim().toLowerCase();
  if (!raw) { hideSuggestions(); return; }
  const filtered = keys.filter(k => k.startsWith(raw) || k.includes(raw));
  renderSuggestions(filtered);
});

// keydown: navigation, Tab autocomplete, Enter behaviors
searchBox.addEventListener('keydown', (e) => {
  // If suggestions hidden -> Enter should search
  if (suggestList.classList.contains('hidden')) {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearchFromInput();
    }
    return;
  }

  // Suggestions visible:
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (suggestionElements.length === 0) return;
    selectedIndex = (selectedIndex + 1) % suggestionElements.length;
    updateHighlight();
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (suggestionElements.length === 0) return;
    selectedIndex = (selectedIndex - 1 + suggestionElements.length) % suggestionElements.length;
    updateHighlight();
    return;
  }

  if (e.key === 'Tab') {
    // Tab will autocomplete the selected suggestion (no search), prevent focus change
    e.preventDefault();
    if (selectedIndex >= 0 && suggestionElements[selectedIndex]) {
      const chosen = suggestionElements[selectedIndex].dataset.value;
      chooseSuggestionAutocomplete(chosen);
    } else if (suggestionElements.length > 0) {
      chooseSuggestionAutocomplete(suggestionElements[0].dataset.value);
    }
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    // choose currently highlighted suggestion and search
    let chosen = null;
    if (selectedIndex >= 0 && suggestionElements[selectedIndex]) chosen = suggestionElements[selectedIndex].dataset.value;
    else if (suggestionElements.length > 0) chosen = suggestionElements[0].dataset.value;

    if (chosen) {
      chooseSuggestionAndSearch(chosen);
    } else {
      performSearchFromInput();
    }
    return;
  }

  if (e.key === 'Escape') {
    hideSuggestions();
    return;
  }
});

// click outside hides suggestions
document.addEventListener('click', (e) => {
  if (!suggestList.contains(e.target) && e.target !== searchBox) {
    hideSuggestions();
  }
});

// search button
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    performSearchFromInput();
  });
}

// expose for debugging (optional)
window._aiData = aiData;
window._keys = keys;
window._history = historyItems;


// footer.js - tiny script to populate dynamic year in footer
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('landingFooterYear');
  if (el) el.textContent = new Date().getFullYear();
});

// privacy / terms
  const privacyContent = `
  <p><strong>Last updated:</strong> ${new Date().getFullYear()}</p>

  <p>
    At <strong>AIFS</strong>, your privacy is important to us. This website is designed
    to help users discover AI tools without collecting unnecessary personal data.
  </p>

  <p>
    <strong>Information We Collect</strong><br>
    We do not collect personal information such as name, email, or phone number.
    Any data entered into the search bar is processed locally for functionality only.
  </p>

  <p>
    <strong>Third-Party Links</strong><br>
    Our website may contain links to third-party AI tools. We are not responsible
    for their privacy practices or content.
  </p>

  <p>
    <strong>Cookies</strong><br>
    AIFS does not use tracking cookies. Basic browser storage may be used
    to improve user experience (such as history suggestions).
  </p>

  <p>
    <strong>Updates</strong><br>
    This policy may be updated occasionally. Continued use of the site
    means you accept the changes.
  </p>
  `;

  const termsContent = `
  <p><strong>Last updated:</strong> ${new Date().getFullYear()}</p>

  <p>
    By accessing and using <strong>AIFS</strong>, you agree to the following terms
    and conditions.
  </p>

  <p>
    <strong>Use of the Website</strong><br>
    AIFS is provided for informational purposes only. You may not misuse
    the content or attempt to disrupt the service.
  </p>

  <p>
    <strong>Accuracy of Information</strong><br>
    We strive to keep AI tool information accurate, but we do not guarantee
    completeness or correctness.
  </p>

  <p>
    <strong>External Links</strong><br>
    We are not responsible for any loss or damage caused by third-party websites
    linked from AIFS.
  </p>

  <p>
    <strong>Limitation of Liability</strong><br>
    AIFS is not liable for any direct or indirect damages resulting from the use
    of this website.
  </p>
  `;

  function openPolicy(type) {
    const modal = document.getElementById("policyModal");
    const title = document.getElementById("policyTitle");
    const content = document.getElementById("policyContent");

    if (type === "privacy") {
      title.innerText = "Privacy Policy";
      content.innerHTML = privacyContent;
    } else {
      title.innerText = "Terms & Conditions";
      content.innerHTML = termsContent;
    }

    modal.classList.remove("hidden");
  }

  function closePolicy() {
    document.getElementById("policyModal").classList.add("hidden");
  }
