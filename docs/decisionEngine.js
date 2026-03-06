// docs/logic/decisionEngine.js
export function evaluatePurchase({ price, profile }) {
  const currency = profile.currencyCode || "USD";
  const income = Number(profile.incomeMonthly) || 0;
  const expenses = Number(profile.expensesMonthly) || 0;
  const surplus = income - expenses;

  const fmt = (n) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${Number(n).toLocaleString()} ${currency}`;
    }
  };

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, message: "Enter a valid purchase amount." };
  }

  if (surplus <= 0) {
    return {
      ok: false,
      message: `You currently have no monthly surplus (surplus: ${fmt(surplus)}). This purchase is NOT recommended.`
    };
  }

  // Simple local “AI mind” rule:
  // - If purchase <= 20% of monthly surplus => OK
  // - If <= 50% => caution
  // - else => not recommended
  const pct = price / surplus;

  if (pct <= 0.2) {
    return {
      ok: true,
      message: `✅ Safe: ${fmt(price)} is about ${(pct * 100).toFixed(0)}% of your monthly surplus (${fmt(surplus)}).`
    };
  }

  if (pct <= 0.5) {
    return {
      ok: true,
      message: `⚠️ Caution: ${fmt(price)} is about ${(pct * 100).toFixed(0)}% of your monthly surplus (${fmt(surplus)}). You can buy it, but it may slow goal progress.`
    };
  }

  return {
    ok: false,
    message: `❌ Not recommended: ${fmt(price)} is about ${(pct * 100).toFixed(0)}% of your monthly surplus (${fmt(surplus)}). This is likely to impact your goals.`
  };
}