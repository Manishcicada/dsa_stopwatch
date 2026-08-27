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
  startTime: null,   // epoch ms when current run began
  elapsed: 0,         // accumulated ms while paused/stopped
  problemName: "",
  sessions: [],        // {name, ms, date}
};

let tickHandle = null;

function fmt(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function currentElapsed() {
  return state.elapsed + (state.running ? Date.now() - state.startTime : 0);
}

function render() {
  els.timer.textContent = fmt(currentElapsed());
  els.timer.classList.toggle("running", state.running);
  els.startPause.textContent = state.running ? "Pause" : "Start";
  els.startPause.classList.toggle("running", state.running);
  els.name.value = state.problemName;
  els.name.disabled = state.running || currentElapsed() > 0;
  els.save.disabled = currentElapsed() === 0;

  const todayStr = new Date().toDateString();
  const todayMs = state.sessions
    .filter(s => new Date(s.date).toDateString() === todayStr)
    .reduce((sum, s) => sum + s.ms, 0);
  els.today.textContent = `Today: ${fmt(todayMs)}`;

  if (state.sessions.length === 0) {
    els.list.innerHTML = `<li class="empty">No sessions logged yet</li>`;
  } else {
    els.list.innerHTML = state.sessions
      .slice()
      .reverse()
      .map(s => `<li><span class="s-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name || "Untitled")}</span><span class="s-time">${fmt(s.ms)}</span></li>`)
      .join("");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

function save() {
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

function startTick() {
  if (tickHandle) return;
  tickHandle = setInterval(render, 250);
}
function stopTick() {
  clearInterval(tickHandle);
  tickHandle = null;
}

function load() {
  chrome.storage.local.get(STORAGE_KEY, data => {
    if (data && data[STORAGE_KEY]) {
      state = Object.assign(state, data[STORAGE_KEY]);
    }
    render();
    if (state.running) startTick();
  });
}

els.startPause.addEventListener("click", () => {
  if (state.running) {
    // pause
    state.elapsed += Date.now() - state.startTime;
    state.startTime = null;
    state.running = false;
    stopTick();
  } else {
    // start / resume
    state.problemName = els.name.value.trim();
    state.startTime = Date.now();
    state.running = true;
    startTick();
  }
  save();
  render();
});

els.reset.addEventListener("click", () => {
  state.running = false;
  state.startTime = null;
  state.elapsed = 0;
  stopTick();
  save();
  render();
});

els.save.addEventListener("click", () => {
  const ms = currentElapsed();
  if (ms === 0) return;
  const name = els.name.value.trim() || state.problemName;
  state.sessions.push({ name, ms, date: new Date().toISOString() });
  state.running = false;
  state.startTime = null;
  state.elapsed = 0;
  state.problemName = "";
  els.name.value = "";
  stopTick();
  save();
  render();
});

els.clear.addEventListener("click", () => {
  if (!confirm("Clear all logged sessions? This can't be undone.")) return;
  state.sessions = [];
  save();
  render();
});

els.export.addEventListener("click", () => {
  if (state.sessions.length === 0) return;
  const rows = [["Problem", "Duration (h:m:s)", "Duration (seconds)", "Date"]];
  state.sessions.forEach(s => {
    rows.push([s.name || "Untitled", fmt(s.ms), Math.round(s.ms / 1000), s.date]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dsa-stopwatch-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

load();
