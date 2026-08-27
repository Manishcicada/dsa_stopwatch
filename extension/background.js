const STORAGE_KEY = "dsaStopwatchState";
const ALARM_NAME = "dsa-stopwatch-badge-tick";

function fmtBadge(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${m}`;
}

function refreshBadge() {
  chrome.storage.local.get(STORAGE_KEY, data => {
    const state = data[STORAGE_KEY];
    if (!state) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }
    if (state.running) {
      const elapsed = state.elapsed + (Date.now() - state.startTime);
      chrome.action.setBadgeText({ text: fmtBadge(elapsed) });
      chrome.action.setBadgeBackgroundColor({ color: "#4ade80" });
      chrome.alarms.create(ALARM_NAME, { delayInMinutes: 1 / 60 * 15 });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  });
}

chrome.storage.onChanged.addListener(changes => {
  if (changes[STORAGE_KEY]) refreshBadge();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_NAME) refreshBadge();
});

chrome.runtime.onStartup.addListener(refreshBadge);
chrome.runtime.onInstalled.addListener(refreshBadge);
