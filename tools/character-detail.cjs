const fs=require('fs'),p='deathcomesafteryou part1/';
let z=fs.readFileSync(p+'js/zombies.js','utf8');z+=`\n// Persistent per-enemy shirt choice; index zero retains each type's original shirt.
export const SHIRT_COLORS=[null,'#a44840','#446fa0','#b69b43','#82558f'];
export function rollShirt(value=Math.random()){return value<.40?0:value<.55?1:value<.70?2:value<.85?3:4;}
`;fs.writeFileSync(p+'js/zombies.js',z);
let g=fs.readFileSync(p+'js/game.js','utf8').replace('TYPES,waveRoster,WAVES','TYPES,waveRoster,WAVES,rollShirt');g=g.replace("{kind,encounter:'arena'","{kind,shirtVariant:rollShirt(),encounter:'arena'").replace('return {kind,x,z,encounter,','return {kind,shirtVariant:rollShirt(),x,z,encounter,');g=g.replace('player.animation+=traveled/.95','player.animation+=traveled/1.35');g=g.replace("clock,a.weapon||'pistol')","clock,a.weapon||'pistol',a.shirtVariant||0)");fs.writeFileSync(p+'js/game.js',g);
let r=fs.readFileSync(p+'js/render.js','utf8').replace("import {TYPES}","import {TYPES,SHIRT_COLORS}");
r=r.replace('const BEVEL=bevelGeometry();','const BEVEL=profileGeometry([[-1,.78,.78],[-.78,1,1],[.78,1,1],[1,.78,.78]]);');
const a=r.indexOf(' const outline=',r.indexOf('function profileGeometry')),b=r.indexOf('\n return out;',a);
r=r.slice(0,a)+` const outline=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return [Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.48),Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.48)];}),out=[];
 // Additional contour rings shape the silhouette instead of subdividing flat faces.
 const expanded=[];for(let i=0;i<rings.length;i++){expanded.push(rings[i]);if(i<rings.length-1){const a=rings[i],b=rings[i+1];expanded.push([(a[0]+b[0])/2,(a[1]+b[1])*.505,(a[2]+b[2])*.505,((a[3]||0)+(b[3]||0))/2]);}}
 rings=expanded;
 const rows=rings.map(r=>outline.map(([x,z])=>[x*r[1],r[0],z*r[2]+(r[3]||0)]));
 const tri=(a,b,c)=>{const n=V.unit(V.cross(V.sub(b,a),V.sub(c,a)));for(const p of [a,b,c])out.push(...p,...n);};
 for(let k=0;k<rows.length-1;k++)for(let i=0;i<16;i++){const j=(i+1)%16;tri(rows[k][i],rows[k+1][i],rows[k+1][j]);tri(rows[k][i],rows[k+1][j],rows[k][j]);}
 for(const k of [0,rows.length-1])for(let i=0;i<16;i++){const a=[0,rings[k][0],rings[k][3]||0];if(k===0)tri(a,rows[k][i],rows[k][(i+1)%16]);else tri(a,rows[k][(i+1)%16],rows[k][i]);}`+r.slice(b);
r=r.replace("weapon='pistol'){","weapon='pistol',shirtVariant=0){");r=r.replace('const key=[kind,weapon,state','const key=[kind,shirtVariant,weapon,state');r=r.replace("color=zombie?type.shirt:'#626b4e'","color=zombie?(SHIRT_COLORS[shirtVariant]||type.shirt):'#626b4e'");
r=r.replace('color,box});','color,box,geometry:box?BEVEL:undefined});');
r=r.replace('cache=new Map();','cache=new Map();let cacheBytes=0;const CACHE_BYTE_LIMIT=48*1024*1024;');
r=r.replace('cache.set(key,mesh);','cache.set(key,mesh);cacheBytes+=mesh.byteLength;');r=r.replace('if(cache.size>480)cache.delete(cache.keys().next().value);','while(cache.size>480||cacheBytes>CACHE_BYTE_LIMIT){const oldest=cache.keys().next().value;cacheBytes-=cache.get(oldest).byteLength;cache.delete(oldest);}');
r=r.replace('Rings have eight angular vertices','Rings have sixteen angular vertices');fs.writeFileSync(p+'js/render.js',r);
