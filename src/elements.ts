const raw=`1|H|Hydrogen|1.008|nonmetal|1s1|+1,-1
2|He|Helium|4.003|noble gas|1s2|0
3|Li|Lithium|6.94|alkali metal|[He]2s1|+1
4|Be|Beryllium|9.012|alkaline earth metal|[He]2s2|+2
5|B|Boron|10.81|metalloid|[He]2s2 2p1|+3
6|C|Carbon|12.011|nonmetal|[He]2s2 2p2|+4,+2,-4
7|N|Nitrogen|14.007|nonmetal|[He]2s2 2p3|+5,+3,-3
8|O|Oxygen|15.999|nonmetal|[He]2s2 2p4|-2,-1
9|F|Fluorine|18.998|halogen|[He]2s2 2p5|-1
10|Ne|Neon|20.180|noble gas|[He]2s2 2p6|0
11|Na|Sodium|22.990|alkali metal|[Ne]3s1|+1
12|Mg|Magnesium|24.305|alkaline earth metal|[Ne]3s2|+2
13|Al|Aluminum|26.982|post-transition metal|[Ne]3s2 3p1|+3
14|Si|Silicon|28.085|metalloid|[Ne]3s2 3p2|+4,-4
15|P|Phosphorus|30.974|nonmetal|[Ne]3s2 3p3|+5,+3,-3
16|S|Sulfur|32.06|nonmetal|[Ne]3s2 3p4|+6,+4,-2
17|Cl|Chlorine|35.45|halogen|[Ne]3s2 3p5|+7,+5,+1,-1
18|Ar|Argon|39.948|noble gas|[Ne]3s2 3p6|0
19|K|Potassium|39.098|alkali metal|[Ar]4s1|+1
20|Ca|Calcium|40.078|alkaline earth metal|[Ar]4s2|+2
21|Sc|Scandium|44.956|transition metal|[Ar]4s2 3d1|+3
22|Ti|Titanium|47.867|transition metal|[Ar]4s2 3d2|+4,+3
23|V|Vanadium|50.942|transition metal|[Ar]4s2 3d3|+5,+4,+3,+2
24|Cr|Chromium|51.996|transition metal|[Ar]4s1 3d5|+6,+3,+2
25|Mn|Manganese|54.938|transition metal|[Ar]4s2 3d5|+7,+4,+2
26|Fe|Iron|55.845|transition metal|[Ar]4s2 3d6|+3,+2
27|Co|Cobalt|58.933|transition metal|[Ar]4s2 3d7|+3,+2
28|Ni|Nickel|58.693|transition metal|[Ar]4s2 3d8|+2,+3
29|Cu|Copper|63.546|transition metal|[Ar]4s1 3d10|+2,+1
30|Zn|Zinc|65.38|transition metal|[Ar]4s2 3d10|+2
31|Ga|Gallium|69.723|post-transition metal|[Ar]4s2 3d10 4p1|+3
32|Ge|Germanium|72.630|metalloid|[Ar]4s2 3d10 4p2|+4,+2
33|As|Arsenic|74.922|metalloid|[Ar]4s2 3d10 4p3|+5,+3,-3
34|Se|Selenium|78.971|nonmetal|[Ar]4s2 3d10 4p4|+6,+4,-2
35|Br|Bromine|79.904|halogen|[Ar]4s2 3d10 4p5|+5,+1,-1
36|Kr|Krypton|83.798|noble gas|[Ar]4s2 3d10 4p6|0,+2
37|Rb|Rubidium|85.468|alkali metal|[Kr]5s1|+1
38|Sr|Strontium|87.62|alkaline earth metal|[Kr]5s2|+2
39|Y|Yttrium|88.906|transition metal|[Kr]5s2 4d1|+3
40|Zr|Zirconium|91.224|transition metal|[Kr]5s2 4d2|+4
41|Nb|Niobium|92.906|transition metal|[Kr]5s1 4d4|+5
42|Mo|Molybdenum|95.95|transition metal|[Kr]5s1 4d5|+6,+4
43|Tc|Technetium|98|transition metal|[Kr]5s2 4d5|+7
44|Ru|Ruthenium|101.07|transition metal|[Kr]5s1 4d7|+3,+4
45|Rh|Rhodium|102.91|transition metal|[Kr]5s1 4d8|+3
46|Pd|Palladium|106.42|transition metal|[Kr]4d10|+2,+4
47|Ag|Silver|107.87|transition metal|[Kr]5s1 4d10|+1
48|Cd|Cadmium|112.41|transition metal|[Kr]5s2 4d10|+2
49|In|Indium|114.82|post-transition metal|[Kr]5s2 4d10 5p1|+3
50|Sn|Tin|118.71|post-transition metal|[Kr]5s2 4d10 5p2|+4,+2
51|Sb|Antimony|121.76|metalloid|[Kr]5s2 4d10 5p3|+5,+3,-3
52|Te|Tellurium|127.60|metalloid|[Kr]5s2 4d10 5p4|+6,+4,-2
53|I|Iodine|126.90|halogen|[Kr]5s2 4d10 5p5|+7,+5,+1,-1
54|Xe|Xenon|131.29|noble gas|[Kr]5s2 4d10 5p6|0,+2,+4,+6
55|Cs|Cesium|132.91|alkali metal|[Xe]6s1|+1
56|Ba|Barium|137.33|alkaline earth metal|[Xe]6s2|+2
57|La|Lanthanum|138.91|lanthanide|[Xe]5d1 6s2|+3
58|Ce|Cerium|140.12|lanthanide|[Xe]4f1 5d1 6s2|+4,+3
59|Pr|Praseodymium|140.91|lanthanide|[Xe]4f3 6s2|+3
60|Nd|Neodymium|144.24|lanthanide|[Xe]4f4 6s2|+3
61|Pm|Promethium|145|lanthanide|[Xe]4f5 6s2|+3
62|Sm|Samarium|150.36|lanthanide|[Xe]4f6 6s2|+3,+2
63|Eu|Europium|151.96|lanthanide|[Xe]4f7 6s2|+3,+2
64|Gd|Gadolinium|157.25|lanthanide|[Xe]4f7 5d1 6s2|+3
65|Tb|Terbium|158.93|lanthanide|[Xe]4f9 6s2|+3,+4
66|Dy|Dysprosium|162.50|lanthanide|[Xe]4f10 6s2|+3
67|Ho|Holmium|164.93|lanthanide|[Xe]4f11 6s2|+3
68|Er|Erbium|167.26|lanthanide|[Xe]4f12 6s2|+3
69|Tm|Thulium|168.93|lanthanide|[Xe]4f13 6s2|+3
70|Yb|Ytterbium|173.05|lanthanide|[Xe]4f14 6s2|+3,+2
71|Lu|Lutetium|174.97|lanthanide|[Xe]4f14 5d1 6s2|+3
72|Hf|Hafnium|178.49|transition metal|[Xe]4f14 5d2 6s2|+4
73|Ta|Tantalum|180.95|transition metal|[Xe]4f14 5d3 6s2|+5
74|W|Tungsten|183.84|transition metal|[Xe]4f14 5d4 6s2|+6,+4
75|Re|Rhenium|186.21|transition metal|[Xe]4f14 5d5 6s2|+7,+4
76|Os|Osmium|190.23|transition metal|[Xe]4f14 5d6 6s2|+4,+8
77|Ir|Iridium|192.22|transition metal|[Xe]4f14 5d7 6s2|+3,+4
78|Pt|Platinum|195.08|transition metal|[Xe]4f14 5d9 6s1|+2,+4
79|Au|Gold|196.97|transition metal|[Xe]4f14 5d10 6s1|+3,+1
80|Hg|Mercury|200.59|transition metal|[Xe]4f14 5d10 6s2|+2,+1
81|Tl|Thallium|204.38|post-transition metal|[Xe]4f14 5d10 6s2 6p1|+1,+3
82|Pb|Lead|207.2|post-transition metal|[Xe]4f14 5d10 6s2 6p2|+2,+4
83|Bi|Bismuth|208.98|post-transition metal|[Xe]4f14 5d10 6s2 6p3|+3,+5
84|Po|Polonium|209|post-transition metal|[Xe]4f14 5d10 6s2 6p4|+4,+2
85|At|Astatine|210|halogen|[Xe]4f14 5d10 6s2 6p5|-1,+1
86|Rn|Radon|222|noble gas|[Xe]4f14 5d10 6s2 6p6|0
87|Fr|Francium|223|alkali metal|[Rn]7s1|+1
88|Ra|Radium|226|alkaline earth metal|[Rn]7s2|+2
89|Ac|Actinium|227|actinide|[Rn]6d1 7s2|+3
90|Th|Thorium|232.04|actinide|[Rn]6d2 7s2|+4
91|Pa|Protactinium|231.04|actinide|[Rn]5f2 6d1 7s2|+5
92|U|Uranium|238.03|actinide|[Rn]5f3 6d1 7s2|+6,+4
93|Np|Neptunium|237|actinide|[Rn]5f4 6d1 7s2|+5
94|Pu|Plutonium|244|actinide|[Rn]5f6 7s2|+4
95|Am|Americium|243|actinide|[Rn]5f7 7s2|+3
96|Cm|Curium|247|actinide|[Rn]5f7 6d1 7s2|+3
97|Bk|Berkelium|247|actinide|[Rn]5f9 7s2|+3
98|Cf|Californium|251|actinide|[Rn]5f10 7s2|+3
99|Es|Einsteinium|252|actinide|[Rn]5f11 7s2|+3
100|Fm|Fermium|257|actinide|[Rn]5f12 7s2|+3
101|Md|Mendelevium|258|actinide|[Rn]5f13 7s2|+3
102|No|Nobelium|259|actinide|[Rn]5f14 7s2|+2,+3
103|Lr|Lawrencium|266|actinide|[Rn]5f14 7s2 7p1|+3
104|Rf|Rutherfordium|267|transition metal|[Rn]5f14 6d2 7s2|+4
105|Db|Dubnium|268|transition metal|[Rn]5f14 6d3 7s2|+5
106|Sg|Seaborgium|269|transition metal|[Rn]5f14 6d4 7s2|+6
107|Bh|Bohrium|270|transition metal|[Rn]5f14 6d5 7s2|+7
108|Hs|Hassium|269|transition metal|[Rn]5f14 6d6 7s2|+8
109|Mt|Meitnerium|278|transition metal|[Rn]5f14 6d7 7s2|+3
110|Ds|Darmstadtium|281|transition metal|[Rn]5f14 6d8 7s2|0
111|Rg|Roentgenium|282|transition metal|[Rn]5f14 6d9 7s2|+3
112|Cn|Copernicium|285|transition metal|[Rn]5f14 6d10 7s2|+2
113|Nh|Nihonium|286|post-transition metal|[Rn]5f14 6d10 7s2 7p1|+1
114|Fl|Flerovium|289|post-transition metal|[Rn]5f14 6d10 7s2 7p2|+2
115|Mc|Moscovium|290|post-transition metal|[Rn]5f14 6d10 7s2 7p3|+1
116|Lv|Livermorium|293|post-transition metal|[Rn]5f14 6d10 7s2 7p4|+2
117|Ts|Tennessine|294|halogen|[Rn]5f14 6d10 7s2 7p5|-1
118|Og|Oganesson|294|noble gas|[Rn]5f14 6d10 7s2 7p6|0`;
export type El={z:number;sym:string;name:string;mass:number;cat:string;cfg:string;ox:string[]};
export const elements:El[]=raw.split('\n').map(l=>{const [z,sym,name,mass,cat,cfg,ox]=l.split('|');return {z:+z,sym,name,mass:+mass,cat,cfg,ox:ox?ox.split(','):[]}});
const mass=Object.fromEntries(elements.map(e=>[e.sym,e.mass]));
export const bySym=Object.fromEntries(elements.map(e=>[e.sym,e]));
export function molarMass(f:string):number{
  const st:Record<string,number>[]=[{}];const re=/([A-Z][a-z]?)(\d*)|(\()|\)(\d*)/g;let m;
  const add=(o:Record<string,number>,e:string,n:number)=>{o[e]=(o[e]||0)+n};
  while((m=re.exec(f.replace(/\s/g,'')))){
    if(m[1]){if(!mass[m[1]])return NaN;add(st[st.length-1],m[1],+m[2]||1)}
    else if(m[3])st.push({});
    else{const top=st.pop()!;if(!st.length)return NaN;for(const e in top)add(st[st.length-1],e,top[e]*(+m[4]||1))}}
  return st.length===1&&Object.keys(st[0]).length?Object.entries(st[0]).reduce((s,[e,n])=>s+mass[e]*n,0):NaN}