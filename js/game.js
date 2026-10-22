import {MORTUARY_PLANS} from './mortuary-plan.js?v=1';
import {showCompanion,closeCompanion} from './companion.js?v=2';
import {showIntro} from './intro.js?v=typing-3';
import {newNeeds,needLevels,advanceNeeds,needPenalties,nightSpeed} from './survival.js';
import {WEAPONS,meleeStats,createLoot,HEALTH_BOX,rollHealthDrop} from './weapons.js?v=low-health-1';
import {SKILLS,freshProgress,loadProgress,saveProgress,skillRank,rankProgress,bonuses} from './progression.js';
import {TOWER,WRECKER_HOME,makeFloor,makeRoof,makePassage} from './dungeon.js?v=puzzle-2';
import {BAT,STAMINA} from './combat.js';
import {TYPES,waveRoster,WAVES,rollShirt} from './zombies.js?v=undertaker-1';
import {WorldRenderer,DEATH_SETTLE_TIME,characterMesh,muzzlePosition,bake,block} from './render.js?v=undertaker-1';
import {world,obstacles,blocked,move,bounds,rebuildField,direction,rayBox,START,inArena,districtName,outdoorObstacles,setCollisionScene,scenery} from './world.js?v=undertaker-1';

const $=id=>document.getElementById(id),canvas=$('game'),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let renderer;
try{renderer=new WorldRenderer(canvas);renderer.setWorld(world);renderer.setScenery(scenery);}catch(e){$('error').hidden=false;$('errorText').textContent=e.message;throw e;}
const config={speed:3.6,runSpeed:5.2,magazine:12,reload:1.35,fireInterval:.22,zombieHealth:2,zombieSpeed:1.05,maxAlive:60};
const player={x:START.x,z:START.z,yaw:Math.PI,health:100,ammo:12,reload:0,shot:0,hurt:0,animation:0,idleAnimation:0,moving:false,moveYaw:0,slow:0,vx:0,vz:0,weapon:'bat',stamina:100,regenDelay:0,exhausted:false,swing:-1,swingHit:false,swingYaw:0};
let storage;try{storage=window.localStorage;}catch{}
const progress=loadProgress(storage);progress.runStats=freshProgress().stats;progress.developer=false;let saveClock=0,saveOK=true,inventory=['bat'],weaponAmmo={},loot=[];
const needs=newNeeds();
const limits=()=>bonuses(progress),equipped=()=>WEAPONS[player.weapon];
function persist(){saveOK=saveProgress(storage,progress);}
function track(stat,amount=1){const before=Object.entries(SKILLS).filter(([,s])=>s.stat===stat).map(([id])=>[id,skillRank(progress,id)]);progress.stats[stat]+=amount;progress.runStats[stat]+=amount;for(const [id,rank] of before)if(skillRank(progress,id)>rank){announce(SKILLS[id].name.toUpperCase()+' · RANK '+skillRank(progress,id));persist();}}
let mobileSprint=false,developerInvulnerable=false;
let companionSeen=false,companionActive=false,hudMode='story',hudStage=0;
let mortuaryState={},jumpPrompt=false;
let bossSpawned=false,hasExitKey=false,thoughtUntil=0,thoughtCooldown=0,wallThought=false;
function applyHud(){const visible=hudMode==='on'||(hudMode==='story'&&companionSeen);document.body.classList.toggle('hud-off',!visible);document.body.dataset.hudStage=hudMode==='on'?'3':String(hudStage);for(const id of ['hudToggle','pauseHudToggle']){$(id).textContent='HUD: '+hudMode.toUpperCase();$(id).setAttribute('aria-label','HUD mode: '+hudMode+'. Click to cycle story, on, off.');}}
function meetCompanion(){companionSeen=true;companionActive=true;paused=true;clearInput();$('nextWave').hidden=true;showCompanion(stage=>{hudStage=stage;applyHud();},()=>{companionActive=false;paused=false;clearInput();});}

