import katex from 'katex';import 'katex/contrib/mhchem';import 'katex/dist/katex.min.css';
export function T({s}:{s:string}){
  const h=s.split(/(\$[^$]+\$)/).map(p=>p.startsWith('$')?katex.renderToString(p.slice(1,-1),{throwOnError:false}):p.replace(/&/g,'&amp;').replace(/</g,'&lt;')).join('');
  return <span dangerouslySetInnerHTML={{__html:h}}/>;}
