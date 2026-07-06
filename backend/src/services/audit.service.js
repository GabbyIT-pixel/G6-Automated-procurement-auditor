/**
 * Audit Engine — the analytical core of the system.
 *
 * Compares an awarded contract unit price against the KEMSA market benchmark,
 * computes the price variance and classifies it into a risk level. This module
 * is intentionally PURE (no database, no I/O) so the price logic can be unit
 * tested in isolation. The controller layer supplies the numbers and persists
 * the result.
 *
 * Risk bands (architecture diagram, data-flow #6):
 *   variance < 15%     -> Low
 *   15% <= variance <40 -> Medium
 *   40% <= variance <=100 -> High
 *   variance > 100%    -> Critical
 *
 * A fraud alert is raised for Medium risk and above (data-flow #7).
 */

const RISK = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
});

/**
 * Percentage difference of the awarded price above the benchmark.
 * Positive = overpriced (potential inflation); negative = under benchmark.
 * @returns {number} variance percentage rounded to 2 decimals
 */
function computeVariance(awardedUnitPrice, referencePriceKes) {
  const awarded = Number(awardedUnitPrice);
  const reference = Number(referencePriceKes);

  if (!Number.isFinite(awarded) || !Number.isFinite(reference)) {
    throw new Error("computeVariance requires finite numeric inputs");
  }
  if (reference <= 0) {
    throw new Error("referencePriceKes must be greater than zero");
  }

  const variance = ((awarded - reference) / reference) * 100;
  return Math.round(variance * 100) / 100;
}

/**
 * Map a variance percentage to a risk level. Only overpricing escalates risk;
 * prices at or below the benchmark are Low risk.
 */
function classifyRisk(variancePct) {
  const v = Number(variancePct);
  if (!Number.isFinite(v)) {
    throw new Error("classifyRisk requires a finite number");
  }
  if (v < 15) return RISK.LOW;
  if (v < 40) return RISK.MEDIUM;
  if (v <= 100) return RISK.HIGH;
  return RISK.CRITICAL;
}

/** Whether a risk level warrants an auto-generated fraud alert. */
function shouldFlag(riskLevel) {
  return (
    riskLevel === RISK.MEDIUM ||
    riskLevel === RISK.HIGH ||
    riskLevel === RISK.CRITICAL
  );
}

/**
 * Run the full audit for a single contract line.
 * @returns {{ variancePct: number, riskLevel: string, flagged: boolean }}
 */
function runAudit(awardedUnitPrice, referencePriceKes) {
  const variancePct = computeVariance(awardedUnitPrice, referencePriceKes);
  const riskLevel = classifyRisk(variancePct);
  return { variancePct, riskLevel, flagged: shouldFlag(riskLevel) };
}

module.exports = {
  RISK,
  computeVariance,
  classifyRisk,
  shouldFlag,
  runAudit,
};