let arenaTriggered=false,won=false;
let dungeonLevel=-1,dungeonComplete=false,bossDefeated=false,floors=[],savedOutdoor=null,entryPrompt=false;
let roster=[],zombies=[],corpses=[],tracers=[],wave=0,kills=0,pending=0,spawnTimer=0,between=0,running=false,paused=false,dead=false,started=false,elapsed=0,deathTime=0,announcementTime=0;
let cameraX=START.x,cameraZ=START.z,quality=.5,previous=0,fpsClock=0,fpsFrames=0;
const keys=new Set(),mouse={x:innerWidth/2,y:innerHeight/2,down:false,seen:false},sticks={move:{x:0,y:0,id:null},aim:{x:0,y:0,id:null}};
const shadow=bake([block(0,.055,0,.75,.018,.5,'#292d27')]);
const healthPickup=bake([block(0,.19,0,.48,.30,.36,'#c4cdb6'),block(0,.35,0,.28,.02,.075,'#557962'),block(0,.35,0,.075,.02,.25,'#557962')]);
const flashlightPickup=bake([block(0,.14,0,.13,.13,.40,'#65726b'),block(0,.14,-.23,.20,.20,.10,'#c5ccae')]);
const knifePickup=bake([block(0,.12,0,.10,.08,.32,'#c0c4af'),block(0,.10,.24,.12,.10,.20,'#644b36')]),cachePickup=bake([block(0,.18,0,.55,.3,.35,'#6b6750')]);
const keyPickup=bake([block(0,.18,0,.12,.08,.55,'#c7aa65'),block(0,.18,-.27,.3,.08,.22,'#c7aa65'),block(.1,.18,.2,.18,.08,.07,'#c7aa65')]);
const sight=bake([block(0,.025,0,.05,.02,.4,'#b2c68d')]);
let audio;
function sound(type){try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;osc.type=type==='shot'?'sawtooth':'triangle';osc.frequency.setValueAtTime(type==='shot'?150:type==='hit'?75:440,now);osc.frequency.exponentialRampToValueAtTime(type==='shot'?35:40,now+.09);gain.gain.setValueAtTime(type==='shot'?.035:.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.12);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(now+.13);}catch{/* Audio is optional; the game remains playable without it. */}}
function announce(text){$('announcement').textContent=text;announcementTime=3;$('announcement').style.opacity=1;}
function clearInput(){player.charge=-1;keys.clear();mouse.down=false;mobileSprint=false;for(const [name,s] of Object.entries(sticks)){s.x=s.y=0;s.id=null;$(name==='move'?'moveStick':'aimStick').querySelector('i').style.transform='';}}
function isPortrait(){return matchMedia('(pointer:coarse) and (orientation:portrait)').matches;}
function setPaused(value){if(!started||dead||entryPrompt||companionActive||jumpPrompt)return;paused=value;clearInput();$('pauseMenu').hidden=!value;$('crosshair').style.display='none';}
function begin(){mortuaryState={};jumpPrompt=false;$('jumpPrompt').hidden=true;closeCompanion();companionSeen=companionActive=false;hudStage=0;bossSpawned=hasExitKey=wallThought=false;thoughtUntil=thoughtCooldown=0;applyHud();Object.assign(needs,newNeeds());progress.runStats=freshProgress().stats;player.flashlight=false;lightStamp=-1;loot=createLoot();loot.push({id:'flashlight',x:24,z:27});inventory=['bat'];weaponAmmo={};track('runs');$('introMenu').hidden=true;$('journal').hidden=true;quality=+$('quality').value;roster=[];zombies=[];corpses=[];tracers=[];wave=kills=pending=0;between=spawnTimer=elapsed=deathTime=0;Object.assign(player,{x:START.x,z:START.z,yaw:Math.PI,health:100,ammo:12,reload:0,shot:0,hurt:0,animation:0,idleAnimation:0,moving:false,moveYaw:0,slow:0,vx:0,vz:0,weapon:'bat',stamina:100,regenDelay:0,exhausted:false,swing:-1,swingHit:false,swingYaw:0});player.health=limits().health;player.stamina=limits().stamina;cameraX=START.x;cameraZ=START.z;arenaTriggered=false;won=false;dead=paused=false;$('victoryMenu').hidden=true;running=started=true;clearInput();for(const id of ['menu','pauseMenu','deathMenu'])$(id).hidden=true;$('nextWave').hidden=true;initializeEncounters();placeStarterPistol();announce('BELL ONE · THE DEAD ARE WAKING');sound('ready');}
function startWave(){if(!running||dead||paused||won||wave>=WAVES.length||pending||arenaEnemies())return;wave++;progress.stats.bestWave=Math.max(progress.stats.bestWave,wave);pending=WAVES[wave-1];roster=waveRoster(wave,pending);spawnTimer=2.5;between=0;$('nextWave').hidden=true;announce(`WAVE ${wave} / ${WAVES.length} · ${pending} RISING`);}
function spawn(){const kind=roster[roster.length-1]||'normal',type=TYPES[kind];for(let tries=0;tries<40;tries++){const angle=Math.random()*Math.PI*2,radius=18+Math.random()*9;let x=clamp(player.x+Math.sin(angle)*radius,-75,75),z=clamp(player.z+Math.cos(angle)*radius,-75,75);if(blocked(x,z,type.radius)||Math.hypot(player.x-x,player.z-z)<7||zombies.some(a=>Math.hypot(a.x-x,a.z-z)<type.radius+TYPES[a.kind].radius+.1))continue;zombies.push({kind,shirtVariant:rollShirt(),encounter:'arena',x,z,yaw:0,health:type.hp,speed:type.speed*(.95+Math.random()*.1)+Math.min((wave-1)*.018,.16),animation:Math.random()*3,hurt:0,attack:0,cooldown:Math.random()*.5,struck:false,flank:Math.random()>.5?1:-1,burst:0,burstCooldown:.6+Math.random()*1.2,windup:0,chargeX:0,chargeZ:0});roster.pop();return true;}return false;}function reload(){const w=equipped(),ammo=weaponAmmo[player.weapon];if(!running||dead||paused||w.type!=='gun'||player.reload>0||player.ammo===w.magazine||!ammo?.reserve)return;player.reload=w.reload*limits().reload;sound('ready');}
function fire(){if(equipped().type==='melee'){startSwing();return;}if(player.reload>0||player.shot>0)return;if(player.ammo===0){reload();return;}const w=equipped();player.ammo--;player.shot=w.interval;track('shots');sound('shot');for(let i=0;i<w.pellets;i++)shootRay(w,player.yaw+(Math.random()-.5)*w.spread*2);}
function shootRay(w,yaw){
 const origin=muzzlePosition(player),dx=Math.sin(yaw),dz=Math.cos(yaw);let range=w.range,target=null;
 const mx=origin[0]-player.x,mz=origin[2]-player.z,ml=Math.hypot(mx,mz);
 if(ml>0&&obstacles.some(o=>rayBox(player.x,player.z,mx/ml,mz/ml,o)<ml))range=0;
 for(const o of obstacles)range=Math.min(range,rayBox(origin[0],origin[2],dx,dz,o));
 for(const z of zombies){const r=TYPES[z.kind].radius+.07,rx=z.x-origin[0],rz=z.z-origin[2],along=rx*dx+rz*dz,perp=rx*dz-rz*dx;if(along< -r||Math.abs(perp)>r)continue;const distance=Math.max(0,along-Math.sqrt(r*r-perp*perp));if(distance<range){range=distance;target=z;}}
 tracers.push({x:origin[0],y:origin[1],z:origin[2],dx,dz,length:range,endY:target?.kind==='crawler'?.4:1.12,life:.085});
 if(target){track('hits');target.health-=w.damage;target.hurt=TYPES[target.kind].stagger;target.hitDuration=target.hurt;if(target.health<=0)killEnemy(target);sound('hit');}
}
function killEnemy(target){if(!zombies.includes(target))return;if(rollHealthDrop(Math.random(),player.health))loot.push({id:'health',x:target.x,z:target.z});if(target.kind==='wrecker'){bossDefeated=true;loot.push({id:'exit-key',x:target.x,z:target.z});think('A key. Finally, a useful employee.',true);}kills++;track('kills');corpses.push({...target,age:0});zombies=zombies.filter(z=>z!==target);if(corpses.length>24)corpses.shift();}
function switchWeapon(){if(!running||dead||paused||player.swing>=0||player.charge>=0||player.reload>0)return;if(equipped().type==='gun')weaponAmmo[player.weapon].loaded=player.ammo;player.weapon=inventory[(inventory.indexOf(player.weapon)+1)%inventory.length];player.ammo=weaponAmmo[player.weapon]?.loaded||0;player.shot=0;announce(WEAPONS[player.weapon].name.toUpperCase());}
function startCharge(){if(!running||paused||dead||player.swing>=0||player.charge>=0||equipped().type!=='melee'||player.exhausted)return;player.charge=0;mouse.down=false;}
function releaseCharge(){if(!(player.charge>=0))return;const amount=Math.min(1,player.charge/.65);player.charge=-1;if(running&&!paused&&!dead)startSwing(amount>=.3?amount:0);}
function startSwing(power=0){if(!running||paused||dead||player.charge>=0)return;const w=meleeStats(player.weapon,skillRank(progress,'melee'));if(power>0){w.heavy=true;w.power=power;w.damage*=1+.75*power;w.cost=Math.ceil(w.cost*1.5);w.duration*=1.2;w.impact=w.duration*.38;w.arc*=.7;}if(player.swing>=0||player.stamina<w.cost||player.exhausted)return;player.swingStats=w;player.stamina-=w.cost;track('staminaSpent',w.cost);track('swings');player.regenDelay=STAMINA.delay;player.swing=0;player.swingHit=false;player.swingYaw=player.yaw;}
function batImpact(){
 const w=player.swingStats,dx=Math.sin(player.swingYaw),dz=Math.cos(player.swingYaw);let hits=0;
 for(const target of [...zombies].sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))){
  const x=target.x-player.x,z=target.z-player.z,d=Math.hypot(x,z),type=TYPES[target.kind];
  if(d>w.reach+type.radius||(x*dx+z*dz)/Math.max(d,.001)<Math.cos(w.arc))continue;
  if(obstacles.some(o=>rayBox(player.x,player.z,x/Math.max(d,.001),z/Math.max(d,.001),o)<d))continue;
  track('hits');target.health-=w.damage;if(w.stagger&&(target.kind!=='wrecker'||w.heavy)){target.hurt=Math.max(type.stagger,target.kind==='wrecker'?(w.heavy?.18:.04):target.kind==='brute'?.08:w.heavy?.5:.3);target.hitDuration=target.hurt;target.attack=0;target.cooldown=.3;target.burst=target.windup=0;
  // Small increments keep knockback from tunneling through narrow obstacles.
  for(let i=0;i<4;i++)move(target,dx*(target.kind==='brute'?.025:w.heavy?.16:.10),dz*(target.kind==='brute'?.025:.10),type.radius);
  }if(target.health<=0)killEnemy(target);
  if(++hits>=w.maxHits)break;
 }
 sound(hits?'hit':'ready');
}function arenaEnemies(){return zombies.filter(z=>z.encounter==='arena').length;}
function createEnemy(kind,x,z,encounter){return {kind,shirtVariant:rollShirt(),x,z,encounter,yaw:Math.PI,health:TYPES[kind].hp,speed:TYPES[kind].speed,animation:Math.random(),hurt:0,attack:0,cooldown:0,struck:false,flank:1,burst:0,burstCooldown:1,windup:0,chargeX:0,chargeZ:0};}
function initializeEncounters(){
 dungeonLevel=-1;dungeonComplete=bossDefeated=entryPrompt=false;floors=[];savedOutdoor=null;$('towerPrompt').hidden=true;
 setCollisionScene(outdoorObstacles);renderer.setWorld(world);renderer.setScenery(scenery);
 refreshMap();
}
function updateWrecker(z,dt,distance){
 const homeDistance=0;
 if(homeDistance>19){z.attack=z.burst=z.windup=0;const dx=WRECKER_HOME.x-z.x,dz=WRECKER_HOME.z-z.z,l=Math.hypot(dx,dz);if(l>.3){move(z,dx/l*z.speed*dt,dz/l*z.speed*dt,TYPES.wrecker.radius);z.yaw=Math.atan2(dx,dz);z.animation+=dt;}return true;}
 if(z.burst>0){z.burst-=dt;z.yaw=Math.atan2(z.chargeX,z.chargeZ);const x=z.x,zz=z.z;move(z,z.chargeX*7.5*dt,z.chargeZ*7.5*dt,TYPES.wrecker.radius);z.animation+=dt*2;
  if(distance<1.4){damage(z);if(!developerInvulnerable)player.slow=1;z.burst=0;z.cooldown=1;}
  if(Math.hypot(z.x-x,z.z-zz)<.01){z.burst=0;z.cooldown=1;}
  return true;
 }
 if(z.windup>0){z.windup-=dt;if(z.windup<=0){z.burst=.8;z.burstCooldown=4;}return true;}
 if(z.attack===0&&z.burstCooldown===0&&distance>4&&distance<13){const dx=(player.x-z.x)/distance,dz=(player.z-z.z)/distance;if(!obstacles.some(o=>rayBox(z.x,z.z,dx,dz,o)<distance)){z.windup=.75;z.chargeX=dx;z.chargeZ=dz;return true;}}
 return false;
}
function storeFloor(){if(dungeonLevel>=0){floors[dungeonLevel].enemies=zombies;floors[dungeonLevel].bodies=corpses;}}
function loadFloor(level,returning=false){
 storeFloor();dungeonLevel=level;
 if(!floors[level]){const data=makePassage(level,mortuaryState);data.enemies=data.spawns.map(s=>createEnemy(s.kind,s.x,s.z,'dungeon'));data.bodies=[];floors[level]=data;}
 const floor=floors[level];setCollisionScene(floor.obstacles,floor.limit);renderer.setWorld(floor.parts);renderer.setScenery([]);zombies=floor.enemies;corpses=floor.bodies;tracers=[];
 const spawn=returning?floor.exit:floor.start;player.x=spawn.x;player.z=spawn.z+(returning?2:0);player.swing=-1;player.shot=0;player.reload=0;player.hurt=Math.max(player.hurt,.5);cameraX=player.x;cameraZ=player.z;clearInput();$('nextWave').hidden=true;refreshMap();announce(floor.name.toUpperCase());think(level===0?'Offices. Someone left in a hurry.':'Town should be on the far side.',true);
}
function exitTower(){
 storeFloor();dungeonComplete=true;dungeonLevel=-1;setCollisionScene(outdoorObstacles);renderer.setWorld(world);zombies=savedOutdoor.enemies;corpses=savedOutdoor.bodies;tracers=[];player.x=TOWER.x;player.z=TOWER.z+3;cameraX=player.x;cameraZ=player.z;clearInput();refreshMap();announce('TOWER ESCAPED · EIGHT FLOORS COMPLETE');
}
function nearbyLoot(){if(dungeonLevel>=0)return null;return loot.find(item=>Math.hypot(player.x-item.x,player.z-item.z)<1.7*limits().detect&&!obstacles.some(o=>{const dx=item.x-player.x,dz=item.z-player.z,d=Math.hypot(dx,dz);return d>.01&&rayBox(player.x,player.z,dx/d,dz/d,o)<d;}));}
function interaction(){if(dungeonLevel>=0)return mortuaryAction()?.label.toUpperCase()||'';if(Math.hypot(player.x-TOWER.x,player.z-TOWER.z)<3)return hasExitKey?'UNLOCK THE MORTUARY':'MORTUARY LOCKED · NEED A KEY';const item=nearbyLoot();return !item?'':item.id==='exit-key'?'TAKE MORTUARY KEY':item.id==='flashlight'?'TAKE FLASHLIGHT':item.id==='health'?(player.health>=limits().health?'HEALTH FULL':'USE HEALTH BOX · +14 HP'):'TAKE '+WEAPONS[item.id].name.toUpperCase();}
function interact(){if(!running||dead||paused||player.swing>=0||player.reload>0)return;if(dungeonLevel>=0){interactMortuary();return;}if(Math.hypot(player.x-TOWER.x,player.z-TOWER.z)<3){if(!hasExitKey){think('Locked. Of course it is.',true);return;}entryPrompt=true;paused=true;clearInput();$('towerPrompt').hidden=false;return;}const item=nearbyLoot();if(!item)return;if(item.id==='exit-key'){hasExitKey=true;loot=loot.filter(i=>i!==item);think('North. The mortuary door.',true);announce('MORTUARY KEY FOUND');return;}if(item.id==='flashlight'){player.flashlight=true;lightStamp=-1;loot=loot.filter(i=>i!==item);announce('FLASHLIGHT EQUIPPED · WIDER NIGHT VISIBILITY');return;}if(item.id==='health'){if(player.health>=limits().health)return;const restored=Math.min(HEALTH_BOX.heal,limits().health-player.health);player.health+=restored;loot=loot.filter(i=>i!==item);track('healthRecovered',restored);track('healthBoxes');persist();announce('HEALTH BOX · +'+restored+' HEALTH');sound('ready');return;}const w=WEAPONS[item.id];if(!inventory.includes(item.id))inventory.push(item.id);if(w.type==='gun')weaponAmmo[item.id]={loaded:Math.min(w.magazine,Math.ceil(w.magazine*.5)),reserve:Math.ceil(w.magazine*.5)};loot=loot.filter(i=>i!==item);track('items');persist();announce(w.name.toUpperCase()+' FOUND · Q TO SWITCH');}
function damage(attacker){if(developerInvulnerable||player.hurt>0||dead)return;const type=TYPES[attacker.kind];track('damageTaken',Math.min(player.health,type.damage));player.health=Math.max(0,player.health-type.damage);player.hurt=.55;think(['Ow. Still attached, I think.','Rude. Very rude.','That was my good everything.'][Math.floor(Math.random()*3)]);if(attacker.kind==='crawler')player.slow=1.4;if(attacker.kind==='brute'||attacker.kind==='wrecker'){const dx=player.x-attacker.x,dz=player.z-attacker.z,l=Math.hypot(dx,dz)||1;for(let i=0;i<8;i++)move(player,dx/l*.13,dz/l*.13);}sound('hit');if(player.health===0){persist();dead=true;running=false;deathTime=0;clearInput();$('nextWave').hidden=true;$('result').textContent=`${kills} kills · Wave ${wave} · ${Math.floor(elapsed/60)}m ${Math.floor(elapsed%60)}s survived`;$('crosshair').style.display='none';announce('OVERRUN');}}
function updateZombie(z,dt){
 z.moving=false;
 if(z.encounter==='dungeon'&&!z.awake){
  const dx=player.x-z.x,dz=player.z-z.z,d=Math.hypot(dx,dz);
  const sees=d<8&&!obstacles.some(o=>rayBox(z.x,z.z,dx/Math.max(d,.001),dz/Math.max(d,.001),o)<d);
  if(z.health<TYPES[z.kind].hp||sees||(player.shot>0&&d<12))z.awake=true;else return;
 }
 const type=TYPES[z.kind];z.hurt=Math.max(0,z.hurt-dt);z.cooldown=Math.max(0,z.cooldown-dt);z.burstCooldown=Math.max(0,z.burstCooldown-dt);
 const distance=Math.hypot(player.x-z.x,player.z-z.z);if(z.kind==='wrecker'&&updateWrecker(z,dt,distance))return;z.yaw=Math.atan2(player.x-z.x,player.z-z.z);
 if(z.kind==='crawler'){
  z.attack=0;
  if(distance<type.radius+.4&&z.cooldown<=0){damage(z);z.cooldown=.8;}
 }
 if(z.attack>0){const previous=z.attack;z.attack+=dt;z.yaw=z.attackYaw;const dx=Math.sin(z.yaw),dz=Math.cos(z.yaw);
  const burstTime=Math.max(0,Math.min(z.attack,type.windup+.5)-Math.max(previous,type.windup));
  if(burstTime>0){const travel=4.8*nightSpeed(elapsed)*burstTime;for(let i=0;i<4;i++)move(z,dx*travel/4,dz*travel/4,type.radius);}
  for(const offset of [.12,.72])if(previous<type.windup+offset&&z.attack>=type.windup+offset){
   const x=player.x-z.x,zz=player.z-z.z,d=Math.hypot(x,zz);
   if(d<type.reach+.25&&(x*dx+zz*dz)/Math.max(.001,d)>.5&&!obstacles.some(o=>rayBox(z.x,z.z,x/Math.max(d,.001),zz/Math.max(d,.001),o)<d))damage(z);
  }
  if(z.attack>type.windup+1){z.attack=0;z.cooldown=type.recovery+.2;}return;
 }
 if(z.kind!=='crawler'&&distance<type.reach+1.2&&z.cooldown<=0&&z.hurt<=0){z.attack=.001;z.attackYaw=z.yaw;z.burst=0;return;}
 if(z.hurt>0)return;
 if(z.windup>0){z.windup-=dt;if(z.windup<=0){z.burst=.65;z.burstCooldown=1.6;}return;}
 if(z.kind==='runner'&&distance>2.5&&distance<7&&z.burstCooldown===0){
  const dx=(player.x-z.x)/distance,dz=(player.z-z.z)/distance;
  if(!obstacles.some(o=>rayBox(z.x,z.z,dx,dz,o)<distance)){z.windup=.22;z.chargeX=dx;z.chargeZ=dz;return;}
 }
 let [dx,dz]=direction(z.x,z.z,player.x,player.z),l=Math.hypot(dx,dz);if(l<.05||distance<(z.kind==='crawler'?.35:type.reach*.8))return;dx/=l;dz/=l;
 // Runners approach from a side before their committed, dodgeable burst.
 if(z.kind==='runner'&&distance>4&&distance<11&&z.burst<=0){const x=dx;dx+=-dz*z.flank*.45;dz+=x*z.flank*.45;}
 if(z.burst>0){z.burst-=dt;dx=z.chargeX;dz=z.chargeZ;}
 else{let sx=0,sz=0;for(const other of zombies){if(other===z)continue;const ox=z.x-other.x,oz=z.z-other.z,d=Math.hypot(ox,oz),gap=type.radius+TYPES[other.kind].radius;if(d>0&&d<gap){sx+=ox/d*(gap-d);sz+=oz/d*(gap-d);}}dx+=sx*2;dz+=sz*2;}
 l=Math.hypot(dx,dz)||1;let speed=z.speed*nightSpeed(elapsed)*(z.burst>0?2.2:1);if(z.kind==='crawler')speed*=.72+.55*Math.max(0,Math.sin(z.animation*7));
 const oldX=z.x,oldZ=z.z;move(z,dx/l*speed*dt,dz/l*speed*dt,type.radius);const traveled=Math.hypot(z.x-oldX,z.z-oldZ);z.moving=traveled>.0001;z.animation+=traveled/(z.kind==='runner'?2.2:z.kind==='brute'?1.1:1.3);z.yaw=Math.atan2(dx,dz);
}
function update(dt){
 if(!running||paused||isPortrait()){if(dead){deathTime+=dt;if(deathTime>.9)$('deathMenu').hidden=false;}return;}
 player.regenDelay=Math.max(0,player.regenDelay-dt);if(player.exhausted&&player.stamina>=STAMINA.recoverThreshold)player.exhausted=false;
 elapsed+=dt;const previousNeeds=needLevels(needs);advanceNeeds(needs,dt);const currentNeeds=needLevels(needs);if(currentNeeds.hungry>previousNeeds.hungry||currentNeeds.tired>previousNeeds.tired)announce('HUNGRY '+currentNeeds.hungry+' · TIRED '+currentNeeds.tired);track('seconds',dt);saveClock+=dt;if(saveClock>=5){persist();saveClock=0;}announcementTime-=dt;$('announcement').style.opacity=announcementTime>0?1:0;
 player.shot=Math.max(0,player.shot-dt);player.hurt=Math.max(0,player.hurt-dt);if(player.reload>0){player.reload-=dt;if(player.reload<=0){player.reload=0;const ammo=weaponAmmo[player.weapon],take=Math.min(equipped().magazine-player.ammo,ammo.reserve);player.ammo+=take;ammo.reserve-=take;ammo.loaded=player.ammo;}}
 let mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+sticks.move.x;
 let mz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+sticks.move.y;
 const mag=Math.hypot(mx,mz);if(mag>1){mx/=mag;mz/=mag;}if(mag<=.08){mx=mz=0;}
 const touchAim=Math.hypot(sticks.aim.x,sticks.aim.y)>.2;
 if(player.swing>=0)player.yaw=player.swingYaw;
 else if(touchAim)player.yaw=Math.atan2(sticks.aim.x,sticks.aim.y);
 else if(mouse.seen){const [x,z]=renderer.screenGround(mouse.x,mouse.y,1.12);player.yaw=Math.atan2(x-player.x,z-player.z);}
 else if(mag>.08)player.yaw=Math.atan2(mx,mz);
 // Resolve facing first so backward speed is correct on the very first step.
 const inputLength=Math.hypot(mx,mz),forward=inputLength>0?(mx*Math.sin(player.yaw)+mz*Math.cos(player.yaw))/inputLength:1;
 const backward=forward<-.15,sprint=(keys.has('ShiftLeft')||keys.has('ShiftRight')||mobileSprint)&&!backward&&inputLength>.08&&player.stamina>0&&!player.exhausted&&player.swing<0&&!(player.charge>=0);
 const directionalSpeed=forward<0?.9+.3*forward:.9+.1*forward;
 const speed=(sprint?config.runSpeed*limits().sprint:config.speed)*directionalSpeed*(sprint?.92:backward?.96:forward>.15?.92:1)*(player.slow>0?.62:1)*needPenalties(needs).movement*(player.charge>=0?.7:1);
 player.slow=Math.max(0,player.slow-dt);
 const ox=player.x,oz=player.z;move(player,mx*speed*dt,mz*speed*dt);
 player.vx=(player.x-ox)/Math.max(dt,.001);player.vz=(player.z-oz)/Math.max(dt,.001);
 const traveled=Math.hypot(player.x-ox,player.z-oz);player.moving=traveled>.0001;
 if(player.moving){track('metres',traveled);if(sprint)track('sprintMetres',traveled);player.moveYaw=Math.atan2(player.vx,player.vz)-player.yaw;player.animation+=traveled/1.35;}
 else player.idleAnimation=(player.idleAnimation||0)+dt;
 if(sprint&&player.moving){track('staminaSpent',Math.min(player.stamina,STAMINA.sprintDrain*dt));player.stamina=Math.max(0,player.stamina-STAMINA.sprintDrain*dt);player.regenDelay=STAMINA.delay;if(player.stamina===0)player.exhausted=true;}
 else if(player.regenDelay===0&&player.swing<0)player.stamina=Math.min(limits().stamina,player.stamina+STAMINA.regen*needPenalties(needs).staminaRegen*dt);
 if(player.swing>=0){player.swing+=dt;if(player.swing>=player.swingStats.impact&&!player.swingHit){player.swingHit=true;batImpact();}if(player.swing>=player.swingStats.duration)player.swing=-1;}
 if(player.charge>=0)player.charge=Math.min(.65,player.charge+dt);else if(mouse.down||touchAim)fire();
 if(dungeonLevel<0&&!arenaTriggered&&inArena(player.x,player.z)){arenaTriggered=true;startWave();}
 rebuildField(player.x,player.z);
 for(const z of zombies){updateZombie(z,dt);if(dead)break;}
 if(dead)return;
 if(dungeonLevel<0&&pending&&zombies.length<config.maxAlive){spawnTimer-=dt;if(spawnTimer<=0){if(spawn())pending--;spawnTimer=Math.max(.45,1.3-wave*.07);}}
 if(dungeonLevel<0&&wave>0&&wave<WAVES.length&&!pending&&!arenaEnemies()){
  if(between===0){between=12;player.stamina=limits().stamina;announce('Still here. ✓  Take a breath.');$('nextWave').textContent=`START WAVE ${String(wave+1).padStart(2,'0')} →`;if(wave===3&&!companionSeen){meetCompanion();return;}if(wave===4&&hudStage<3){hudStage=3;applyHud();think('He’s keeping count. Someone should.',true);}}
  const inside=inArena(player.x,player.z);$('nextWave').hidden=!inside;
  if($('endless').checked&&inside){between=Math.max(.001,between-dt);if(between<=.001)startWave();}
 }
 if(dungeonLevel<0&&wave===WAVES.length&&!pending&&!arenaEnemies()&&!bossSpawned)spawnUndertaker();
 if(dungeonLevel<0&&!wallThought&&Math.max(Math.abs(player.x),Math.abs(player.z))>73){wallThought=true;think('Those walls are too tall. Need another way out.',true);}
 for(const c of corpses)c.age+=dt;
 for(const t of tracers)t.life-=dt;tracers=tracers.filter(t=>t.life>0);
 cameraX+=(player.x-cameraX)*Math.min(1,dt*5);cameraZ+=(player.z-cameraZ)*Math.min(1,dt*5);
}
function draw(){renderer.resize(quality);renderer.begin(cameraX,cameraZ);renderer.setFlashlight(player.x,player.z,dungeonLevel>=0?(floors[dungeonLevel].walls||obstacles):[],dungeonLevel>=0&&dungeonLevel<8);
 const drawActor=(a,kind,state,t,moving)=>{if(Math.abs(a.x-cameraX)>28||Math.abs(a.z-cameraZ)>23)return;renderer.append(shadow,a.x,0,a.z);const clock=kind==='human'&&!moving?(a.idleAnimation||0):a.animation;if(kind==='human'&&state==='swing')t=t/a.swingStats.duration*BAT.duration;renderer.appendActor(characterMesh(kind,state,t,moving,a.moveYaw||0,clock,a.weapon||'pistol',a.shirtVariant||0,a.swingStats?.heavy&&state==='swing'?'heavy':'quick',a.swingStats?.power||1),a.x,0,a.z,a.yaw,a.shirtVariant||0);};
 renderer.corpses.sync(corpses);
 for(const c of corpses){if(Math.abs(c.x-cameraX)>28||Math.abs(c.z-cameraZ)>23)continue;if(c.age>=DEATH_SETTLE_TIME&&renderer.corpses.add(c,()=>characterMesh(c.kind,'dead',DEATH_SETTLE_TIME,false,0,0,'bat')))continue;drawActor(c,c.kind,'dead',c.age,false);}
 for(const z of zombies){const type=TYPES[z.kind],attackPhase=z.attack<=type.windup?.2*z.attack/type.windup:.2+.8*(z.attack-type.windup);drawActor(z,z.kind,z.attack>0?'attack':z.hurt>0?'hit':z.windup>0?'windup':'walk',z.attack>0?attackPhase:z.hurt>0?Math.max(0,1-z.hurt/(z.hitDuration||type.stagger))*.6:z.animation,!!z.moving);}
 drawActor(player,'human',dead?'dead':player.charge>=0?'charge':player.swing>=0?'swing':player.hurt>0?'hit':player.reload>0?'reload':player.shot>0?'shoot':'idle',dead?deathTime:player.charge>=0?player.charge:player.swing>=0?player.swing:player.hurt>0?.55-player.hurt:player.reload>0?equipped().reload*limits().reload-player.reload:player.shot>0?equipped().interval-player.shot:player.animation,player.moving); if(started&&!dead&&equipped().type==='gun'){const dx=Math.sin(player.yaw),dz=Math.cos(player.yaw);for(let i=1;i<5;i++)renderer.append(sight,player.x+dx*i*.8,0,player.z+dz*i*.8,player.yaw);}
 for(const t of tracers){
  // A short moving streak replaces the full-length laser beam. The flash starts at the barrel.
  const age=.085-t.life,head=Math.min(t.length,age*240),tail=Math.max(0,head-1.4),len=head-tail;
  if(len>.01){const middle=(head+tail)/2,y=t.y+(t.endY-t.y)*middle/Math.max(.01,t.length);renderer.append(bake([block(0,y,middle,.018,.018,len,'#d2b87c')]),t.x,0,t.z,Math.atan2(t.dx,t.dz));}
  if(age<.04)renderer.append(bake([block(0,t.y,.06,.075,.065,.16,'#f4d69a')]),t.x,0,t.z,Math.atan2(t.dx,t.dz));
  if(t.length>0&&head>=t.length&&t.life>.015)renderer.append(bake([block(0,t.endY,0,.09,.09,.09,'#b08c63')]),t.x+t.dx*t.length,0,t.z+t.dz*t.length);
 } for(const item of dungeonLevel<0?loot:[]){if(Math.hypot(item.x-player.x,item.z-player.z)<7*limits().detect){renderer.pickupGlow.add(item.x,item.z,item.id==='health',elapsed);renderer.append(item.id==='exit-key'?keyPickup:item.id==='flashlight'?flashlightPickup:item.id==='health'?healthPickup:item.id==='knife'?knifePickup:cachePickup,item.x,0,item.z);}}renderer.draw();
 const w=equipped(),m=w.type==='melee'?meleeStats(player.weapon,skillRank(progress,'melee')):null;
 $('healthText').textContent=player.health;$('healthBar').style.width=100*player.health/limits().health+'%';$('wave').textContent=String(wave).padStart(2,'0')+' / '+WAVES.length;$('kills').textContent=kills;$('damage').style.opacity=player.hurt*.9;
 $('staminaText').textContent=Math.ceil(player.stamina);$('staminaBar').style.width=100*player.stamina/limits().stamina+'%';$('weaponName').textContent=w.name.toUpperCase();
 $('ammo').textContent=m?'MELEE':player.ammo+' / '+(weaponAmmo[player.weapon]?.reserve||0);
 $('reloadStatus').textContent=m?(player.charge>=0?'CHARGING '+Math.round(player.charge/.65*100)+'%':player.swing>=0?(player.swingStats.heavy?'HEAVY STRIKE':'QUICK SWING'):player.stamina<m.cost?'LOW STAMINA':m.cost+' STAMINA / ATTACK'):player.reload>0?'RELOADING':player.ammo===0?'RELOAD [R]':'READY';
 $('touchWeapon').textContent='SWITCH';$('touchReload').hidden=!!m;$('touchSprint').textContent=player.exhausted?'EXHAUSTED':mobileSprint?'RUN: ON':'RUN';
 updateDaylight();$('objective').textContent=districtName(player.x,player.z)+' · '+(won?'SIX WAVES SURVIVED':between>0?'REGROUP · NEXT BELL SOON':'SURVIVE THE SIX BELLS');
 drawMap();
 const thought=$('playerThought');thought.hidden=!running||dead||elapsed>=thoughtUntil||companionActive;
 if(!thought.hidden){thought.style.left=(50+(player.x-cameraX)/(2*renderer.half*innerWidth/innerHeight)*100)+'%';thought.style.top=(50+(player.z-cameraZ-2.5)/(2*renderer.half*Math.SQRT2)*100)+'%';}
 const prompt=running&&!paused?interaction():'';$('interact').hidden=!prompt;$('interact').textContent=prompt+' [E]';
 const boss=dungeonLevel<0?zombies.find(z=>z.kind==='wrecker'):null;$('bossHud').hidden=!boss||Math.hypot(boss.x-player.x,boss.z-player.z)>20||!started;
 if(boss){$('bossHealth').max=TYPES.wrecker.hp;$('bossHealth').value=boss.health;}
 if(dungeonLevel>=0){$('objective').textContent=(dungeonLevel===0?'MORTUARY · FIND A WAY UPSTAIRS':'MORTUARY · CROSS TO THE TOWN SIDE');$('wave').textContent=(dungeonLevel+1)+' / 2';}else if(bossSpawned)$('objective').textContent=hasExitKey?'THE NORTHERN MORTUARY · UNLOCK THE DOOR':bossDefeated?'FIND THE UNDERTAKER’S KEY':'THE UNDERTAKER';
 $('status').textContent=paused?'PAUSED':dead?'SIGNAL LOST':pending||zombies.length?`${zombies.length} ACTIVE · ${pending} INCOMING`:between>0&&$('endless').checked?(inArena(player.x,player.z)?`NEXT WAVE IN ${Math.ceil(between)}s`:'WAVES WAIT AT DEAD LOT'):'PERIMETER QUIET';
 if(dungeonLevel>=0)$('status').textContent=paused?'PAUSED':dead?'SIGNAL LOST':`${zombies.length} FLOOR HOSTILES · NO RESPAWNS`;
 else if(!paused&&!dead&&!pending&&!arenaEnemies())$('status').textContent=between>0?(inArena(player.x,player.z)?`NEXT WAVE ${$('endless').checked?'IN '+Math.ceil(between)+'s':'READY'}`:'RETURN TO DEAD LOT FOR WAVES'):bossDefeated?'FIND THE NORTHERN EXIT':dungeonComplete?'TOWER COMPLETE':'AWAITING THE FIRST BELL';
}
const mapCanvas=$('map'),mapContext=mapCanvas.getContext('2d'),mapBase=document.createElement('canvas');mapBase.width=mapBase.height=180;
const mapInk=mapBase.getContext('2d');let mapLimit=bounds;
const mapPoint=(x,z)=>[(x+mapLimit)*180/(mapLimit*2),(z+mapLimit)*180/(mapLimit*2)];
function refreshMap(){mapLimit=dungeonLevel>=0?33:bounds;const scale=180/(mapLimit*2);mapInk.fillStyle='#20271f';mapInk.fillRect(0,0,180,180);mapInk.fillStyle='#656b59';for(const o of obstacles){const [x,y]=mapPoint(o.x-o.w,o.z-o.d);mapInk.fillRect(x,y,o.w*2*scale,o.d*2*scale);}mapInk.font='9px monospace';mapInk.textAlign='center';
 if(dungeonLevel<0){for(const [x,z,label,color] of [[0,8,'MEMORIAL','#c3a35e'],[0,-70,'EXIT','#c5d5aa'],[0,63,'GATE','#ca8264']]){const [px,py]=mapPoint(x,z);mapInk.fillStyle=color;mapInk.fillText(label,px,py);}}
 else{const p=MORTUARY_PLANS[dungeonLevel].exit,[x,y]=mapPoint(p.x,p.z);mapInk.fillStyle='#d4c184';mapInk.fillText(dungeonLevel===0?'STAIRS':'WINDOW',x,y);}
}
function drawMap(){if(!mapContext)return;if(dungeonLevel>=0&&dungeonLevel<8){mapContext.fillStyle='#000';mapContext.fillRect(0,0,180,180);mapContext.fillStyle='#656b59';for(const o of obstacles){if(!renderer.illuminated(o.x,o.z))continue;const [px,py]=mapPoint(o.x-o.w,o.z-o.d);mapContext.fillRect(px,py,o.w*180/mapLimit,o.d*180/mapLimit);}}else mapContext.drawImage(mapBase,0,0);mapContext.fillStyle='#c16850';for(const z of zombies){if(!renderer.illuminated(z.x,z.z))continue;const [x,y]=mapPoint(z.x,z.z);mapContext.fillRect(x-1,y-1,2,2);}const [x,y]=mapPoint(player.x,player.z);mapContext.save();mapContext.translate(x,y);mapContext.rotate(-player.yaw);mapContext.fillStyle='#e3ecc0';mapContext.beginPath();mapContext.moveTo(0,5);mapContext.lineTo(-3,-3);mapContext.lineTo(3,-3);mapContext.closePath();mapContext.fill();mapContext.restore();}
$('playAgain').onclick=begin;
refreshMap();function frame(t){const frameSeconds=(t-previous)/1000||0,dt=Math.min(frameSeconds,.04);previous=t;update(dt);draw();fpsFrames++;fpsClock+=frameSeconds;if(fpsClock>.6){$('perf').textContent=`${Math.round(fpsFrames/fpsClock)} FPS · ${zombies.length}/${config.maxAlive} HOSTILES`;fpsFrames=fpsClock=0;}requestAnimationFrame(frame);}

