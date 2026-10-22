import { composition, molarMass } from "../elements";

export type Result = { value: number; unit: string; note?: string; extra?: { label: string; value: string }[] };

export const R_LATM = 0.08206;
export const R_J = 8.314;

export function molarMassResult(formula: string): Result | null {
  const mass = molarMass(formula);
  const parts = composition(formula);
  if (!Number.isFinite(mass) || !parts) return null;
  return {
    value: mass,
    unit: "g/mol",
    extra: parts.slice(0, 8).map((part) => ({
      label: `${part.sym} × ${part.count}`,
      value: `${part.pct.toFixed(1)}% · ${part.mass.toFixed(2)} g`,
    })),
  };
}

export function phFromConcentration(concentration: number) {
  if (!(concentration > 0)) return null;
  const ph = -Math.log10(concentration);
  return { ph, poh: 14 - ph, h: concentration, oh: 1e-14 / concentration };
}

export function concentrationFromPh(ph: number) {
  return { h: 10 ** -ph, oh: 10 ** -(14 - ph), poh: 14 - ph };
}

export function gibbs(deltaH: number, deltaS: number, celsius: number) {
  const kelvin = celsius + 273.15;
  const deltaG = deltaH - kelvin * (deltaS / 1000);
  return {
    deltaG,
    kelvin,
    spontaneous: deltaG < 0,
    note:
      deltaG < 0
        ? "Spontaneous at this temperature (ΔG < 0)."
        : deltaG > 0
          ? "Non-spontaneous at this temperature (ΔG > 0)."
          : "At equilibrium (ΔG = 0).",
  };
}

export function gasLaw(inputs: { p?: number; v?: number; n?: number; t?: number }, solve: "p" | "v" | "n" | "t") {
  const { p, v, n, t } = inputs;
  if (solve === "p" && v && n && t) return { value: (n * R_LATM * t) / v, unit: "atm" };
  if (solve === "v" && p && n && t) return { value: (n * R_LATM * t) / p, unit: "L" };
  if (solve === "n" && p && v && t) return { value: (p * v) / (R_LATM * t), unit: "mol" };
  if (solve === "t" && p && v && n) return { value: (p * v) / (n * R_LATM), unit: "K" };
  return null;
}

export function dilution(m1: number, v1: number, m2?: number, v2?: number) {
  if (m2 === undefined && v2) return { value: (m1 * v1) / v2, unit: "M" };
  if (v2 === undefined && m2) return { value: (m1 * v1) / m2, unit: "L" };
  if (m1 && v1 && m2 && v2) return { value: m1 * v1 - m2 * v2, unit: "mol difference" };
  return null;
}

export function calorimetry(mass: number, specificHeat: number, deltaT: number) {
  return { value: mass * specificHeat * deltaT, unit: "J", kj: (mass * specificHeat * deltaT) / 1000 };
}

export function beerLambert(absorbance?: number, molarAbsorptivity?: number, pathLength?: number, concentration?: number) {
  if (absorbance !== undefined && molarAbsorptivity && pathLength) {
    return { value: absorbance / (molarAbsorptivity * pathLength), unit: "M" };
  }
  if (concentration !== undefined && molarAbsorptivity && pathLength) {
    return { value: molarAbsorptivity * pathLength * concentration, unit: "A" };
  }
  if (absorbance !== undefined && concentration && pathLength) {
    return { value: absorbance / (concentration * pathLength), unit: "M⁻¹cm⁻¹" };
  }
  return null;
}

export function halfLife(halfLifeValue: number, initial: number, elapsed: number) {
  const remaining = initial * 0.5 ** (elapsed / halfLifeValue);
  return { remaining, fraction: remaining / initial, halfLives: elapsed / halfLifeValue };
}

export function percentYield(actual: number, theoretical: number) {
  return { value: (actual / theoretical) * 100, unit: "%" };
}

export function stoichiometry(input: {
  massA: number;
  molarMassA: number;
  coefficientA: number;
  coefficientB: number;
  molarMassB: number;
}) {
  const molesA = input.massA / input.molarMassA;
  const molesB = molesA * (input.coefficientB / input.coefficientA);
  const massB = molesB * input.molarMassB;
  return { molesA, molesB, massB };
}

export function limitingReagent(
  reactants: { moles: number; coefficient: number; label: string }[],
) {
  if (reactants.length < 2) return null;
  const ratios = reactants.map((reactant) => ({
    ...reactant,
    ratio: reactant.moles / reactant.coefficient,
  }));
  const limiting = ratios.reduce((min, row) => (row.ratio < min.ratio ? row : min));
  return { limiting, ratios };
}
