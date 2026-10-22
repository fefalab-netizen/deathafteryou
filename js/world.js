import {block} from './render.js';
import {assets} from './assets.js';
export const bounds=80,obstacles=[],world=[],scenery=[];
const add=(...args)=>world.push(block(...args));
function solid(x,z,w,d,h,c){obstacles.push({x,z,w:w/2,d:d/2});add(x,h/2,z,w,h,d,c);}
let seed=1847;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const pick=list=>list[Math.floor(rand()*list.length)];
function floor(id,x,z,w=4,d=4,y=.035,turn=0){
 // 0.8m repeats are 20% smaller; atlas borders are matched by terrain family.
 const tileSize=.8,columns=Math.ceil(w/tileSize),rows=Math.ceil(d/tileSize),tw=w/columns,td=d/rows;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++)scenery.push({id,x:x-w/2+(col+.5)*tw,z:z-d/2+(row+.5)*td,w:tw,d:td,y,turn,flat:true});
}
function prop(id,x,z,w,h,collision=null,flip=false){scenery.push({id,x,z,w,h:h||w*assets[id].rect[3]/assets[id].rect[2],flip});if(collision)obstacles.push({x,z:z+collision[2],w:collision[0]/2,d:collision[1]/2});}
export const START={x:0,z:57};
export const inArena=(x,z)=>Math.abs(x)<79&&Math.abs(z)<79;
export const landmarks=[{x:0,z:0,name:'ANGEL COURT'},{x:0,z:59,name:'SOUTH GATE'},{x:-45,z:35,name:'POTTER FIELD'},{x:45,z:35,name:'EAST GARDEN'},{x:-46,z:-38,name:'OLD GRAVES'},{x:46,z:-38,name:'CRYPT WALK'}];
export function districtName(x,z){if(Math.abs(x)<12)return z>45?'SOUTH GATE':z< -48?'RUINED CHAPEL':'ANGEL COURT';return z>0?(x<0?'POTTER FIELD':'EAST GARDEN'):(x<0?'OLD GRAVES':'CRYPT WALK');}
add(0,-.22,0,164,.4,164,'#55573b');
// Connected walking network: stone central avenue, crosswalks and weathered outer circuit.
const near=(n,c,r)=>Math.abs(n-c)<r;
export function surfaceAt(x,z){
 if(Math.abs(x)<5&&Math.abs(z)<5)return 'plaza';
 if(Math.abs(x)<8&&near(z,-61,6))return 'chapel';
 const avenue=Math.sin(z*.075)*.9;
 if(Math.abs(x)<2||Math.abs(z)<2||near(Math.abs(x),42,1.6)||near(Math.abs(z),42,1.6))return 'path';
 if(near(Math.abs(x),70,1.5)||near(Math.abs(z),70,1.5))return 'trail';
 return 'grass';
}
// Actual grass/moss tiles form broad planting patches; texture detail stays visible.
for(let row=0;row<200;row++)for(let col=0;col<200;col++){
 const x=-80+(col+.5)*.8,z=-80+(row+.5)*.8;
 const type=surfaceAt(x,z);
 const patch=Math.abs(Math.sin(Math.floor(x/6)*12.9898+Math.floor(z/6)*78.233)*43758.5453)%1;
 const id=type==='grass'?(patch<.6?'grass':patch<.93?'moss-grass':'flowers'):type==='trail'?'dirt-track':pick(['paving','paving','broken-paving']);
 floor(id,x,z,.8,.8,.035,0);
}
// Small irregular stones soften selected path edges instead of continuous concrete curbs.
for(let z=-67;z<70;z+=3.3){if(Math.abs(z)<10)continue;const x=Math.sin(z*.075)*.9;
 for(const side of [-1,1])if(rand()<.30)prop('grass-tuft',x+side*(2+rand()*.4),z,.45+rand()*.3,.3);
}
// Angel court: candles, sarcophagi and four open routes, with a raised stone plinth.
solid(0,0,3.1,2.6,.35,'#7b7962');prop('mourning-angel',0,.8,3.6,4.6,[2.1,1.6,-.6]);
for(const x of [-7,7]){prop('sarcophagus',x,0,3.8,2.5,[2.7,1.6,-.4]);prop('urn',x,5,1.4,1.8,[.65,.65,-.1]);}
for(const x of [-2.3,2.3])for(const z of [-1.5,2])prop('candles',x,z,1.1,1.2);
for(const x of [-6,6])prop('lantern',x,10,1.1,1.5);
// Closely observed graveyard objects replace the plain rectangular headstones.
// Four-metre rows and open breaks preserve combat lanes around every grave block.
for(const sx of [-1,1])for(const sz of [-1,1])for(const xx of [9,19,29,52,62])for(const zz of [18,30,52,64]){
 const x=sx*xx+(rand()-.5)*1.1,z=sz*zz+(rand()-.5)*1.3;if(sx===1&&sz===-1&&xx>48&&zz<35)continue;
 const r=rand();
 if(r<.045){if(sx<0&&sz>0){START.x=x;START.z=z+.15;}prop('open-grave',x,z+1,2.6,2.4);prop('shovel',x+1.4,z+1,1.15,1.7);}
 else if(r<.07){prop('coffin',x,z+1,2.1,2.5,[1.2,1.8,-.5]);}
 else {const id=pick(['headstone','headstone','headstone','cross','broken-stone']);prop(id,x,z,1.9,2.1,[1,.55,-.15]);}
 if(rand()<.65)prop('wildflowers',x+.9,z+1.5,1,1);
 if(rand()<.18)prop('candles',x-.8,z+.4,.7,.85);
 if(rand()<.035)prop('bones',x+.4,z+2,1.2,.8);
}
// Family tombs: individually identifiable facades and walkable space around each.
for(const [x,z,id] of [[53,-25,'mausoleum'],[63,-25,'gothic-shrine'],[53,-17,'crypt-door'],[63,-17,'columbarium']]){
 floor('paving',x,z,6,6,.05);prop(id,x,z+1,5.6,5.4,[4,3,-.8]);prop('urn',x-2.5,z+2,1.2,1.5);prop('bush',x+2.8,z,1.8,1.3);
}
// A broken chapel, with a clear front entrance and northern breach.
for(const x of [-9,9])for(const z of [-55,-61,-66])prop('ruined-wall',x,z,3.2,2.5,[1,2.2,-.4],x<0);
for(const x of [-6,6])prop('gothic-window',x,-66,4,4.8,[3,.8,-.2]);
prop('arch',0,-53,6.5,5.6);obstacles.push({x:-2.7,z:-53,w:.45,d:.6},{x:2.7,z:-53,w:.45,d:.6});
prop('angel',0,-65,2.5,3.2,[1.5,1,-.2]);
for(const [x,z] of [[-5,-58],[5,-61]]){prop('timbers',x,z,3.4,1.2);prop('stones',x+1,z+1,1.4,.9);}
// Low railings frame family plots; gaps at intersections are deliberate.
for(const x of [-35,35])for(const z of [-29,-21,21,29,53,61])prop('small-fence',x,z,3.1,2,[2.6,.35,-.2]);
for(const s of [-1,1])for(const t of [-66,-58,-50,-30,-22,-14,14,22,30,50,58,66]){
 prop(pick(['oak','oak','pine']),s*76,t,5+rand()*1.5,6+rand()*2,[.85,.85,0],rand()>.5);
 if(Math.abs(t)>13)prop(pick(['oak','dead-tree']),t,s*76,5.5,7,[.9,.9,0]);
}
// Interior copses break up long rows but never block the principal paths.
for(const [x,z] of [[-13,58],[13,58],[-16,45],[16,45],[-35,10],[34,12],[-34,-12],[34,-12],[-51,10],[52,11],[-52,-52],[33,59]]){
 prop(pick(['oak','oak','dead-tree']),x,z,6,7,[.8,.8,0]);prop('roots',x+.8,z+.2,2.5,1.4);prop('bush',x-1,z+1,2,1.3);
}
for(const [x,z] of [[-59,-11],[58,11],[-29,-56],[28,54]])prop('fallen-log',x,z,4,1.7,[3,1,-.3]);
for(const x of [-5.7,5.7])for(const z of [-46,-34,-12,12,34,46,62])prop('lantern',x,z,1.05,1.5);
prop('sign',-5.5,58,1.8,2.1);prop('raven',5.7,56,1.5,2);
// Perimeter masonry remains solid 3D, dressed with crumbling stonework and ivy.
for(const s of [-1,1]){solid(s*79,0,.7,158,.9,'#615f4d');solid(0,s*79,158,.7,.9,'#615f4d');
 for(let t=-74;t<=74;t+=8){prop('wall-end',s*78,t,3,2.6);if(Math.abs(t)>8)prop(pick(['iron-panel','broken-fence','wall-end']),t,s*78,5,2.7);}}