$('start').onclick=()=>{$('menu').hidden=true;showIntro(begin);};$('nextWave').onclick=startWave;$('pause').onclick=()=>setPaused(true);$('resume').onclick=()=>setPaused(false);$('restart').onclick=begin;$('restartPaused').onclick=begin;$('touchReload').onclick=reload;
$('touchWeapon').onclick=switchWeapon;
$('interact').onclick=interact;
$('enterTower').onclick=()=>{if(!entryPrompt)return;entryPrompt=false;paused=false;$('towerPrompt').hidden=true;savedOutdoor={enemies:zombies,bodies:corpses};loadFloor(0);};
$('cancelTower').onclick=()=>{entryPrompt=false;paused=false;$('towerPrompt').hidden=true;clearInput();};
$('touchSprint').onclick=()=>{if(running&&!paused&&!dead)mobileSprint=!mobileSprint;};
$('settings').onclick=()=>{$('deathMenu').hidden=true;$('menu').hidden=false;started=false;dead=false;};
$('quality').onchange=()=>quality=+$('quality').value;
window.addEventListener('keydown',e=>{if(jumpPrompt){if(e.code==='Escape')$('cancelJump').click();return;}if(companionActive){if(e.code==='Escape'){e.preventDefault();$('companionSkip').click();}return;}if(['INPUT','SELECT'].includes(e.target.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Escape'){if(!$('journal').hidden){closeJournal();return;}setPaused(!paused);return;}if(e.code==='KeyP'&&!e.repeat){openJournal();return;}if(e.code==='Space'&&!e.repeat)startCharge();if(e.code==='KeyE'&&!e.repeat)interact();if(e.code==='KeyQ'&&!e.repeat)switchWeapon();if(e.code==='KeyR'&&!e.repeat)reload();keys.add(e.code);});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Space')releaseCharge();});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;mouse.x=e.clientX;mouse.y=e.clientY;mouse.seen=true;$('crosshair').style.left=`${e.clientX}px`;$('crosshair').style.top=`${e.clientY}px`;$('crosshair').style.display=running&&!paused?'block':'none';});
canvas.addEventListener('pointerdown',e=>{if(e.button===2){mouse.seen=true;mouse.x=e.clientX;mouse.y=e.clientY;startCharge();canvas.setPointerCapture(e.pointerId);return;}if(e.pointerType!=='touch'&&e.button===0){mouse.down=true;mouse.seen=true;mouse.x=e.clientX;mouse.y=e.clientY;canvas.setPointerCapture(e.pointerId);}});
window.addEventListener('pointerup',e=>{if(e.button===2)releaseCharge();else mouse.down=false;});canvas.addEventListener('pointercancel',()=>{mouse.down=false;player.charge=-1;});canvas.addEventListener('contextmenu',e=>e.preventDefault());
for(const [id,name] of [['moveStick','move'],['aimStick','aim']]){const el=$(id),s=sticks[name],updateStick=e=>{const r=el.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),scale=Math.max(38,len);s.x=len<7?0:dx/scale;s.y=len<7?0:dy/scale;el.querySelector('i').style.transform=`translate(${s.x*35}px,${s.y*35}px)`;};el.addEventListener('pointerdown',e=>{if(s.id!==null||!running||paused)return;e.preventDefault();s.id=e.pointerId;mouse.seen=false;el.setPointerCapture(e.pointerId);updateStick(e);});el.addEventListener('pointermove',e=>{if(e.pointerId===s.id)updateStick(e);});const release=e=>{if(e.pointerId===s.id){s.id=null;s.x=s.y=0;el.querySelector('i').style.transform='';}};for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,release);}
window.addEventListener('pagehide',persist);
window.addEventListener('blur',()=>{clearInput();setPaused(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();setPaused(true);}});window.addEventListener('resize',()=>{clearInput();if(isPortrait())setPaused(true);});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setPaused(true);$('error').hidden=false;$('errorText').textContent='The graphics context was interrupted. Reload this page to restart the prototype.';});
requestAnimationFrame(frame);











