// docs/logic/ledger.js
// Simple local ledger for GoalGuard (saves/spends), stored in localStorage.

function key(userId) {
  return `goalguard_ledger_${userId}`;
}

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function readLedger(userId) {
  if (!userId) return [];
  const raw = localStorage.getItem(key(userId));
  const items = raw ? safeParse(raw, []) : [];
  return Array.isArray(items) ? items : [];
}

export function writeLedger(userId, entries) {
  if (!userId) return;
  localStorage.setItem(key(userId), JSON.stringify(entries || []));
}

export function addLedgerEntry(userId, entry) {
  const entries = readLedger(userId);

  const e = {
    id: entry?.id || crypto.randomUUID(),
    ts: entry?.ts || Date.now(),
    dateISO: entry?.dateISO || new Date().toISOString(),
    type: entry?.type || "spend", // "save" | "spend"
    amount: Number(entry?.amount) || 0,
    currencyCode: entry?.currencyCode || "USD",
    goalId: entry?.goalId || null,
    note: entry?.note || "",
    meta: entry?.meta || {}
  };

  entries.unshift(e);
  writeLedger(userId, entries);
  return e;
}

export function deleteLedgerEntry(userId, entryId) {
  const entries = readLedger(userId);
  const next = entries.filter(e => e.id !== entryId);
  writeLedger(userId, next);
  return next;
}

export function summarizeLedger(userId) {
  const entries = readLedger(userId);
  let saved = 0;
  let spent = 0;

  for (const e of entries) {
    const amt = Number(e.amount) || 0;
    if (e.type === "save") saved += amt;
    if (e.type === "spend") spent += amt;
  }

  return {
    count: entries.length,
    saved,
    spent,
    net: saved - spent,
    entries
  };
}

// Build a daily series of cumulative net (save - spend) for last N days.
// Good for a simple line chart.
export function buildDailyNetSeries(userId, days = 30) {
  const entries = readLedger(userId);

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  // Map dayKey -> net change that day
  const deltaByDay = new Map();

  for (const e of entries) {
    const d = new Date(e.dateISO || e.ts || Date.now());
    d.setHours(0, 0, 0, 0);

    if (d < start) continue;

    const dayKey = d.toISOString().slice(0, 10);
    const amt = Number(e.amount) || 0;
    const delta = e.type === "save" ? amt : e.type === "spend" ? -amt : 0;

    deltaByDay.set(dayKey, (deltaByDay.get(dayKey) || 0) + delta);
  }

  // Build ordered days
  const series = [];
  let cum = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayKey = d.toISOString().slice(0, 10);
    cum += (deltaByDay.get(dayKey) || 0);
    series.push({ dayKey, cumNet: cum });
  }

  return series;
}