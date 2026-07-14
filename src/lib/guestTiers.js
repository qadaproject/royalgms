// Internal tier classification for guests — NEVER used in outgoing communications.
// Tier 1 = Diplomatic / Royals
// Tier 2 = Federal / Traditional / Chiefs / State
// Tier 3 = Corporate / General / Socials / Communities

const TIER_MAP = {
  "A - Royal": "Tier 1",
  "E - Diplomatic": "Tier 1",
  "B - Federal": "Tier 2",
  "C - State": "Tier 2",
  "F - Traditional": "Tier 2",
  "J - Chiefs": "Tier 2",
  "D - Corporate": "Tier 3",
  "G - General": "Tier 3",
  "H - Socials": "Tier 3",
  "I - Communities": "Tier 3",
};

export const TIERS = ["Tier 1", "Tier 2", "Tier 3"];

export const TIER_LABELS = {
  "Tier 1": "Tier 1 — Diplomatic / Royals",
  "Tier 2": "Tier 2 — Federal / Traditional / Chiefs / State",
  "Tier 3": "Tier 3 — Corporate / General / Socials / Communities",
};

export function getTierForCategory(category) {
  return TIER_MAP[category] || "Tier 3";
}

export const TIER_STYLES = {
  "Tier 1": "bg-amber-500/15 text-amber-700 border-amber-500/40",
  "Tier 2": "bg-violet-500/15 text-violet-700 border-violet-500/40",
  "Tier 3": "bg-sky-500/15 text-sky-700 border-sky-500/40",
};