let journalWasPaused=false;
function openJournal(){if(companionActive||jumpPrompt)return;if(!$('journal').hidden){closeJournal();return;}journalWasPaused=paused;if(running)setPaused(true);$('pauseMenu').hidden=true;clearInput();persist();$('journal').hidden=false;
 $('saveNote').textContent=saveOK?'Lifetime stats saved · ranks and equipment reset each run':'Browser storage unavailable · progress lasts only while this page stays open';
 $('skillList').innerHTML=Object.entries(SKILLS).map(([id,skill])=>{const q=(progress.developer?{rank:10,current:0,needed:0}:rankProgress(progress.runStats[skill.stat],skill.base));return '<article><strong>'+skill.name+' <span>RANK '+q.rank+' / 10</span></strong><progress max="'+(q.needed||1)+'" value="'+(q.needed?Math.min(q.current,q.needed):1)+'"></progress><small>'+(q.needed?Math.floor(q.current)+' / '+q.needed+' '+skill.unit+' to next rank':'MASTERED')+'</small><p>'+skill.benefit+'</p></article>';}).join('');
 $('lifetimeStats').textContent=progress.stats.runs+' runs · '+progress.stats.kills+' kills · '+progress.stats.wins+' escapes · best wave '+progress.stats.bestWave+' · '+Math.floor(progress.stats.metres)+' m travelled · '+Math.floor(progress.stats.seconds/60)+' min survived · '+progress.stats.hits+' hits · '+progress.stats.damageTaken+' damage taken · '+progress.stats.items+' weapons found · '+progress.stats.healthBoxes+' health boxes used · '+progress.stats.healthRecovered+' health restored';
 $('inventoryList').textContent='Carried: '+inventory.map(id=>WEAPONS[id].name).join(' · ');
 $('weaponList').innerHTML=Object.values(WEAPONS).map(w=>'<li><b>'+w.name+'</b> — '+(w.type==='melee'?w.damage+' damage · '+w.reach+' m reach · '+w.cost+' stamina':w.damage+' damage'+(w.pellets>1?' × '+w.pellets+' pellets':'')+' · '+w.magazine+' rounds')+'</li>').join('');
}
function closeJournal(){$('journal').hidden=true;if(running)setPaused(journalWasPaused);}
$('openJournal').onclick=openJournal;$('pauseJournal').onclick=openJournal;$('closeJournal').onclick=closeJournal;

