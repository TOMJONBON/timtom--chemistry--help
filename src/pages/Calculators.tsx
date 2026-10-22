import { useMemo, useState } from "react";
import { Calculator, FlaskConical, Info } from "lucide-react";
import {
  beerLambert,
  calorimetry,
  concentrationFromPh,
  dilution,
  gasLaw,
  gibbs,
  halfLife,
  limitingReagent,
  molarMassResult,
  percentYield,
  phFromConcentration,
  stoichiometry,
} from "../lib/calc";
import { Badge, Card, PageHeader, Segmented } from "../components/ui";
import { Tex } from "../components/Tex";

type Bench = "mass" | "gas" | "solution" | "thermo" | "light";

function Num({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="flex items-center gap-2">
        <input
          className="input w-full"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {unit ? <span className="shrink-0 text-xs text-[var(--muted)]">{unit}</span> : null}
      </span>
    </label>
  );
}

function Result({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return (
    <div className="result-box">
      <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="mt-0.5 font-mono text-xl text-[var(--ink)]">
        {value} {unit ? <span className="text-sm text-[var(--muted)]">{unit}</span> : null}
      </p>
      {note ? <p className="mt-1 text-[11px] text-[var(--muted)]">{note}</p> : null}
    </div>
  );
}

const num = (value: string) => (value.trim() ? Number(value) : NaN);
const fmt = (value: number, digits = 4) =>
  Number.isFinite(value) ? value.toLocaleString(undefined, { maximumSignificantDigits: digits }) : "—";

export default function Calculators() {
  const [bench, setBench] = useState<Bench>("mass");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tool bench"
        title="Calculators"
        subtitle="Twelve small tools that show the substitution, not just the answer. Everything runs locally."
      />
      <Segmented
        label="Calculator bench"
        value={bench}
        onChange={setBench}
        options={[
          { value: "mass", label: "Moles & mass" },
          { value: "gas", label: "Gases" },
          { value: "solution", label: "Solutions" },
          { value: "thermo", label: "Thermo" },
          { value: "light", label: "Light & kinetics" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {bench === "mass" ? (
          <>
            <MolarMass />
            <Stoich />
            <Limiting />
            <Yield />
          </>
        ) : null}
        {bench === "gas" ? (
          <>
            <GasLaw />
            <Calorimetry />
          </>
        ) : null}
        {bench === "solution" ? (
          <>
            <PhTool />
            <Dilution />
            <Beer />
          </>
        ) : null}
        {bench === "thermo" ? (
          <>
            <Gibbs />
            <Calorimetry />
          </>
        ) : null}
        {bench === "light" ? (
          <>
            <Beer />
            <HalfLife />
            <Photon />
          </>
        ) : null}
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
        <Info size={14} className="mt-0.5 shrink-0" />
        These tools assume ideal behaviour, 25 °C where relevant, and standard units. Check significant figures against the
        values you were given — the calculator does not round for you.
      </p>
    </div>
  );
}

function MolarMass() {
  const [formula, setFormula] = useState("Ca(NO3)2");
  const result = useMemo(() => molarMassResult(formula), [formula]);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <FlaskConical size={17} className="text-[var(--accent)]" />
        <h2 className="font-serif text-xl">Molar mass</h2>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Supports parentheses and hydrates, e.g. CuSO4·5H2O.</p>
      <div className="mt-3">
        <Num label="Formula" value={formula} onChange={setFormula} placeholder="Ca(NO3)2" />
      </div>
      <div className="mt-3">
        <Result label="Molar mass" value={result ? fmt(result.value, 6) : "—"} unit="g/mol" note={!result && formula ? "Check the formula — an element symbol may be wrong." : undefined} />
      </div>
      {result?.extra?.length ? (
        <div className="mt-3 space-y-1.5">
          {result.extra.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-xs">
              <span className="text-[var(--muted)]">{row.label}</span>
              <span className="font-mono">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function Stoich() {
  const [massA, setMassA] = useState("10");
  const [massAM, setMassAM] = useState("44.01");
  const [coefA, setCoefA] = useState("1");
  const [coefB, setCoefB] = useState("2");
  const [massBM, setMassBM] = useState("18.02");
  const result = useMemo(() => {
    const values = [num(massA), num(massAM), num(coefA), num(coefB), num(massBM)];
    if (values.some((value) => !Number.isFinite(value) || value <= 0)) return null;
    return stoichiometry({ massA: values[0], molarMassA: values[1], coefficientA: values[2], coefficientB: values[3], molarMassB: values[4] });
  }, [massA, massAM, coefA, coefB, massBM]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Mass-to-mass stoichiometry</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">aA → bB. Enter the balanced coefficients and molar masses.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Num label="Mass of A" value={massA} onChange={setMassA} unit="g" />
        <Num label="Molar mass A" value={massAM} onChange={setMassAM} unit="g/mol" />
        <Num label="Coefficient a" value={coefA} onChange={setCoefA} />
        <Num label="Coefficient b" value={coefB} onChange={setCoefB} />
        <Num label="Molar mass B" value={massBM} onChange={setMassBM} unit="g/mol" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Result label="Moles A" value={result ? fmt(result.molesA) : "—"} unit="mol" />
        <Result label="Mass B" value={result ? fmt(result.massB) : "—"} unit="g" />
      </div>
    </Card>
  );
}

function Limiting() {
  const [a, setA] = useState("3");
  const [acoef, setACoef] = useState("1");
  const [b, setB] = useState("2");
  const [bcoef, setBCoef] = useState("2");
  const result = useMemo(() => {
    const values = [num(a), num(acoef), num(b), num(bcoef)];
    if (values.some((value) => !Number.isFinite(value) || value <= 0)) return null;
    return limitingReagent([
      { moles: values[0], coefficient: values[1], label: "Reactant A" },
      { moles: values[2], coefficient: values[3], label: "Reactant B" },
    ]);
  }, [a, acoef, b, bcoef]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Limiting reactant</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">Compare moles ÷ coefficient; the smallest ratio runs out first.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Num label="Moles A" value={a} onChange={setA} unit="mol" />
        <Num label="Coeff. A" value={acoef} onChange={setACoef} />
        <Num label="Moles B" value={b} onChange={setB} unit="mol" />
        <Num label="Coeff. B" value={bcoef} onChange={setBCoef} />
      </div>
      <div className="mt-3">
        <Result
          label="Limiting reactant"
          value={result ? result.limiting.label : "—"}
          note={result ? `Ratios: A ${result.ratios[0].ratio.toFixed(3)} · B ${result.ratios[1].ratio.toFixed(3)}` : undefined}
        />
      </div>
    </Card>
  );
}

function Yield() {
  const [actual, setActual] = useState("8.5");
  const [theoretical, setTheoretical] = useState("10");
  const result = useMemo(() => {
    if (!Number.isFinite(num(actual)) || !Number.isFinite(num(theoretical)) || num(theoretical) <= 0) return null;
    return percentYield(num(actual), num(theoretical));
  }, [actual, theoretical]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Percent yield</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Num label="Actual mass" value={actual} onChange={setActual} unit="g" />
        <Num label="Theoretical mass" value={theoretical} onChange={setTheoretical} unit="g" />
      </div>
      <div className="mt-3">
        <Result label="Yield" value={result ? `${fmt(result.value, 4)}%` : "—"} note={result && result.value > 100 ? "Above 100% usually means the product is wet or impure." : undefined} />
      </div>
    </Card>
  );
}

function GasLaw() {
  const [solve, setSolve] = useState<"p" | "v" | "n" | "t">("v");
  const [p, setP] = useState("1");
  const [v, setV] = useState("");
  const [n, setN] = useState("1");
  const [t, setT] = useState("273");
  const result = useMemo(
    () =>
      gasLaw(
        { p: num(p), v: num(v), n: num(n), t: num(t) },
        solve,
      ),
    [p, v, n, t, solve],
  );
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Ideal gas law</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">PV = nRT with R = 0.08206 L·atm/(mol·K). Leave the unknown blank.</p>
      <div className="mt-3">
        <Segmented
          label="Solve for"
          value={solve}
          onChange={setSolve}
          options={[
            { value: "p", label: "P" },
            { value: "v", label: "V" },
            { value: "n", label: "n" },
            { value: "t", label: "T" },
          ]}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Num label="Pressure" value={p} onChange={setP} unit="atm" />
        <Num label="Volume" value={v} onChange={setV} unit="L" />
        <Num label="Moles" value={n} onChange={setN} unit="mol" />
        <Num label="Temperature" value={t} onChange={setT} unit="K" />
      </div>
      <div className="mt-3">
        <Result label={`Solved ${solve.toUpperCase()}`} value={result ? fmt(result.value) : "—"} unit={result?.unit} />
      </div>
    </Card>
  );
}

function PhTool() {
  const [mode, setMode] = useState<"h" | "ph">("h");
  const [value, setValue] = useState("0.01");
  const ph = useMemo<number | null>(() => {
    const input = num(value);
    if (!Number.isFinite(input)) return null;
    if (mode === "h") return input > 0 ? -Math.log10(input) : null;
    return input;
  }, [mode, value]);
  const h = ph === null ? null : 10 ** -ph;
  const oh = ph === null ? null : 10 ** -(14 - ph);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">pH ↔ concentration</h2>
      <div className="mt-3">
        <Segmented
          label="Input"
          value={mode}
          onChange={setMode}
          options={[
            { value: "h", label: "[H⁺] in M" },
            { value: "ph", label: "pH" },
          ]}
        />
      </div>
      <div className="mt-3">
        <Num label={mode === "h" ? "Hydrogen ion concentration" : "pH"} value={value} onChange={setValue} unit={mode === "h" ? "M" : ""} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Result label="pH" value={ph !== null ? fmt(ph, 3) : "—"} />
        <Result label="pOH" value={ph !== null ? fmt(14 - ph, 3) : "—"} />
        <Result label="[H⁺]" value={h !== null ? fmt(h, 3) : "—"} unit="M" />
        <Result label="[OH⁻]" value={oh !== null ? fmt(oh, 3) : "—"} unit="M" />
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted)]">{ph !== null ? (ph < 7 ? "Acidic at 25 °C." : ph > 7 ? "Basic at 25 °C." : "Neutral at 25 °C.") : ""}</p>
    </Card>
  );
}

function Dilution() {
  const [m1, setM1] = useState("2.0");
  const [v1, setV1] = useState("0.050");
  const [m2, setM2] = useState("");
  const [v2, setV2] = useState("0.500");
  const result = useMemo(() => {
    const values = [num(m1), num(v1), num(m2), num(v2)];
    if (!Number.isFinite(values[0]) || !Number.isFinite(values[1])) return null;
    return dilution(values[0], values[1], Number.isFinite(values[2]) ? values[2] : undefined, Number.isFinite(values[3]) ? values[3] : undefined);
  }, [m1, v1, m2, v2]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Dilution</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">M₁V₁ = M₂V₂. Leave the unknown blank.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Num label="M₁" value={m1} onChange={setM1} unit="M" />
        <Num label="V₁" value={v1} onChange={setV1} unit="L" />
        <Num label="M₂" value={m2} onChange={setM2} unit="M" placeholder="unknown" />
        <Num label="V₂" value={v2} onChange={setV2} unit="L" />
      </div>
      <div className="mt-3">
        <Result label="Result" value={result ? fmt(result.value) : "—"} unit={result?.unit} />
      </div>
    </Card>
  );
}

function Gibbs() {
  const [dh, setDh] = useState("-92.2");
  const [ds, setDs] = useState("-198.7");
  const [tc, setTc] = useState("25");
  const result = useMemo(() => {
    const values = [num(dh), num(ds), num(tc)];
    if (values.some((value) => !Number.isFinite(value))) return null;
    return gibbs(values[0], values[1], values[2]);
  }, [dh, ds, tc]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Gibbs free energy</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">ΔG = ΔH − TΔS. ΔH in kJ/mol, ΔS in J/(mol·K).</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Num label="ΔH" value={dh} onChange={setDh} unit="kJ/mol" />
        <Num label="ΔS" value={ds} onChange={setDs} unit="J/mol·K" />
        <Num label="T" value={tc} onChange={setTc} unit="°C" />
      </div>
      <div className="mt-3">
        <Result label="ΔG" value={result ? fmt(result.deltaG) : "—"} unit="kJ/mol" note={result?.note} />
      </div>
    </Card>
  );
}

function Calorimetry() {
  const [mass, setMass] = useState("100");
  const [c, setC] = useState("4.184");
  const [dt, setDt] = useState("12.5");
  const result = useMemo(() => {
    const values = [num(mass), num(c), num(dt)];
    if (values.some((value) => !Number.isFinite(value))) return null;
    return calorimetry(values[0], values[1], values[2]);
  }, [mass, c, dt]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Calorimetry</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">q = mcΔT. Use the sign convention for the system you are tracking.</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Num label="Mass" value={mass} onChange={setMass} unit="g" />
        <Num label="c" value={c} onChange={setC} unit="J/g·°C" />
        <Num label="ΔT" value={dt} onChange={setDt} unit="°C" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Result label="q" value={result ? fmt(result.value) : "—"} unit="J" />
        <Result label="q" value={result ? fmt(result.kj) : "—"} unit="kJ" />
      </div>
    </Card>
  );
}

function Beer() {
  const [a, setA] = useState("0.350");
  const [epsilon, setEpsilon] = useState("1250");
  const [b, setB] = useState("1.00");
  const result = useMemo(() => {
    const values = [num(a), num(epsilon), num(b)];
    if (values.some((value) => !Number.isFinite(value))) return null;
    return beerLambert(values[0], values[1], values[2]);
  }, [a, epsilon, b]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Beer–Lambert</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">A = εbc. Solve for concentration from absorbance.</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Num label="A" value={a} onChange={setA} />
        <Num label="ε" value={epsilon} onChange={setEpsilon} unit="M⁻¹cm⁻¹" />
        <Num label="b" value={b} onChange={setB} unit="cm" />
      </div>
      <div className="mt-3">
        <Result label="Concentration" value={result ? fmt(result.value) : "—"} unit={result?.unit} />
      </div>
    </Card>
  );
}

function HalfLife() {
  const [half, setHalf] = useState("5730");
  const [initial, setInitial] = useState("100");
  const [elapsed, setElapsed] = useState("11460");
  const result = useMemo(() => {
    const values = [num(half), num(initial), num(elapsed)];
    if (values.some((value) => !Number.isFinite(value)) || values[0] <= 0) return null;
    return halfLife(values[0], values[1], values[2]);
  }, [half, initial, elapsed]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Half-life</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">First-order decay: remaining = initial × (½)^(t / t½).</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Num label="Half-life" value={half} onChange={setHalf} unit="same as t" />
        <Num label="Initial" value={initial} onChange={setInitial} />
        <Num label="Elapsed" value={elapsed} onChange={setElapsed} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Result label="Remaining" value={result ? fmt(result.remaining) : "—"} />
        <Result label="Half-lives" value={result ? fmt(result.halfLives, 3) : "—"} />
      </div>
    </Card>
  );
}

function Photon() {
  const [wavelength, setWavelength] = useState("450");
  const energy = useMemo(() => {
    const nm = num(wavelength);
    if (!Number.isFinite(nm) || nm <= 0) return null;
    return (6.626e-34 * 3e8) / (nm * 1e-9);
  }, [wavelength]);
  return (
    <Card className="p-5">
      <h2 className="font-serif text-xl">Photon energy</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">E = hc/λ. Wavelength in nm, energy in J and kJ/mol.</p>
      <div className="mt-3">
        <Num label="Wavelength" value={wavelength} onChange={setWavelength} unit="nm" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Result label="Energy per photon" value={energy ? energy.toExponential(3) : "—"} unit="J" />
        <Result label="Energy per mole" value={energy ? ((energy * 6.022e23) / 1000).toFixed(1) : "—"} unit="kJ/mol" />
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--muted)]">
        <Calculator size={12} /> h = 6.626×10⁻³⁴ J·s, c = 3.00×10⁸ m/s
      </p>
    </Card>
  );
}
