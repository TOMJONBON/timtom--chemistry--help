import {useEffect,useState} from 'react';
import {Link,NavLink,Route,Routes,useParams} from 'react-router-dom';
import {units,allSubs,MCQ,FRQ,Card} from './content';
import {useStore} from './store';
import {gradeNumeric} from './grading';
import {T} from './Tex';
import {Reference,Periodic,MolarCalc,MoreCalcs,Browse,About,Login} from './Extras';

const nav=[['/','Home'],['/units','Units'],['/browse','Browse'],['/flashcards','Flashcards'],['/quiz','Quiz'],['/frq','FRQ'],['/calculators','Calculators'],['/reference','Reference'],['/periodic-table','Periodic Table'],['/progress','Progress'],['/settings','Settings'],['/about','About']];
const mcqAll=allSubs.flatMap(s=>(s.mcqs??[]).map(q=>({...q,sub:s.id})));
const frqAll=allSubs.flatMap(s=>(s.frqs??[]).map(q=>({...q,sub:s.id})));
const cardAll=allSubs.flatMap(s=>(s.cards??[]).map(c=>({...c,sub:s.id})));

export default function App(){
  const dark=useStore(s=>s.dark);
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark)},[dark]);
  return <div className="mx-auto max-w-3xl p-4">
    <header className="-mx-4 mb-4 bg-slate-900 px-4 py-4 text-white"><div className="flex items-center gap-3"><div aria-hidden className="w-14 rounded border-2 border-teal-300 p-1 leading-tight"><span className="block text-[10px]">69</span><b className="text-2xl">Tm</b></div><div><h1 className="text-2xl font-bold">Timtom Chemistry Help</h1><p className="text-sm text-slate-300">AP Chemistry · Units 3 and 4</p></div></div>
      <nav aria-label="Main" className="my-3 flex flex-wrap gap-2">{nav.map(([to,l])=>
        <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>'rounded-full border border-slate-600 px-3 py-1 text-sm hover:bg-slate-700 '+(isActive?'!border-teal-300 !bg-teal-300 !text-slate-900':'')}>{l}</NavLink>)}</nav></header>
    <main><Routes>
      <Route path="/" element={<Home/>}/><Route path="/units" element={<Units/>}/>
      <Route path="/units/:u" element={<Unit/>}/><Route path="/units/:u/:s" element={<Subunit/>}/>
      <Route path="/browse" element={<Browse/>}/>
      <Route path="/flashcards" element={<Cards/>}/><Route path="/quiz" element={<Quiz/>}/>
      <Route path="/frq" element={<Frq/>}/><Route path="/calculators" element={<Calcs/>}/>
      <Route path="/reference" element={<Reference/>}/><Route path="/periodic-table" element={<Periodic/>}/>
      <Route path="/progress" element={<Progress/>}/><Route path="/settings" element={<Settings/>}/>
      <Route path="/about" element={<About/>}/><Route path="/login" element={<Login/>}/>
    </Routes></main>
    <footer className="mt-8 text-sm text-stone-600 dark:text-stone-400">This site is not affiliated with or endorsed by College Board.</footer>
  </div>;
}

function Home(){const a=useStore(s=>s.att);const ok=a.filter(x=>x.ok).length;
  return <section><p>Practice Units 3 and 4 of AP Chemistry. {a.length?`Quiz accuracy so far: ${Math.round(100*ok/a.length)}% on ${a.length} questions.`:'Start with a quiz or flashcards.'}</p>
  <div className="mt-4 grid grid-cols-2 gap-3">{nav.slice(1,8).map(([to,l])=><Link key={to} to={to} className="card text-center font-semibold hover:bg-teal-50 dark:hover:bg-slate-700">{l}</Link>)}</div></section>}

