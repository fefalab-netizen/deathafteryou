import * as weapons from './js/weapons.js';import * as progression from './js/progression.js';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import * as world from './js/world.js';import * as types from './js/zombies.js';import * as combat from './js/combat.js';
const elements=new Map(),ctx=new Proxy({},{get:()=>()=>{}});function el(id){if(!elements.has(id))elements.set(id,{style:{},hidden:true,value:'1.5',checked:true,getContext:()=>ctx,addEventListener(){},querySelector:()=>({style:{}})});return elements.get(id);}
const renderer={setWorld(){},setScenery(){},resize(){},begin(){},setFlashlight(){},append(){},draw(){},screenGround:()=>[0,0],illuminated:()=>true};
const scope={...world,...types,...combat,...weapons,...progression,console,Math,Set,innerWidth:1280,innerHeight:720,document:{getElementById:el,createElement:()=>el('temp'),addEventListener(){}},window:{addEventListener(){}},matchMedia:()=>({matches:false}),requestAnimationFrame(){},WorldRenderer:class{constructor(){return renderer;}},bake:()=>[],block:()=>({}),characterMesh:()=>[],muzzlePosition:()=>[0,0,0]};vm.createContext(scope);
const src=fs.readFileSync(new URL('./js/game.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');vm.runInContext(src,scope);vm.runInContext(`begin();if(player.weapon!=='bat'||zombies.length)throw Error('Bad starting loadout');update(.01);`,scope);
for(let wave=1;wave<=10;wave++){assert.equal(vm.runInContext('wave',scope),wave);assert.equal(vm.runInContext('pending',scope),types.WAVES[wave-1]);vm.runInContext(`for(let i=0;i<1000&&pending;i++){if(spawn())pending--;else zombies=[];}if(pending)throw Error('Spawn failed');if(zombies.some(z=>!['normal','crawler'].includes(z.kind)))throw Error('Wrong enemy');zombies=[];pending=0;player.health=37;update(.01);if(player.health!==37)throw Error('Wave clear healed player');`,scope);if(wave<10)vm.runInContext('startWave()',scope);}
assert.equal(vm.runInContext('won && !running',scope),true);vm.runInContext('startWave()',scope);assert.equal(vm.runInContext('wave',scope),10);vm.runInContext('begin()',scope);assert.equal(vm.runInContext('won || wave!==0 || player.health!==100',scope),false);
world.rebuildField(world.START.x,world.START.z);for(const [x,z] of [[0,-55],[-42,-42],[42,42],[-71,0],[71,0]]){assert(!world.blocked(x,z));const d=world.direction(x,z,world.START.x,world.START.z);assert(Math.hypot(...d)>0,'Disconnected route');}
console.log('PASS: no wave healing, starting bat, ten wave counts, allowed enemies, spawn clearance, victory cap, restart and key navigation routes.');

vm.runInContext(`
begin();
player.x=-12;player.z=-62;interact();
if(!inventory.includes('knife')||loot.some(i=>i.id==='knife'))throw Error('Knife pickup failed');
switchWeapon();if(player.weapon!=='knife')throw Error('Knife equip failed');
setCollisionScene([]);player.x=player.z=0;player.yaw=0;
const victim=createEnemy('normal',0,.8,'arena');victim.attack=.1;zombies=[victim];
startSwing();batImpact();
if(victim.health!==2||victim.hurt!==0||victim.attack!==.1||victim.z!==.8)throw Error('Knife damage/stagger/knockback mismatch');
if(player.swingStats.cost!==10||player.swingStats.duration>=BAT.duration)throw Error('Knife handling mismatch');
const count=progress.stats.swings;startSwing();if(progress.stats.swings!==count)throw Error('Swing double counted');
player.swing=-1;player.stamina=0;startSwing();if(progress.stats.swings!==count)throw Error('Failed swing counted');
progress.stats.swings=49;player.weapon='bat';player.stamina=100;player.exhausted=false;startSwing();
if(skillRank(progress,'melee')!==1)throw Error('Rank one should unlock at 50 swings');
if(meleeStats('bat',1).cost!==17)throw Error('Rank one cost');
progress.stats.swings=149;player.swing=-1;player.stamina=100;startSwing();
if(skillRank(progress,'melee')!==2)throw Error('Rank two should unlock at 150 total swings');
player.swing=-1;player.weapon='pistol';inventory.push('pistol');weaponAmmo.pistol={loaded:1,reserve:2};player.ammo=1;player.shot=0;zombies=[];
fire();if(player.ammo!==0||progress.stats.shots!==1)throw Error('Shot accounting');
player.shot=0;reload();player.reload=.001;update(.01);
if(player.ammo!==2||weaponAmmo.pistol.reserve!==0)throw Error('Finite reload failed');
player.ammo=0;reload();if(player.reload!==0)throw Error('Ammo created from nothing');
begin();if(inventory.length!==1||player.weapon!=='bat'||!loot.some(i=>i.id==='knife')||skillRank(progress,'melee')!==2)throw Error('Run reset/persistent ranks failed');
`,scope);
console.log('PASS: knife discovery/equip, no stagger or knockback, failed-action accounting, melee ranks, finite ammo and run-reset boundaries.');

vm.runInContext(`
begin();setCollisionScene([]);player.x=player.z=0;loot=[{id:'health',x:0,z:0}];player.health=50;interact();
if(player.health!==64||loot.length)throw Error('Health box must restore 14 and be consumed');
loot=[{id:'health',x:0,z:0}];player.health=limits().health;interact();if(!loot.length)throw Error('Full health wasted box');
player.health=limits().health-3;interact();if(player.health!==limits().health||loot.length)throw Error('Health overflow');
const oldRandom=Math.random;Math.random=()=>.019;const z=createEnemy('normal',0,1,'arena');zombies=[z];killEnemy(z);killEnemy(z);Math.random=oldRandom;
if(loot.filter(i=>i.id==='health').length!==1)throw Error('Drop roll/double death guard failed');
`,scope);
assert.equal(weapons.rollHealthDrop(.019999),true);assert.equal(weapons.rollHealthDrop(.02),false);
assert.equal(Array.from({length:10000},(_,i)=>weapons.rollHealthDrop((i+.5)/10000)).filter(Boolean).length,200);
console.log('PASS: exact 2% drop interval, one drop per kill, +14 healing, max-health cap and full-health preservation.');
vm.runInContext(`
function movementCheck(key,sprinting,expected){begin();setCollisionScene([]);player.x=player.z=0;player.yaw=0;mouse.seen=true;mouse.x=mouse.y=0;renderer.screenGround=()=>[0,10];keys.clear();keys.add(key);if(sprinting)keys.add('ShiftLeft');arenaTriggered=true;update(.01);const actual=Math.hypot(player.x,player.z)/.01;if(Math.abs(actual-expected)>1e-6)throw Error('Movement speed mismatch '+actual+' expected '+expected);}
movementCheck('KeyS',false,3.6*.92);movementCheck('KeyW',false,3.6*.6*.96);movementCheck('KeyS',true,5.2*.92);movementCheck('KeyD',false,3.6*.9);
`,scope);
console.log('PASS: forward/run -8%, backward -4%, sideways unchanged.');
