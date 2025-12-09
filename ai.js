// ai.js
// Supports:
//  - comma-separated queries: "email, captions"
//  - key:filter queries: "email:flowrite"
//  - aiData values can be an object OR an array of objects
// Edit aiData to add/remove entries. If you want multiple entries under same key,
// make the value an array of objects.

const aiData = {
  "email": [
    {
      "name": "Flowrite",
      "icon": "✉️",
      "status": "Popular",
      "description": "AI-powered email and messaging assistant to write professional text quickly."
    },
    {
      "name": "LoveAB Mail",
      "icon": "📧",
      "status": "Beta",
      "description": "Fast email generation for startups."
    }
  ],
  "website": {
    "name": "Bolt / Loveable",
    "icon": "🌐",
    "status": "Tooling",
    "description": "Website builders and landing page creation tools."
  },
  "presentation": {
    "name": "Gamma",
    "icon": "📊",
    "status": "Popular",
    "description": "Create beautiful presentations using AI templates."
  },
  "socialmedia_campaigns": {
    "name": "Ocoya",
    "icon": "📣",
    "status": "Active",
    "description": "AI content & scheduling for social media campaigns."
  },
  "captions": {
    "name": "Copy.ai",
    "icon": "✍️",
    "status": "Popular",
    "description": "Generate short-form copy like captions, CTAs and taglines."
  }
  // Add or change entries here.
};

// ---------------------- UI logic ----------------------
(function () {
  const searchBox = document.getElementById("searchBox");
  const searchBtn  = document.getElementById("searchBtn");
  const resultBox  = document.getElementById("resultBox");
  const tableBody  = document.getElementById("tableBody");

  function clearTable() {
    tableBody.innerHTML = "";
  }

  function createRow(key, entry) {
    const row = document.createElement("div");
    row.className = "grid grid-cols-12 gap-4 px-3 py-4 items-center";

    // Name
    const nameCol = document.createElement("div");
    nameCol.className = "col-span-3";
    const title = document.createElement("div");
    title.className = "font-semibold";
    title.innerText = entry.name || key;
    const sub = document.createElement("div");
    sub.className = "text-xs text-gray-300 truncate";
    sub.innerText = key;
    nameCol.appendChild(title);
    nameCol.appendChild(sub);

    // Icon
    const iconCol = document.createElement("div");
    iconCol.className = "col-span-1 text-2xl text-center";
    if (entry.icon && (entry.icon.startsWith('http://') || entry.icon.startsWith('https://'))) {
      const img = document.createElement('img');
      img.src = entry.icon;
      img.alt = entry.name || key;
      img.className = 'w-8 h-8 rounded inline-block';
      iconCol.appendChild(img);
    } else {
      iconCol.innerText = entry.icon || '—';
    }

    // Status
    const statusCol = document.createElement("div");
    statusCol.className = "col-span-2";
    const badge = document.createElement('span');
    badge.className = 'inline-block px-3 py-1 text-xs rounded-full';
    badge.innerText = entry.status || 'Unknown';
    const sLower = (entry.status || '').toLowerCase();
    if (sLower.includes('popular') ) badge.classList.add('bg-green-700/60');
    else if (sLower.includes('beta') ) badge.classList.add('bg-yellow-700/60');
    else badge.classList.add('bg-gray-800/60');
    statusCol.appendChild(badge);

    // Description
    const descCol = document.createElement("div");
    descCol.className = "col-span-6 text-sm text-gray-200";
    descCol.innerText = entry.description || '—';

    row.appendChild(nameCol);
    row.appendChild(iconCol);
    row.appendChild(statusCol);
    row.appendChild(descCol);

    return row;
  }

  function showResults(entries) {
    clearTable();
    if (!entries || entries.length === 0) {
      tableBody.innerHTML = '<div class="px-3 py-4 text-center text-red-400">No results found.</div>';
    } else {
      entries.forEach(({key, entry}) => {
        tableBody.appendChild(createRow(key, entry));
      });
    }
    resultBox.classList.remove('hidden');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // normalize to array of objects: [{key, entry}, ...]
  function collectFromKey(key, filter) {
    const found = [];
    const lowerFilter = filter ? filter.toLowerCase() : null;

    // exact key in aiData
    if (Object.prototype.hasOwnProperty.call(aiData, key)) {
      const val = aiData[key];
      const list = Array.isArray(val) ? val : [val];
      list.forEach(item => {
        if (!lowerFilter) {
          found.push({ key, entry: item });
        } else {
          // match against entry fields
          const name = (item.name || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          if (name.includes(lowerFilter) || desc.includes(lowerFilter) || key.includes(lowerFilter)) {
            found.push({ key, entry: item });
          }
        }
      });
      return found;
    }

    // fallback: search across all keys (substring match)
    const entries = Object.entries(aiData);
    entries.forEach(([k, v]) => {
      const list = Array.isArray(v) ? v : [v];
      list.forEach(item => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        // if user provided a filter, require it to match; otherwise match by key
        if (lowerFilter) {
          // try matching both key and entry fields to the filter
          if (k.includes(lowerFilter) || name.includes(lowerFilter) || desc.includes(lowerFilter)) {
            found.push({ key: k, entry: item });
          }
        } else {
          // no filter -> match by key substring
          if (k.includes(key) || name.includes(key) || desc.includes(key)) {
            found.push({ key: k, entry: item });
          }
        }
      });
    });

    return found;
  }

  // parse input and return unique list of results
  function parseAndSearch(input) {
    if (!input) return [];
    // split by comma but allow commas inside urls? user case is simple - split on commas
    const parts = input.split(',').map(p => p.trim()).filter(Boolean);
    const results = [];
    const seen = new Set();

    parts.forEach(part => {
      // accept formats: "key" or "key:filter" (only first ':' used)
      let key = part;
      let filter = null;
      if (part.includes(':')) {
        const idx = part.indexOf(':');
        key = part.slice(0, idx).trim().toLowerCase();
        filter = part.slice(idx + 1).trim();
      } else {
        key = part.toLowerCase();
      }

      const collected = collectFromKey(key, filter);
      collected.forEach(({key: k, entry}) => {
        // create a unique id for de-duping: use key + name
        const id = `${k}::${(entry.name || '').toLowerCase()}`;
        if (!seen.has(id)) {
          seen.add(id);
          results.push({ key: k, entry });
        }
      });
    });

    return results;
  }

  // SEARCH HANDLER
  searchBtn.addEventListener('click', () => {
    const raw = searchBox.value.trim();
    if (!raw) return;
    const matches = parseAndSearch(raw);
    showResults(matches);
  });

  searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn.click();
    }
  });

  // debug
  window._aiData = aiData;
  window._parseAndSearch = parseAndSearch; // expose for quick console tests
})();