function Units(){const att=useStore(s=>s.att);return <section className="space-y-2">{units.map(u=>{const tot=mcqAll.filter(q=>q.sub.startsWith(u.unit+'.')).length;const done=new Set(att.filter(a=>a.ok&&a.id.startsWith(u.unit+'.')).map(a=>a.id)).size;return <Link key={u.unit} to={`/units/${u.unit}`} className="card block text-lg"><b>Unit {u.unit}</b>: {u.title}<progress className="mt-2 block h-2 w-full" value={done} max={Math.max(tot,1)} aria-label={`Unit ${u.unit} progress`}/><span className="text-sm">{done} of {tot} questions answered correctly</span></Link>})}</section>}
function Unit(){const {u}=useParams();const unit=units.find(x=>String(x.unit)===u);if(!unit)return <p>Unit not found.</p>;
  return <section><h2 className="text-xl">Unit {unit.unit}: {unit.title}</h2><ul className="mt-2 space-y-1">{unit.subunits.map(s=>
    <li key={s.id}><Link className="underline" to={`/units/${u}/${s.id}`}>{s.id} {s.title}</Link>{!s.mcqs&&<span className="text-sm"> (no content yet)</span>}</li>)}</ul></section>}
function List({t,a}:{t:string;a?:string[]}){return a?.length?<><h3 className="mt-3 font-semibold">{t}</h3><ul className="list-disc pl-5">{a.map((x,i)=><li key={i}><T s={x}/></li>)}</ul></>:null}
function Subunit(){const {s}=useParams();const sub=allSubs.find(x=>x.id===s);if(!sub)return <p>Subunit not found.</p>;
  return <section><h2 className="text-xl">{sub.id} {sub.title}</h2>{sub.summary&&<p className="mt-2">{sub.summary}</p>}
    <List t="Key concepts" a={sub.concepts}/><List t="Vocabulary" a={sub.vocab}/><List t="Common mistakes" a={sub.mistakes}/>
    {sub.equations&&<><h3 className="mt-3 font-semibold">Equations</h3>{sub.equations.map((e,i)=><div key={i}><T s={`$${e}$`}/></div>)}</>}
    {sub.mcqs&&<p className="mt-3"><Link className="btn" to="/quiz">Practice questions</Link></p>}</section>}

function Cards(){const {box,set}=useStore();const [i,setI]=useState(0);const [flip,setFlip]=useState(false);
  const due=cardAll.filter(c=>(box[c.id]??1)<5);const c:Card|undefined=due[i%Math.max(due.length,1)];
  if(!c)return <p>All cards mastered.</p>;
  const mark=(k:boolean)=>{set({box:{...box,[c.id]:k?Math.min((box[c.id]??1)+1,5):1}});setFlip(false);setI(i+1)};
  return <section><p className="text-sm">Box {box[c.id]??1} of 5 · {due.length} cards left</p>
    <button className="card my-2 w-full text-left text-lg" onClick={()=>setFlip(!flip)} aria-label="Flip card"><T s={flip?c.back:c.front}/></button>
    <div className="flex gap-2"><button className="btn" onClick={()=>mark(true)}>Known</button><button className="btn2" onClick={()=>mark(false)}>Still learning</button></div></section>}

