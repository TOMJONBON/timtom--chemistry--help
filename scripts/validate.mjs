import fs from 'fs';
import path from 'path';
const dir=path.join(process.cwd(),'src','content');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
const errs=[];
for(const f of files){
  const data=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
  for(const s of data.subunits){
    if(!s.mcqs&&!s.frqs)continue;
    const mcqs=s.mcqs??[],frqs=s.frqs??[];
    if(mcqs.length!==10)errs.push(`${s.id}: expected 10 MCQs, found ${mcqs.length}`);
    if(frqs.length!==10)errs.push(`${s.id}: expected 10 FRQs, found ${frqs.length}`);
    for(let d=1;d<=5;d++){
      const dm=mcqs.filter(q=>q.difficulty===d).length;
      const df=frqs.filter(q=>q.difficulty===d).length;
      if(dm!==2)errs.push(`${s.id}: expected 2 MCQs at L${d}, found ${dm}`);
      if(df!==2)errs.push(`${s.id}: expected 2 FRQs at L${d}, found ${df}`);
    }
    for(const q of mcqs){
      if(!q.id||!q.question||!q.answer||!q.explanation)errs.push(`MCQ missing fields: ${q.id||'(no id)'}`);
      if(!['A','B','C','D'].includes(q.answer))errs.push(`${q.id}: answer must be A/B/C/D`);
    }
    for(const q of frqs){
      if(!q.id||!q.prompt||!q.parts?.length)errs.push(`FRQ missing fields: ${q.id||'(no id)'}`);
      for(const p of q.parts??[]){
        if(p.responseType==='numeric'&&typeof p.expectedAnswer!=='number')errs.push(`${q.id}.${p.label}: numeric expectedAnswer must be a number`);
        if(p.responseType==='explanation'&&(!p.rubric||!p.rubric.length))errs.push(`${q.id}.${p.label}: explanation needs a rubric`);
        if(p.responseType==='multipleChoice'&&!p.expectedAnswer)errs.push(`${q.id}.${p.label}: MCQ part needs expectedAnswer`);
      }
    }
  }
}
if(errs.length){console.error(`Validation failed (${errs.length}):`);errs.forEach(e=>console.error(' - '+e));process.exit(1)}
console.log('All content validated.');