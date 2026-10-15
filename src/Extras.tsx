import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {elements,molarMass,El,bySym} from './elements';
import {units,allSubs,MCQ,FRQ} from './content';
import {T} from './Tex';

const ref=String.raw`Constants|Gas constant: $R=0.08206\ \text{L·atm/(mol·K)}=8.314\ \text{J/(mol·K)}$
Constants|Avogadro's number: $6.022\times10^{23}\ \text{mol}^{-1}$
Constants|Faraday constant: $F=96{,}485\ \text{C/mol e}^-$
Constants|Planck's constant: $h=6.626\times10^{-34}\ \text{J·s}$; speed of light $c=3.00\times10^{8}\ \text{m/s}$
Constants|Water at 25 °C: $K_w=1.0\times10^{-14}$; specific heat $4.184\ \text{J/(g·°C)}$
Formulas|Ideal gas law: $PV=nRT$
Formulas|Dilution: $M_1V_1=M_2V_2$
Formulas|Heat: $q=mc\Delta T$; phase change: $q=n\Delta H$
Formulas|Gibbs energy: $\Delta G=\Delta H-T\Delta S$
Formulas|pH: $\text{pH}=-\log[\text{H}^+]$; $\text{pH}+\text{pOH}=14$ at 25 °C
Formulas|Photon energy: $E=h\nu$; $c=\lambda\nu$
Formulas|Beer-Lambert law: $A=\varepsilon bc$
Formulas|Molarity: $M=\frac{\text{mol solute}}{\text{L solution}}$; Molality: $m=\frac{\text{mol solute}}{\text{kg solvent}}$
Formulas|Percent yield: $\frac{\text{actual}}{\text{theoretical}}\times100\%$
Solubility rules|Salts of Group 1 metals, $\ce{NH4+}$, $\ce{NO3-}$ and $\ce{CH3COO-}$ are soluble
Solubility rules|Chlorides, bromides, iodides are soluble except with $\ce{Ag+}$, $\ce{Pb^2+}$, $\ce{Hg2^2+}$
Solubility rules|Sulfates are soluble except with $\ce{Ba^2+}$, $\ce{Pb^2+}$, $\ce{Ca^2+}$ (slightly), $\ce{Sr^2+}$
Solubility rules|Hydroxides, carbonates, phosphates, sulfides are mostly insoluble except with Group 1 and $\ce{NH4+}$
Strong acids and bases|Strong acids: $\ce{HCl}$, $\ce{HBr}$, $\ce{HI}$, $\ce{HNO3}$, $\ce{H2SO4}$ (first proton), $\ce{HClO4}$, $\ce{HClO3}$
Strong acids and bases|Strong bases: Group 1 hydroxides, $\ce{Ca(OH)2}$, $\ce{Sr(OH)2}$, $\ce{Ba(OH)2}$
Polyatomic ions|$\ce{NH4+}$ ammonium, $\ce{OH-}$ hydroxide, $\ce{NO3-}$ nitrate, $\ce{CH3COO-}$ acetate, $\ce{ClO4-}$ perchlorate, $\ce{MnO4-}$ permanganate
Polyatomic ions|$\ce{SO4^2-}$ sulfate, $\ce{CO3^2-}$ carbonate, $\ce{CrO4^2-}$ chromate, $\ce{Cr2O7^2-}$ dichromate, $\ce{PO4^3-}$ phosphate`.split('\n').map(l=>l.split('|'));

export function Reference(){const [q,setQ]=useState('');const rows=ref.filter(([c,t])=>(c+t).toLowerCase().includes(q.toLowerCase()));
  return <section><label>Search <input value={q} onChange={e=>setQ(e.target.value)}/></label>
    <p className="mt-1 text-sm">Formulas and the solubility rules are summaries; check your course sheet for exceptions.</p>
    <ul className="mt-2 space-y-1" aria-live="polite">{rows.map(([c,t],i)=><li key={i} className="card"><b>{c}:</b> <T s={t}/></li>)}{!rows.length&&<li>No matches.</li>}</ul></section>}