function Quiz(){
  const {att,hist,set}=useStore();
  const [missed,setMissed]=useState<typeof mcqAll>([]);
  const [unit,setUnit]=useState('all');
  const [sub,setSub]=useState('all');
  const [n,setN]=useState(10);
  const [dif,setDif]=useState('0');
  const [fbMode,setFbMode]=useState<'each'|'end'>('each');
  const [run,setRun]=useState<typeof mcqAll|null>(null);
  const [i,setI]=useState(0);
  const [pick,setPick]=useState('');
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [score,setScore]=useState(0);
  const subOpts=allSubs.filter(s=>unit==='all'||s.id.startsWith(unit+'.'));

  if(!run)return <section className="space-y-3">
    <label className="block">Unit <select value={unit} onChange={e=>{setUnit(e.target.value);setSub('all')}}><option value="all">All</option>{units.map(u=><option key={u.unit} value={u.unit}>{u.unit}</option>)}</select></label>
    <label className="block">Subunit <select value={sub} onChange={e=>setSub(e.target.value)}><option value="all">All in unit</option>{subOpts.map(s=><option key={s.id} value={s.id}>{s.id} {s.title}</option>)}</select></label>
    <label className="block">Difficulty <select value={dif} onChange={e=>setDif(e.target.value)}><option value="0">Mixed</option>{[1,2,3,4,5].map(d=><option key={d} value={d}>{d}</option>)}</select></label>
    <label className="block">Questions <input type="number" min={1} value={n} onChange={e=>setN(+e.target.value)}/></label>
    <label className="block">Feedback <select value={fbMode} onChange={e=>setFbMode(e.target.value as any)}><option value="each">After each question</option><option value="end">At the end only</option></select></label>
    <button className="btn" onClick={()=>{
      const p=mcqAll.filter(q=>(sub!=='all'?q.sub===sub:(unit==='all'||q.sub.startsWith(unit+'.')))&&(dif==='0'||q.difficulty===+dif)).sort(()=>Math.random()-.5).slice(0,n);
      setRun(p);setI(0);setPick('');setScore(0);setMissed([]);setAnswers({})}}>Start quiz</button>
    {!mcqAll.length&&<p>No questions yet.</p>}
  </section>;

  if(i>=run.length)return <section>
    <h2 className="text-xl">Score: {score} / {run.length}</h2>
    <button className="btn mt-2" onClick={()=>setRun(null)}>New quiz</button>
    {fbMode==='end'&&<><h3 className="mt-4 text-lg">Review all questions</h3>
      {run.map(q=>{const your=answers[q.id];const ok=your===q.answer;return <div key={q.id} className={'card my-2 '+(ok?'border-l-green-500':'border-l-red-500')}>
        <p className="text-xs text-slate-500">{q.id} · L{q.difficulty}</p>
        <p className="my-1"><T s={q.question}/></p>
        <p><b>{ok?'Correct.':`Incorrect. You picked ${your||'(none)'}; answer is ${q.answer}.`}</b> <T s={q.explanation}/></p>
      </div>})}</>}
    {fbMode==='each'&&missed.length>0&&<><h3 className="mt-4 text-lg">Review missed questions</h3>
      {missed.map(m=><div key={m.id} className="card my-2"><p><T s={m.question}/></p><p className="mt-1"><b>Answer {m.answer}.</b> <T s={m.explanation}/></p></div>)}</>}
  </section>;

  const q=run[i];
  const done=fbMode==='each'&&!!pick;
  const choose=(l:string)=>{
    if(fbMode==='each'&&pick)return;
    setPick(l);
    setAnswers({...answers,[q.id]:l});
    if(fbMode==='each'){
      const ok=l===q.answer;
      if(ok)setScore(score+1);else setMissed([...missed,q]);
      set({att:[...att,{id:q.id,ok,d:q.difficulty,t:Date.now()}]});
    }
  };
  const next=()=>{
    if(fbMode==='end'){const ok=pick===q.answer;if(ok)setScore(score+1);else setMissed([...missed,q]);set({att:[...att,{id:q.id,ok,d:q.difficulty,t:Date.now()}]})}
    if(i===run.length-1)set({hist:[...hist,{t:Date.now(),s:score+(fbMode==='end'&&pick===q.answer?1:0),n:run.length}]});
    setI(i+1);setPick('');
  };
  return <section>
    <p className="text-sm">Question {i+1} of {run.length} · Level {q.difficulty}{q.needsReview&&' · unverified'}</p>
    <p className="my-2"><T s={q.question}/></p>
    <div className="space-y-2">{q.choices.map(c=>{const l=c[0];return <button key={l} className={'card block w-full text-left '+(done&&l===q.answer?'bg-green-100 dark:bg-green-900':done&&l===pick?'bg-red-100 dark:bg-red-900':!done&&l===pick?'ring-2 ring-teal-500':'')} onClick={()=>choose(l)}><T s={c}/></button>})}</div>
    {fbMode==='each'?<div aria-live="polite">{done&&<><p className="mt-2"><b>{pick===q.answer?'Correct.':`Incorrect. Answer: ${q.answer}.`}</b> <T s={q.explanation}/></p><button className="btn mt-2" onClick={next}>Next</button></>}</div>
      :<button className="btn mt-3" disabled={!pick} onClick={next}>{i===run.length-1?'Finish':'Next'}</button>}
  </section>}

