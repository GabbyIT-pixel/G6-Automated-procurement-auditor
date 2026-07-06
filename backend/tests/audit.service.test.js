const audit = require("../src/services/audit.service");

describe("audit.service.computeVariance", () => {
  test("computes positive variance for an overpriced contract", () => {
    // awarded 4500 vs benchmark 450 -> 900% over
    expect(audit.computeVariance(4500, 450)).toBe(900);
  });

  test("returns 0 when awarded equals benchmark", () => {
    expect(audit.computeVariance(500, 500)).toBe(0);
  });

  test("returns a negative variance when under the benchmark", () => {
    expect(audit.computeVariance(450, 500)).toBe(-10);
  });

  test("rounds to two decimal places", () => {
    expect(audit.computeVariance(575, 500)).toBe(15);
    expect(audit.computeVariance(533.33, 500)).toBe(6.67);
  });

  test("throws on a non-positive benchmark", () => {
    expect(() => audit.computeVariance(100, 0)).toThrow();
  });

  test("throws on non-numeric input", () => {
    expect(() => audit.computeVariance("abc", 500)).toThrow();
  });
});

describe("audit.service.classifyRisk", () => {
  test.each([
    [0, "Low"],
    [14.99, "Low"],
    [15, "Medium"],
    [39.99, "Medium"],
    [40, "High"],
    [100, "High"],
    [100.01, "Critical"],
    [900, "Critical"],
    [-25, "Low"],
  ])("variance %p -> %p", (variance, expected) => {
    expect(audit.classifyRisk(variance)).toBe(expected);
  });
});

describe("audit.service.shouldFlag", () => {
  test("does not flag Low risk", () => {
    expect(audit.shouldFlag("Low")).toBe(false);
  });
  test("flags Medium, High and Critical", () => {
    expect(audit.shouldFlag("Medium")).toBe(true);
    expect(audit.shouldFlag("High")).toBe(true);
    expect(audit.shouldFlag("Critical")).toBe(true);
  });
});

describe("audit.service.runAudit", () => {
  test("normal price near benchmark -> Low, not flagged", () => {
    const r = audit.runAudit(520, 500);
    expect(r).toEqual({ variancePct: 4, riskLevel: "Low", flagged: false });
  });

  test("grossly inflated price -> Critical, flagged", () => {
    const r = audit.runAudit(4500, 450);
    expect(r.riskLevel).toBe("Critical");
    expect(r.flagged).toBe(true);
    expect(r.variancePct).toBe(900);
  });
});
