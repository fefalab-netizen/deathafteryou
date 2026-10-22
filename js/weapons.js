import {BAT} from './combat.js';
const melee=(name,duration,impact,cost,reach,damage,stagger=true)=>({name,type:'melee',duration,impact,cost,reach,damage,stagger,arc:Math.PI*.4,maxHits:3});
const gun=(name,damage,interval,magazine,reload,range,spread=0,pellets=1)=>({name,type:'gun',damage,interval,magazine,reload,range,spread,pellets});
export const WEAPONS={
 bat:{...melee('Wooden bat',.7,.4,18,1.9,3),...BAT},
 knife:{...melee('Gravekeeper’s knife',.42,.21,10,1.05,2,false),arc:Math.PI*.23,maxHits:1},
 crowbar:melee('Crowbar',.78,.43,19,1.6,4),
 hatchet:melee('Hatchet',.64,.34,17,1.35,4),
 machete:melee('Machete',.58,.31,15,1.65,3,false),
 shovel:melee('Grave shovel',.94,.55,24,2.2,5),
 hammer:melee('Sledgehammer',1.2,.7,32,1.8,8),
 pistol:gun('Service pistol',3,.3,12,1.5,25,.025),
 revolver:gun('Heavy revolver',5,.55,6,2.4,30,.015),
 compact:gun('Pocket pistol',2,.25,7,1.3,18,.045),
 shotgun:gun('Pump shotgun',2,.95,5,3.2,16,.16,6),
 doublebarrel:gun('Double-barrel shotgun',2,.42,2,2.8,14,.20,8),
 smg:gun('Compact SMG',2,.11,20,2,24,.07),
 carbine:gun('Patrol carbine',4,.2,20,2.2,38,.025),
 rifle:gun('Hunting rifle',8,1.15,5,2.8,50,.008)
};
export function meleeStats(id,rank=0){const w=WEAPONS[id];return {...w,maxHits:id==='bat'?Math.max(1,Math.floor((rank+1)/2)):w.maxHits,duration:w.duration*(1-.015*rank),impact:w.impact*(1-.015*rank),cost:Math.max(4,w.cost-rank)};}
// Two single-use search sites, each with only an 8% chance of a weapon.
// No weapon drops, rerolls or regenerating ammunition.
export function createLoot(random=Math.random){
 const items=[{id:'knife',x:-12,z:-62,guaranteed:true}];
 const rare=Object.keys(WEAPONS).filter(id=>!['bat','knife'].includes(id));
 for(const [x,z] of [[-43,39],[43,-39]])if(random()<.08)items.push({id:rare[Math.min(rare.length-1,Math.floor(random()*rare.length))],x,z});
 return items;
}

export const HEALTH_BOX={heal:14,chance:.02};
export function rollHealthDrop(value=Math.random(),health=100){return value<(health<30?.12:HEALTH_BOX.chance); }