const trend=(e:El,mode:string)=>{const r=e.z<=36?e.z:(e.z<=54?e.z-18:e.z-36);return r}; // rough
export function Periodic(){
  const [e,setE]=useState<El>(elements[0]);
  const [trendMode,setTrendMode]=useState<'none'|'radius'|'en'|'ie'>('none');
  const [family,setFamily]=useState('all');
  const cats=[...new Set(elements.map(x=>x.cat))];
  const shown=family==='all'?elements:elements.filter(x=>x.cat===family);
  const style=(x:El)=>{if(trendMode==='none')return '';const v=trendVal(x,trendMode);const max=Math.max(...elements.filter(y=>y.cat===x.cat).map(y=>trendVal(y,trendMode))||[1]);const f=Math.round(255*(1-v/max));return `background:rgb(255,${f},${f});color:#111`};
  return <section>
    <div className="mb-2 flex flex-wrap gap-2 text-sm">
      <label>Trend <select value={trendMode} onChange={e=>setTrendMode(e.target.value as any)}>
        <option value="none">None</option><option value="radius">Atomic radius</option>
        <option value="en">Electronegativity</option><option value="ie">Ionization energy</option>
      </select></label>
      <label>Category <select value={family} onChange={e=>setFamily(e.target.value)}>
        <option value="all">All</option>{cats.map(c=><option key={c}>{c}</option>)}
      </select></label>
    </div>
    <p className="mb-2 text-xs text-slate-600 dark:text-slate-400">Trend shading is approximate. Atomic radius decreases left→right and increases top→bottom; EN and IE do the opposite.</p>
    <div className="flex flex-wrap gap-1">{shown.map(x=><button key={x.z} style={{background:trendMode==='none'?undefined:trendBg(x,trendMode)}} onClick={()=>setE(x)} aria-label={x.name} aria-pressed={x.z===e.z} className={'btn2 w-14 !px-1 '+(x.z===e.z?'ring-2 ring-amber-400':'')}><span className="block text-[10px]">{x.z}</span><b>{x.sym}</b></button>)}</div>
    <div className="card mt-3" aria-live="polite"><h2 className="text-xl">{e.name} ({e.sym})</h2>
      <p>Atomic number {e.z} · Atomic mass {e.mass} g/mol</p>
      <p>Category: {e.cat}</p>
      <p>Electron configuration: <code>{e.cfg}</code></p>
      <p>Common oxidation states: <b>{e.ox.join(', ')}</b></p>
    </div></section>}
function trendVal(e:El,mode:string){
  // rough proxies for visual shading
  const period=e.z<=2?1:e.z<=10?2:e.z<=18?3:e.z<=36?4:e.z<=54?5:e.z<=86?6:7;
  const group=((e.z-1)%8)+1;
  if(mode==='radius')return e.z*1.0/(group+1)+(7-period)*3;
  if(mode==='en')return 4-group*0.3+period*0.2;
  if(mode==='ie')return 600+group*150-period*80;
  return 0}
function trendBg(e:El,mode:string){
  const v=trendVal(e,mode);const all=elements.map(x=>trendVal(x,mode));
  const min=Math.min(...all),max=Math.max(...all);const f=(v-min)/(max-min||1);
  const shade=Math.round(220-160*f);
  return `rgb(${shade},${shade+20},255)`;
}

export function MolarCalc(){const [f,setF]=useState('');const m=molarMass(f);
  return <div className="card"><h2>Molar mass</h2><label className="block">Formula, e.g. Ca(OH)2 <input value={f} onChange={e=>setF(e.target.value)}/></label>
    <p aria-live="polite">{f&&(isNaN(m)?'Could not read that formula.':m.toFixed(2)+' g/mol')}</p></div>}

function Calc({t,f,fn}:{t:string;f:string[][];fn:(v:number[])=>string}){
  const [v,setV]=useState<Record<string,string>>({});const n=f.map(([k])=>parseFloat(v[k]));
  return <div className="card"><h2>{t}</h2>{f.map(([k,l])=><label key={k} className="block">{l} <input value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/></label>)}
    <p aria-live="polite" className="mt-1 font-semibold">{n.some(isNaN)?'':fn(n)}</p></div>}