// One CSS radial shade, updated at 10 Hz: no lights, shadows or extra WebGL passes.
let lightStamp=-1;
function updateDaylight(){const stamp=Math.floor(elapsed*10);if(stamp===lightStamp)return;lightStamp=stamp;
 const seconds=elapsed%720;
 const dusk=seconds>=300&&seconds<360,dawn=seconds>=660;
 const t=dusk?(seconds-300)/60:dawn?(seconds-660)/60:0,smooth=t*t*(3-2*t);
 const night=dusk?smooth:dawn?1-smooth:seconds>=360?1:0;
 const amber=(dusk||dawn)?Math.sin(t*Math.PI)*.22:0,label=dusk?'DUSK':dawn?'DAWN':seconds>=360?'NIGHT':'DAY';
 const h=innerHeight,half=renderer.half,aspect=innerWidth/h;
 const x=50+(player.x-cameraX)/ (2*half*aspect)*100,y=50+(player.z-cameraZ)/(2*half*Math.SQRT2)*100;
 const radius=(player.flashlight?7.2:6)*h/(2*half),center=player.flashlight?.10:.40;
 $('daylight').style.background='linear-gradient(rgba(196,132,42,'+amber+'),rgba(196,132,42,'+amber+')),radial-gradient(circle at '+x+'% '+y+'%, rgba(5,10,18,'+(night*center)+') 0px, rgba(5,10,18,'+(night*center)+') '+radius*.25+'px, rgba(5,10,18,'+(night*.995)+') '+radius+'px)';
 const levels=needLevels(needs),penalties=needPenalties(needs);$('needsStatus').textContent=[levels.hungry?'HUNGRY '+levels.hungry:'',levels.tired?'TIRED '+levels.tired:''].filter(Boolean).join(' · ');$('needsStatus').title='Movement −'+Math.round((1-penalties.movement)*100)+'%; stamina recovery −'+Math.round((1-penalties.staminaRegen)*100)+'%. Food and rest become available in chapter 2.';
 $('cycleStatus').textContent=label+' · '+(player.flashlight?'FLASHLIGHT':'NO FLASHLIGHT');
}
function toggleDeveloper(){progress.developer=!progress.developer;player.health=Math.min(player.health,limits().health);player.stamina=Math.min(player.stamina,limits().stamina);const label='DEVELOPER MODE: '+(progress.developer?'ON · MAX RANKS':'OFF');$('developerMode').textContent=label;$('pauseDeveloper').textContent=label;announce(progress.developer?'DEVELOPER MODE · ALL RANKS MAXED':'DEVELOPER MODE OFF');}
$('developerMode').onclick=toggleDeveloper;$('pauseDeveloper').onclick=toggleDeveloper;


