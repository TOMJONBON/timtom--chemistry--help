import { describe, expect, it } from "vitest";
import { composition, molarMass, parseFormula } from "../src/elements";
import { gradeNumeric } from "../src/grading";
import {
  beerLambert,
  dilution,
  gasLaw,
  gibbs,
  halfLife,
  limitingReagent,
  percentYield,
} from "../src/lib/calc";

describe("formula parsing and molar mass", () => {
  it("parses nested parentheses", () => {
    expect(parseFormula("Ca(NO3)2")).toEqual({ Ca: 1, N: 2, O: 6 });
  });

  it("computes a molar mass", () => {
    expect(molarMass("Ca(NO3)2")).toBeCloseTo(164.086, 2);
  });

  it("handles hydrates", () => {
    expect(molarMass("CuSO4·5H2O")).toBeCloseTo(249.68, 1);
  });

  it("rejects unknown symbols", () => {
    expect(Number.isNaN(molarMass("Xx2"))).toBe(true);
  });

  it("reports composition percentages that sum to 100", () => {
    const parts = composition("Ca(NO3)2");
    expect(parts).not.toBeNull();
    const sum = (parts ?? []).reduce((total, part) => total + part.pct, 0);
    expect(sum).toBeCloseTo(100, 6);
  });
});

describe("numeric grading", () => {
  it("accepts scientific notation", () => {
    expect(gradeNumeric("1.5e3", { expectedAnswer: 1500 }).ok).toBe(true);
  });

  it("accepts units when supplied", () => {
    expect(gradeNumeric("2.0 M", { expectedAnswer: 2, acceptableUnits: ["M"] }).ok).toBe(true);
  });

  it("flags a right number with the wrong unit", () => {
    const result = gradeNumeric("2.0 g", { expectedAnswer: 2, acceptableUnits: ["M"] });
    expect(result.ok).toBe(false);
    expect(result.note).toMatch(/units/i);
  });

  it("respects tolerance", () => {
    expect(gradeNumeric("100.5", { expectedAnswer: 100, tolerance: 0.01 }).ok).toBe(true);
    expect(gradeNumeric("102", { expectedAnswer: 100, tolerance: 0.01 }).ok).toBe(false);
  });
});

describe("calculators", () => {
  it("solves the ideal gas law for volume", () => {
    const result = gasLaw({ p: 1, n: 1, t: 273 }, "v");
    expect(result?.value).toBeCloseTo(22.4, 1);
  });

  it("computes Gibbs free energy and spontaneity", () => {
    const result = gibbs(-92.2, -198.7, 25);
    expect(result.deltaG).toBeCloseTo(-32.96, 1);
    expect(result.spontaneous).toBe(true);
  });

  it("solves dilution", () => {
    expect(dilution(2, 0.05, undefined, 0.5)?.value).toBeCloseTo(0.2, 6);
  });

  it("computes half-life remaining mass", () => {
    expect(halfLife(5730, 100, 11460).remaining).toBeCloseTo(25, 6);
  });

  it("computes percent yield", () => {
    expect(percentYield(8.5, 10).value).toBeCloseTo(85, 6);
  });

  it("solves Beer–Lambert for concentration", () => {
    expect(beerLambert(0.35, 1250, 1)?.value).toBeCloseTo(0.00028, 6);
  });

  it("finds the limiting reactant", () => {
    const result = limitingReagent([
      { moles: 3, coefficient: 1, label: "A" },
      { moles: 2, coefficient: 2, label: "B" },
    ]);
    expect(result?.limiting.label).toBe("B");
  });
});
