// Drop a new unitN.json into src/content/ and it is picked up automatically.
export type MCQ={id:string;difficulty:number;question:string;choices:string[];answer:string;explanation:string;needsReview?:boolean};
export type Part={label:string;prompt:string;responseType:'numeric'|'multipleChoice'|'explanation';expectedAnswer?:number|string;tolerance?:number;units?:string;acceptableUnits?:string[];choices?:string[];rubric?:{points:number;criterion:string}[];modelAnswer:string};
export type FRQ={id:string;difficulty:number;prompt:string;parts:Part[];modelAnswer:string;needsReview?:boolean};
export type Card={id:string;front:string;back:string};
export type Sub={id:string;title:string;summary?:string;concepts?:string[];equations?:string[];vocab?:string[];mistakes?:string[];mcqs?:MCQ[];frqs?:FRQ[];cards?:Card[]};
export type Unit={unit:number;title:string;subunits:Sub[]};
const m=import.meta.glob('./content/unit*.json',{eager:true}) as Record<string,{default:Unit}>;
export const units:Unit[]=Object.values(m).map(x=>x.default).sort((a,b)=>a.unit-b.unit);
export const allSubs=units.flatMap(u=>u.subunits.map(s=>({...s,unit:u.unit})));