prop('gate',0,74,8,6,[7,.4,0]);prop('corner-wall',-6,74,4,3);prop('corner-wall',6,74,4,3,null,true);
// Rubble clusters tell the story of damaged masonry, never a road/asphalt pile.
for(const [x,z] of [[-12,-66],[12,-57],[49,-30],[67,-30],[-66,61],[65,52],[-31,12]]){
 prop('wall-rubble',x,z,3.7,1.8,[2.3,1,-.2]);prop('bricks',x+1.5,z+1,1.5,.8);prop('brush',x-1,z,1.4,1.3);
}
// Planting is clustered around trees and boundaries; lawns remain quiet for combat readability.
for(const [cx,cz] of [[-35,10],[34,12],[-34,-12],[34,-12],[-51,10],[52,11],[-52,-52],[33,59],[-73,54],[73,-50]]){
 for(let i=0;i<9;i++){const a=rand()*Math.PI*2,r=1.8+rand()*2.6,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r;
 if(surfaceAt(x,z)!=='grass')continue;prop(pick(['grass-tuft','wildflowers','bush']),x,z,.6+rand(),.45+rand()*.65);}
}
for(let i=0;i<65;i++){const x=rand()*146-73,z=rand()*146-73;if(surfaceAt(x,z)!=='grass')continue;prop('grass-tuft',x,z,.35+rand()*.4,.25);}
// Only exit: mortuary facade against the northern perimeter, with a clear approach.
floor('paving',0,-71,8,8,.06);
solid(-5,-73,1,8,3.5,'#666653');solid(5,-73,1,8,3.5,'#666653');
solid(0,-77,11,.6,3.5,'#666653');
prop('mausoleum',0,-72,10,8);prop('lantern',-3.7,-69,1.2,1.6);prop('lantern',3.7,-69,1.2,1.6);
export const outdoorObstacles=obstacles.map(o=>({...o}));
let activeLimit=bounds;
export function setCollisionScene(list,limit=bounds){obstacles.splice(0,obstacles.length,...list.map(o=>({...o})));activeLimit=limit;lastCell=-1;for(let z=0;z<N;z++)for(let x=0;x<N;x++)occupied[z*N+x]=blocked(x-bounds,z-bounds,.48)?1:0;}export function blocked(x,z,r=.4){return Math.abs(x)>activeLimit-r||Math.abs(z)>activeLimit-r||obstacles.some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r);}
export function move(a,dx,dz,r=.38){if(!blocked(a.x+dx,a.z,r))a.x+=dx;if(!blocked(a.x,a.z+dz,r))a.z+=dz;}
// Grid distance field shared by all zombies; rebuilt only as the player changes cell.
const N=bounds*2+1,field=new Int16Array(N*N),queue=new Int32Array(N*N),occupied=new Uint8Array(N*N);let lastCell=-1;
const cell=(x,z)=>[Math.max(0,Math.min(N-1,Math.round(x)+bounds)),Math.max(0,Math.min(N-1,Math.round(z)+bounds))];
for(let z=0;z<N;z++)for(let x=0;x<N;x++)occupied[z*N+x]=blocked(x-bounds,z-bounds,.48)?1:0;
export function rebuildField(px,pz){const [x,z]=cell(px,pz),start=z*N+x;if(start===lastCell)return;lastCell=start;field.fill(-1);field[start]=0;queue[0]=start;let head=0,tail=1;while(head<tail){const i=queue[head++],cx=i%N,cz=Math.floor(i/N);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz,j=nz*N+nx;if(nx<0||nz<0||nx>=N||nz>=N||occupied[j]||field[j]>=0)continue;field[j]=field[i]+1;queue[tail++]=j;}}}
export function direction(x,z,px,pz){const distance=Math.hypot(px-x,pz-z);let clear=true;for(let d=.3;d<distance;d+=.45)if(blocked(x+(px-x)*d/distance,z+(pz-z)*d/distance,.46)){clear=false;break;}if(clear)return [px-x,pz-z];const [cx,cz]=cell(x,z);let best=Infinity,target=null;for(const [dx,dz] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=N||nz>=N)continue;const score=field[nz*N+nx];if(score>=0&&score<best){best=score;target=[nx-bounds-x,nz-bounds-z];}}return target||[0,0];}
export function rayBox(x,z,dx,dz,o){let near=0,far=60;for(const [p,d,min,max] of [[x,dx,o.x-o.w,o.x+o.w],[z,dz,o.z-o.d,o.z+o.d]]){if(Math.abs(d)<.00001){if(p<min||p>max)return Infinity;}else{let a=(min-p)/d,b=(max-p)/d;if(a>b)[a,b]=[b,a];near=Math.max(near,a);far=Math.min(far,b);if(near>far)return Infinity;}}return near;}





