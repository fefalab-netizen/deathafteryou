import assert from 'node:assert/strict';
import {characterMesh,WorldRenderer} from './js/render.js';
import {rollShirt,SHIRT_COLORS,TYPES} from './js/zombies.js';
const counts=[0,0,0,0,0];for(let i=0;i<10000;i++)counts[rollShirt((i+.5)/10000)]++;
assert.deepEqual(counts,[4000,1500,1500,1500,1500]);
const crowdTriangles={wrecker:3288,normal:3080,runner:3160,worker:3176,crawler:3080,brute:3176};
for(const kind of ['human',...Object.keys(TYPES)]){
 const mesh=characterMesh(kind,'idle',0,false,0,0,'bat');assert(mesh.every(Number.isFinite));assert.equal(mesh.length/27,kind==='human'?10304:crowdTriangles[kind]);
 if(kind!=='human')for(const state of ['walk','attack','hit','dead'])for(const time of [0,.2,.6,1]){
  const pose=characterMesh(kind,state,time,state==='walk',0,time,'bat');
  assert(pose.every(Number.isFinite),`${kind} ${state} has invalid vertices`);
  assert.equal(pose.length/27,crowdTriangles[kind],`${kind} ${state} must use the reduced crowd mesh`);
 }
 console.log(kind,mesh.length/27,'triangles');
}
for(const kind of ['normal','crawler'])for(let variant=0;variant<5;variant++){
 const rgb=(SHIRT_COLORS[variant]||TYPES[kind].shirt).match(/\w\w/g).map(c=>parseInt(c,16)/255);
 for(const state of ['idle','attack','dead']){const mesh=characterMesh(kind,state,.2,false,0,.2,'bat',variant);assert.strictEqual(mesh,characterMesh(kind,state,.2,false,0,.2,'bat',0),'Shirts must share pose geometry');const renderer={dynamic:new Float32Array(mesh.length),used:0};WorldRenderer.prototype.append.call(renderer,mesh,0,0,0,0,1,variant);let found=false;for(let i=6;i<mesh.length;i+=9)if(rgb.every((c,j)=>Math.abs(c-renderer.dynamic[i+j])<1e-6)){found=true;break;}assert(found,`${kind} ${state}: shirt ${variant} missing`);}
}
console.log('PASS: 40/15/15/15/15 color probability intervals, finite detailed meshes, and persistent shirt colors across animation states.');



for(const state of ['idle','swing','hit','dead'])for(const time of [0,.15,.3,.45,.6]){
 const mesh=characterMesh('human',state,time,false,0,time,'bat');assert(mesh.batGripGap<.001,'Supporting hand must remain on bat handle');
}
console.log('PASS: two-handed bat grip through idle, attacks, hit reactions and death.');