function cycleHud(){hudMode=hudMode==='story'?'on':hudMode==='on'?'off':'story';applyHud();}
$('hudToggle').onclick=cycleHud;$('pauseHudToggle').onclick=cycleHud;applyHud();

$('touchHeavy').addEventListener('pointerdown',e=>{e.preventDefault();startCharge();$('touchHeavy').setPointerCapture(e.pointerId);});$('touchHeavy').addEventListener('pointerup',releaseCharge);$('touchHeavy').addEventListener('pointercancel',()=>player.charge=-1);

function think(text,force=false){if(!force&&elapsed<thoughtCooldown)return;$('playerThought').textContent=text;thoughtUntil=elapsed+4.5;thoughtCooldown=elapsed+14;}
function spawnUndertaker(){
 for(let r=14;r<=24;r+=2)for(let i=0;i<16;i++){
  const a=i*Math.PI/8,x=player.x+Math.sin(a)*r,z=player.z+Math.cos(a)*r;
  if(blocked(x,z,.8)||Math.abs(x)>74||Math.abs(z)>74)continue;
  const boss=createEnemy('wrecker',x,z,'boss');boss.shirtVariant=0;zombies.push(boss);bossSpawned=true;between=0;$('nextWave').hidden=true;announce('THE UNDERTAKER');think('I think he wants his grave back.',true);return;
 }
}
function finishChapter(){if(won)return;dungeonComplete=true;won=true;running=false;track('wins');persist();clearInput();$('victoryMenu').hidden=false;$('victoryResult').textContent='The cemetery is behind you. Chapter 2 is not available yet.';}

