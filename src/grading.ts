export function parseNum(s:string):number{
  const t=s.trim().replace(/\s*[×x*]\s*10\s*\^?\s*/i,'e').replace(/\s+/g,'');
  const m=t.match(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);return m?parseFloat(m[0]):NaN;}
const norm=(u:string)=>u.toLowerCase().replace(/\s+/g,'').replace(/·|\*/g,'');
export function gradeNumeric(input:string,p:{expectedAnswer:number;tolerance?:number;acceptableUnits?:string[]}){
  const v=parseNum(input);if(isNaN(v))return {ok:false,note:'Could not read a number.'};
  const tol=p.tolerance??0.02;const ok=Math.abs(v-p.expectedAnswer)<=Math.abs(p.expectedAnswer)*tol;
  const rest=norm(input.trim().replace(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i,'').replace(/^\s*[×x*]\s*10\s*\^?\s*[+-]?\d+/i,''));
  const unitOk=!rest||!p.acceptableUnits||p.acceptableUnits.map(norm).includes(rest);
  return {ok:ok&&unitOk,note:ok&&!unitOk?'Number is right, but check your units.':''};}