function Frq(){const [cur,setCur]=useState<FRQ|null>(null);const [mins,setMins]=useState(15);
  const [unit,setUnit]=useState('all');const [sub,setSub]=useState('all');const [d,setD]=useState('0');
  const subOpts=allSubs.filter(s=>unit==='all'||s.id.startsWith(unit+'.'));
  const rows=frqAll.filter(q=>(sub!=='all'?q.sub===sub:(unit==='all'||q.sub.startsWith(unit+'.')))&&(d==='0'||q.difficulty===+d));
  if(cur)return <FrqRun q={cur} mins={mins} back={()=>setCur(null)}/>;
  return <section className="space-y-2">
    <label className="block">Timer (minutes) <input type="number" min={1} value={mins} onChange={e=>setMins(+e.target.value)}/></label>
    <div className="flex flex-wrap gap-2 text-sm">
      <label>Unit <select value={unit} onChange={e=>{setUnit(e.target.value);setSub('all')}}><option value="all">All</option>{units.map(u=><option key={u.unit} value={u.unit}>{u.unit}</option>)}</select></label>
      <label>Subunit <select value={sub} onChange={e=>setSub(e.target.value)}><option value="all">All in unit</option>{subOpts.map(s=><option key={s.id} value={s.id}>{s.id} {s.title}</option>)}</select></label>
      <label>Difficulty <select value={d} onChange={e=>setD(e.target.value)}><option value="0">Any</option>{[1,2,3,4,5].map(x=><option key={x}>{x}</option>)}</select></label>
    </div>
    {rows.map(q=><button key={q.id} className="card block w-full text-left" onClick={()=>setCur(q)}>{q.id} · Level {q.difficulty}</button>)}
    {!rows.length&&<p>No FRQs match those filters.</p>}
  </section>}
function FrqRun({q,back,mins}:{q:FRQ;back:()=>void;mins:number}){const {frq,set}=useStore();const [ans,setAns]=useState<Record<string,string>>({});const [chk,setChk]=useState<Record<string,boolean>>({});const [done,setDone]=useState(false);
  const [secs,setSecs]=useState(mins*60);useEffect(()=>{if(done)return;const t=setInterval(()=>setSecs(s=>Math.max(0,s-1)),1000);return()=>clearInterval(t)},[done]);
  const res=(p:FRQ['parts'][0])=>{if(p.responseType==='numeric')return gradeNumeric(ans[p.label]??'',{expectedAnswer:p.expectedAnswer as number,tolerance:p.tolerance,acceptableUnits:p.acceptableUnits});
    if(p.responseType==='multipleChoice')return {ok:ans[p.label]===p.expectedAnswer,note:''};return {ok:false,note:''}};
  const pts=(p:FRQ['parts'][0])=>p.responseType==='explanation'?(p.rubric??[]).reduce((s,r,i)=>s+(chk[p.label+i]?r.points:0),0):res(p).ok?1:0;
  const max=q.parts.reduce((s,p)=>s+(p.responseType==='explanation'?(p.rubric??[]).reduce((a,r)=>a+r.points,0):1),0);
  const submit=()=>{setDone(true);set({frq:[...frq,{id:q.id,pts:q.parts.reduce((s,p)=>s+pts(p),0),max,t:Date.now()}]})};
  return <section><button className="btn2" onClick={back}>Back</button> <span className="ml-2">Time left {Math.floor(secs/60)}:{String(secs%60).padStart(2,'0')}</span>
    <p className="my-2"><T s={q.prompt}/></p>
    {q.parts.map(p=>{const r=res(p);return <div key={p.label} className="card my-2"><p>({p.label}) <T s={p.prompt}/></p>
      {p.responseType==='numeric'&&<input aria-label={`Answer ${p.label}`} disabled={done} value={ans[p.label]??''} onChange={e=>setAns({...ans,[p.label]:e.target.value})} placeholder={`number ${p.units??''}`}/>}
      {p.responseType==='multipleChoice'&&p.choices?.map(c=><label key={c} className="block"><input type="radio" name={p.label} disabled={done} onChange={()=>setAns({...ans,[p.label]:c})}/> {c}</label>)}
      {p.responseType==='explanation'&&<textarea aria-label={`Answer ${p.label}`} disabled={done} className="w-full rounded border p-2 text-stone-900" onChange={e=>setAns({...ans,[p.label]:e.target.value})}/>}
      {done&&<div aria-live="polite" className="mt-2">
        {p.responseType==='explanation'?<><p className="text-sm">Self-assessed. Check what you covered:</p>{p.rubric?.map((x,i)=><label key={i} className="block"><input type="checkbox" onChange={e=>setChk({...chk,[p.label+i]:e.target.checked})}/> {x.criterion} ({x.points})</label>)}</>
         :<p><b>{r.ok?'Correct.':'Not matched.'}</b> {r.note} Expected: {String(p.expectedAnswer)} {p.units}</p>}
        <p><T s={p.modelAnswer}/></p></div>}</div>})}
    {!done?<button className="btn" onClick={submit}>Check answers</button>:<p aria-live="polite"><b>Score: {q.parts.reduce((s,p)=>s+pts(p),0)} / {max}</b> (explanations update as you tick boxes)</p>}</section>}