function mortuaryAction(){
 if(dungeonLevel<0)return null;
 return MORTUARY_PLANS[dungeonLevel].actions.find(a=>{
  if(['key','shelf','stairsDoor','recordsShortcut','lobbyShortcut'].includes(a.id)&&mortuaryState[a.id])return false;
  // Shortcuts can only be unlatched from their designated room side.
  if(a.id==='recordsShortcut'&&player.x> -3.3||a.id==='lobbyShortcut'&&player.x<3.3)return false;
  return Math.hypot(a.x-player.x,a.z-player.z)<2;
 });
}
function rebuildMortuary(){
 const floor=floors[dungeonLevel],data=makePassage(dungeonLevel,mortuaryState);
 Object.assign(floor,{parts:data.parts,obstacles:data.obstacles,walls:data.walls});
 setCollisionScene(floor.obstacles,floor.limit);renderer.setWorld(floor.parts);refreshMap();
}
function interactMortuary(){
 const a=mortuaryAction();if(!a)return;
 if(a.id==='note'){think('“Stair key: director’s desk. Records shelf sticks. Push along the rails.”',true);return;}
 if(a.id==='shelf'){mortuaryState.shelf=true;rebuildMortuary();think('Not a wall. Just very committed furniture.',true);return;}
 if(a.id==='key'){mortuaryState.key=true;rebuildMortuary();think('STAIRS. Someone labels things. Lovely.',true);return;}
 if(a.id==='stairsDoor'&&!mortuaryState.key){think('Locked. The director kept the stair key.',true);return;}
 if(['stairsDoor','recordsShortcut','lobbyShortcut'].includes(a.id)){mortuaryState[a.id]=true;rebuildMortuary();think(a.id==='stairsDoor'?'Up we go.':'A shorter way back.',true);return;}
 if(a.id==='up'){loadFloor(1);return;}
 if(a.id==='down'){loadFloor(0,true);return;}
 if(a.id==='window'){jumpPrompt=true;paused=true;clearInput();$('jumpPrompt').hidden=false;}
}
$('cancelJump').onclick=()=>{jumpPrompt=false;paused=false;$('jumpPrompt').hidden=true;clearInput();};
$('confirmJump').onclick=()=>{if(!jumpPrompt)return;jumpPrompt=false;paused=false;$('jumpPrompt').hidden=true;finishChapter();};

function placeStarterPistol(){
 // Choose a clear patch close to the actual starting grave, after outdoor collision resets.
 for(const radius of [2,2.8,3.6])for(let i=0;i<16;i++){
  const a=i*Math.PI/8,dx=Math.sin(a),dz=Math.cos(a),x=START.x+dx*radius,z=START.z+dz*radius;
  if(blocked(x,z,.3)||obstacles.some(o=>rayBox(START.x,START.z,dx,dz,o)<radius))continue;
  loot.push({id:'pistol',x,z});return;
 }
 // The player spawn itself is reachable if surrounding grave decorations leave no clear patch.
 loot.push({id:'pistol',x:START.x,z:START.z});
}
function toggleInvulnerability(){
 developerInvulnerable=!developerInvulnerable;
 for(const id of ['developerInvulnerability','pauseInvulnerability']){
  $(id).textContent='DEV INVULNERABILITY: '+(developerInvulnerable?'ON':'OFF');
  $(id).setAttribute('aria-pressed',String(developerInvulnerable));
 }
 if(developerInvulnerable)player.slow=0;
}
$('developerInvulnerability').onclick=toggleInvulnerability;
$('pauseInvulnerability').onclick=toggleInvulnerability;
