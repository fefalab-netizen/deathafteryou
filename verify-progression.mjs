import assert from 'node:assert/strict';
import {freshProgress,rankProgress,loadProgress,saveProgress,SAVE_KEY,bonuses} from './js/progression.js';
import {WEAPONS,meleeStats,createLoot} from './js/weapons.js';
import {characterMesh} from './js/render.js';
import {blocked,rebuildField,direction,START} from './js/world.js';
for(const [total,rank,current,needed] of [[49,0,49,50],[50,1,0,100],[149,1,99,100],[150,2,0,150],[300,3,0,200],[2750,10,0,0]]){
 assert.deepEqual(rankProgress(total,50),{rank,current,needed});
}
let saved;const storage={getItem:()=>saved,setItem:(key,value)=>{assert.equal(key,SAVE_KEY);saved=value;}};
const p=freshProgress();p.stats.swings=150;p.stats.seconds=300;
assert(saveProgress(storage,p));assert.deepEqual(loadProgress(storage),p);assert.equal(bonuses(p).health,102);
saved='bad JSON';assert.deepEqual(loadProgress(storage),freshProgress());
saved=JSON.stringify({version:1,stats:{swings:-12,shots:'500'}});assert.deepEqual(loadProgress(storage),freshProgress());
assert.equal(saveProgress(undefined,p),false);
assert.equal(createLoot(()=>.99).length,1);assert.equal(createLoot(()=>0).length,3);
assert.equal(Object.keys(WEAPONS).length,15);
for(const [id,w] of Object.entries(WEAPONS)){
 for(const state of ['idle','swing','shoot','reload'])assert(characterMesh('human',state,.2,false,0,.2,id).every(Number.isFinite));
 if(w.type==='melee'){assert(meleeStats(id,10).cost>=4);assert(meleeStats(id,10).duration>0);}
}
rebuildField(START.x,START.z);
for(const item of createLoot(()=>0)){assert(!blocked(item.x,item.z,.4));assert(Math.hypot(...direction(item.x,item.z,START.x,START.z))>0,'Loot unreachable');}
console.log('PASS: cumulative ranks, capped benefits, persistence/corrupt storage, rarity, 15 finite weapon models, reachable loot.');