function Calcs(){const [v,setV]=useState<Record<string,string>>({});const f=(k:string)=>parseFloat(v[k]);const inp=(k:string,l:string)=><label className="block">{l} <input value={v[k]??''} onChange={e=>setV({...v,[k]:e.target.value})}/></label>;
  const P=f('n')*0.082057*f('T')/f('V');const C2=f('c1')*f('v1')/f('v2');const pH=-Math.log10(f('h'));
  return <section className="space-y-4"><MolarCalc/><MoreCalcs/>
    <div className="card"><h2>Ideal gas: pressure</h2>{inp('n','n (mol)')}{inp('T','T (K)')}{inp('V','V (L)')}<p>P = {isNaN(P)?'':P.toPrecision(3)+' atm'}</p></div>
    <div className="card"><h2>Dilution: final concentration</h2>{inp('c1','C1 (M)')}{inp('v1','V1 (mL)')}{inp('v2','V2 (mL)')}<p>C2 = {isNaN(C2)?'':C2.toPrecision(3)+' M'}</p></div>
    <div className="card"><h2>pH from [H+]</h2>{inp('h','[H+] (M)')}<p>pH = {isNaN(pH)?'':pH.toFixed(2)}; pOH = {isNaN(pH)?'':(14-pH).toFixed(2)} (25 °C)</p></div></section>}

function Progress(){const {att,frq,hist}=useStore();return <section><h2 className="text-xl">Quiz accuracy by level</h2>
  {[1,2,3,4,5].map(d=>{const x=att.filter(a=>a.d===d);return <p key={d}>Level {d}: {x.length?`${x.filter(a=>a.ok).length}/${x.length}`:'no attempts'}</p>})}
  <p className="mt-2">FRQ attempts: {frq.length}</p><h2 className="mt-4 text-xl">Past quiz scores</h2>{hist.length?hist.slice().reverse().map((h,i)=><p key={i}>{new Date(h.t).toLocaleString()}: {h.s} / {h.n}</p>):<p>No quizzes finished yet.</p>}</section>}

function Settings(){const {dark,set,reset,att,frq,box,hist}=useStore();
  const exp=()=>{const b=new Blob([JSON.stringify({att,frq,box,hist})],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='timtom-data.json';a.click()};
  const imp=(f?:File)=>f?.text().then(t=>{try{set(JSON.parse(t))}catch{alert('Not a valid study data file.')}});
  return <section className="space-y-3"><label className="block"><input type="checkbox" checked={dark} onChange={e=>set({dark:e.target.checked})}/> Dark mode</label>
    <div className="flex gap-2"><button className="btn2" onClick={exp}>Export data</button><label className="btn2 cursor-pointer">Import data<input type="file" accept=".json" className="sr-only" onChange={e=>imp(e.target.files?.[0])}/></label></div>
    <button className="btn2" onClick={()=>confirm('Erase all progress?')&&reset()}>Reset progress</button></section>}