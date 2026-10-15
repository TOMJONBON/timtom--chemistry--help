import {create} from 'zustand';import {persist} from 'zustand/middleware';
export type Att={id:string;ok:boolean;d:number;t:number};
export type FAtt={id:string;pts:number;max:number;t:number};
type S={dark:boolean;att:Att[];frq:FAtt[];box:Record<string,number>;hist:{t:number;s:number;n:number}[];set:(p:Partial<S>)=>void;reset:()=>void};
export const useStore=create<S>()(persist(set=>({dark:false,att:[],frq:[],box:{},hist:[],set:p=>set(p),reset:()=>set({att:[],frq:[],box:{},hist:[]})}),{name:'timtom-chem'}));
