const STORAGE_KEY = "dsaStopwatchState";

const els = {
  name: document.getElementById("problemName"),
  timer: document.getElementById("timerDisplay"),
  startPause: document.getElementById("startPauseBtn"),
  reset: document.getElementById("resetBtn"),
  save: document.getElementById("saveBtn"),
  today: document.getElementById("todayTotal"),
  export: document.getElementById("exportBtn"),
  clear: document.getElementById("clearBtn"),
  list: document.getElementById("sessionList"),
};

let state = {
  running: false,
  startTime: null,
  elapsed: 0,
  problemName: "",
  sessions: [],
};

let tickHandle = null;
let loaded = false;


// ------------------------------------------------------------
// Formatting
// ------------------------------------------------------------

function fmt(ms) {
  const totalSec = Math.floor(ms / 1000);

  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");

  return `${h}:${m}:${s}`;
}


function currentElapsed() {
  if (!state.running || !state.startTime) {
    return state.elapsed;
  }

  return state.elapsed + (Date.now() - state.startTime);
}


// ------------------------------------------------------------
// Storage
// ------------------------------------------------------------

async function save() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEY]: state,
    });
  } catch (error) {
    console.error("Failed to save stopwatch state:", error);
  }
}


async function load() {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEY);

    if (data && data[STORAGE_KEY]) {
      state = {
        ...state,
        ...data[STORAGE_KEY],
      };
    }

    loaded = true;

    render();

    if (state.running) {
      startTick();
    }
  } catch (error) {
    console.error("Failed to load stopwatch state:", error);

    loaded = true;
    render();
  }
}


// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------

function render() {
  const elapsed = currentElapsed();

  els.timer.textContent = fmt(elapsed);

  els.timer.classList.toggle(
    "running",
    state.running
  );

  els.startPause.textContent =
    state.running ? "Pause" : "Start";

  els.startPause.classList.toggle(
    "running",
    state.running
  );

  els.name.value = state.problemName;

  els.name.disabled =
    state.running || elapsed > 0;

  els.save.disabled =
    elapsed === 0;

  // ----------------------------------------------------------
  // Today's total
  // ----------------------------------------------------------

  const todayStr = new Date().toDateString();

  const todayMs = state.sessions
    .filter(session => {
      return new Date(session.date).toDateString() === todayStr;
    })
    .reduce((sum, session) => {
      return sum + Number(session.ms || 0);
    }, 0);

  els.today.textContent =
    `Today: ${fmt(todayMs)}`;


  // ----------------------------------------------------------
  // Session list
  // ----------------------------------------------------------

  if (state.sessions.length === 0) {
    els.list.innerHTML =
      `<li class="empty">No sessions logged yet</li>`;

    return;
  }

  els.list.innerHTML = state.sessions
    .slice()
    .reverse()
    .map(session => {
      const name = escapeHtml(
        session.name || "Untitled"
      );

      return `
        <li>
          <span
            class="s-name"
            title="${name}"
          >
            ${name}
          </span>

          <span class="s-time">
            ${fmt(Number(session.ms || 0))}
          </span>
        </li>
      `;
    })
    .join("");
}


function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]
  );
}


// ------------------------------------------------------------
// Timer
// ------------------------------------------------------------

function startTick() {
  if (tickHandle) {
    return;
  }

  tickHandle = setInterval(() => {
    render();
  }, 250);
}


function stopTick() {
  if (!tickHandle) {
    return;
  }

  clearInterval(tickHandle);
  tickHandle = null;
}


// ------------------------------------------------------------
// Start / Pause
// ------------------------------------------------------------

els.startPause.addEventListener(
  "click",
  async () => {

    if (!loaded) {
      return;
    }

    if (state.running) {

      // Pause
      state.elapsed +=
        Date.now() - state.startTime;

      state.startTime = null;
      state.running = false;

      stopTick();

    } else {

      // Start / Resume
      state.problemName =
        els.name.value.trim();

      state.startTime = Date.now();
      state.running = true;

      startTick();
    }

    await save();

    render();
  }
);


// ------------------------------------------------------------
// Reset current stopwatch
// ------------------------------------------------------------

els.reset.addEventListener(
  "click",
  async () => {

    if (!loaded) {
      return;
    }

    state.running = false;
    state.startTime = null;
    state.elapsed = 0;

    stopTick();

    await save();

    render();
  }
);


// ------------------------------------------------------------
// Save session
// ------------------------------------------------------------

els.save.addEventListener(
  "click",
  async () => {

    if (!loaded) {
      return;
    }

    const ms = currentElapsed();

    if (ms <= 0) {
      return;
    }

    const name =
      els.name.value.trim() ||
      state.problemName ||
      "Untitled";

    state.sessions.push({
      name,
      ms,
      date: new Date().toISOString(),
    });

    state.running = false;
    state.startTime = null;
    state.elapsed = 0;
    state.problemName = "";

    stopTick();

    await save();

    els.name.value = "";

    render();
  }
);


// ------------------------------------------------------------
// Clear all sessions
// ------------------------------------------------------------

els.clear.addEventListener(
  "click",
  async () => {

    if (!loaded) {
      return;
    }

    if (state.sessions.length === 0) {
      return;
    }

    // Safari extension popups can behave differently from
    // normal webpages with window.confirm().
    //
    // For now, clicking Clear Logs directly clears the history.

    state.sessions = [];

    await save();

    render();
  }
);


// ------------------------------------------------------------
// CSV generation
// ------------------------------------------------------------

function csvEscape(value) {
  return `"${String(value)
    .replace(/"/g, '""')}"`;
}


function createCSV() {

  const rows = [
    [
      "Problem",
      "Duration (h:m:s)",
      "Duration (seconds)",
      "Date",
    ],
  ];

  state.sessions.forEach(session => {

    const milliseconds =
      Number(session.ms || 0);

    rows.push([
      session.name || "Untitled",
      fmt(milliseconds),
      Math.round(milliseconds / 1000),
      session.date,
    ]);
  });

  return rows
    .map(row => {
      return row
        .map(csvEscape)
        .join(",");
    })
    .join("\r\n");
}


// ------------------------------------------------------------
// Export CSV
// ------------------------------------------------------------

els.export.addEventListener(
  "click",
  async () => {

    if (!loaded) {
      return;
    }

    if (state.sessions.length === 0) {
      return;
    }

    try {

      const csv = createCSV();

      // UTF-8 BOM helps Numbers / Excel recognize UTF-8 CSV.
      const csvWithBom =
        "\uFEFF" + csv;

      const dataUrl =
        "data:text/csv;charset=utf-8," +
        encodeURIComponent(csvWithBom);

      const filename =
        `dsa-stopwatch-sessions-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

      /*
       * Safari extension popups don't reliably behave like
       * normal webpages when programmatically downloading
       * Blob URLs.
       *
       * Opening the generated CSV in a Safari tab lets Safari
       * handle the file normally.
       */

      await chrome.tabs.create({
        url: dataUrl,
      });

      console.log(
        `CSV generated: ${filename}`
      );

    } catch (error) {

      console.error(
        "Failed to export CSV:",
        error
      );
    }
  }
);


// ------------------------------------------------------------
// Start
// ------------------------------------------------------------

load();