const p3=(x:number)=>x.toPrecision(3);
export function MoreCalcs(){return <>
  <Calc t="Stoichiometry: grams A to grams B" f={[['a','Mass of A (g)'],['ma','Molar mass A (g/mol)'],['ca','Coefficient A'],['cb','Coefficient B'],['mb','Molar mass B (g/mol)']]} fn={([a,ma,ca,cb,mb])=>`Mass of B = ${p3(a/ma*cb/ca*mb)} g`}/>
  <Calc t="Combined gas law: V2" f={[['p1','P1'],['v1','V1'],['t1','T1 (K)'],['p2','P2 (same unit as P1)'],['t2','T2 (K)']]} fn={([p1,v1,t1,p2,t2])=>`V2 = ${p3(p1*v1*t2/(t1*p2))} (same unit as V1)`}/>
  <Calc t="Dalton's law: partial pressure" f={[['n','Moles of gas'],['nt','Total moles'],['pt','Total pressure']]} fn={([n,nt,pt])=>`P = ${p3(n/nt*pt)} (same unit as total)`}/>
  <Calc t="Graham's law: rate1 / rate2" f={[['m1','Molar mass of gas 1'],['m2','Molar mass of gas 2']]} fn={([a,b])=>`rate1/rate2 = ${p3(Math.sqrt(b/a))}`}/>
  <Calc t="Gibbs free energy" f={[['h','ΔH (kJ)'],['s','ΔS (J/K)'],['t','T (K)']]} fn={([h,s,t])=>{const g=h-t*s/1000;return `ΔG = ${p3(g)} kJ (${g<0?'spontaneous':'nonspontaneous'} at this T)`}}/>
  <Calc t="Calorimetry: q = mcΔT" f={[['m','Mass (g)'],['c','Specific heat (J/g·°C)'],['d','ΔT (°C)']]} fn={([m,c,d])=>`q = ${p3(m*c*d)} J`}/>
  <Calc t="Rate law: order from two trials" f={[['r1','Rate 1'],['r2','Rate 2'],['c1','[A] trial 1'],['c2','[A] trial 2 (other reactants constant)']]} fn={([r1,r2,c1,c2])=>`Order in A ≈ ${(Math.log(r2/r1)/Math.log(c2/c1)).toFixed(2)}`}/>
  <Calc t="ICE helper: weak acid HA" f={[['c','Initial [HA] (M)'],['k','Ka']]} fn={([c,k])=>{const x=(-k+Math.sqrt(k*k+4*k*c))/2;return `x = [H+] = ${x.toExponential(2)} M; pH = ${(-Math.log10(x)).toFixed(2)}; [HA] = ${p3(c-x)} M`}}/>
  <Calc t="pKa from Ka" f={[['k','Ka']]} fn={([k])=>`pKa = ${(-Math.log10(k)).toFixed(2)}`}/>
  <Calc t="Cell potential" f={[['c','E° cathode (V)'],['a','E° anode (V)'],['n','Electrons transferred']]} fn={([c,a,n])=>{const e=c-a;return `E°cell = ${e.toFixed(2)} V; ΔG° = ${p3(-n*96485*e/1000)} kJ/mol`}}/>
  <Calc t="Molality from mass" f={[['m','Mass solute (g)'],['mm','Molar mass solute'],['k','Mass solvent (kg)']]} fn={([m,mm,k])=>`m = ${p3(m/mm/k)} mol/kg`}/>
  <Calc t="Percent by mass" f={[['s','Mass solute (g)'],['t','Mass solution (g)']]} fn={([s,t])=>`${p3(100*s/t)} %`}/>
  <Calc t="Beer-Lambert: concentration" f={[['a','Absorbance'],['e','ε (M⁻¹cm⁻¹)'],['b','Path length (cm)']]} fn={([a,e,b])=>`c = ${p3(a/e/b)} M`}/>
  <Calc t="Photoelectric: KE of ejected e-" f={[['n','Photon frequency (Hz)'],['w','Work function (J)']]} fn={([n,w])=>`KE = ${p3(6.626e-34*n-w)} J`}/>
</>}

export function Browse(){
  const [q,setQ]=useState('');const [u,setU]=useState('all');const [d,setD]=useState('0');const [ty,setTy]=useState('all');
  const rows=useMemo(()=>{
    const out:{id:string;sub:string;type:string;d:number;text:string}[]=[];
    for(const s of allSubs){
      if(u!=='all'&&!s.id.startsWith(u+'.'))continue;
      for(const m of s.mcqs??[]){if(d!=='0'&&m.difficulty!==+d)continue;if(ty==='frq')continue;out.push({id:m.id,sub:s.id,type:'MCQ',d:m.difficulty,text:m.question})}
      for(const f of s.frqs??[]){if(d!=='0'&&f.difficulty!==+d)continue;if(ty==='mcq')continue;out.push({id:f.id,sub:s.id,type:'FRQ',d:f.difficulty,text:f.prompt})}
    }
    return out.filter(r=>(r.text+r.id).toLowerCase().includes(q.toLowerCase()));
  },[q,u,d,ty]);
  return <section className="space-y-2">
    <div className="flex flex-wrap gap-2 text-sm">
      <label>Search <input value={q} onChange={e=>setQ(e.target.value)}/></label>
      <label>Unit <select value={u} onChange={e=>setU(e.target.value)}><option value="all">All</option>{units.map(x=><option key={x.unit} value={x.unit}>{x.unit}</option>)}</select></label>
      <label>Difficulty <select value={d} onChange={e=>setD(e.target.value)}><option value="0">Any</option>{[1,2,3,4,5].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Type <select value={ty} onChange={e=>setTy(e.target.value)}><option value="all">Both</option><option value="mcq">MCQ</option><option value="frq">FRQ</option></select></label>
    </div>
    <p className="text-sm">{rows.length} items</p>
    <ul className="space-y-1">{rows.slice(0,100).map(r=><li key={r.id} className="card"><span className="text-xs text-slate-500">{r.sub} · {r.type} L{r.d}</span><br/><T s={r.text}/></li>)}</ul>
    {rows.length>100&&<p className="text-sm">Showing first 100. Narrow your filters to see more.</p>}
  </section>}

export function About(){return <section className="space-y-2">
  <h2 className="text-xl">About Timtom Chemistry Help</h2>
  <p>Personal AP Chemistry study tool. Content covers Units 3 and 4. Everything runs in your browser; progress is saved in localStorage on this device only.</p>
  <p>Question content is original and written for practice. It has not been reviewed by the College Board.</p>
  <p><b>Disclaimer:</b> This site is not affiliated with or endorsed by College Board. AP is a trademark registered by the College Board.</p>
</section>}

export function Login(){return <section className="card">
  <h2 className="text-xl">Sign in</h2>
  <p className="mt-2 text-sm">Accounts and cloud sync are planned for a later version. For now, everything is stored locally on this device — no sign-in required.</p>
  <p className="mt-2 text-sm">Use <Link className="underline" to="/settings">Settings</Link> to export your progress as a JSON file you can move between devices.</p>
</section>}