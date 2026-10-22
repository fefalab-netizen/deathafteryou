// Shared geometry for the playable mortuary and its review blueprints. North = -Z.
const wall=(x,z,w,d)=>({x,z,w,d});
function vertical(x,from,to,doors=[]){const a=[];let p=from;for(const z of doors.sort((a,b)=>a-b)){a.push(wall(x,(p+z-1.6)/2,.3,z-1.6-p));p=z+1.6;}a.push(wall(x,(p+to)/2,.3,to-p));return a.filter(v=>v.d>0);}
function horizontal(z,from,to,doors=[]){return vertical(z,from,to,doors).map(v=>wall(v.z,v.x,v.d,v.w));}
const perimeter=[wall(-18,0,.4,48),wall(18,0,.4,48),wall(0,-24,36,.4),wall(0,24,36,.4)];
export const MORTUARY_PLANS=[
 {name:'Ground floor · the missing key',start:{x:0,z:21},stairs:{x:12,z:18},exit:{x:12,z:18},
 rooms:[['Administration',-10,16],['Records',-10,2],['Director',-10,-18],['Preparation',10,1],['Cold storage',10,-17],['Stairwell',11,16],['Reception',0,21]],
 walls:[...perimeter,...vertical(-3,-24,24,[-16,0,14]),...vertical(3,-24,24,[-16,0,14]),...horizontal(8,-18,-3,[-10]),...horizontal(-8,-18,-3,[-10]),...horizontal(8,3,18,[10]),...horizontal(-8,3,18,[10])],
 furniture:[wall(-14,19,3,2),wall(-14,-18,3,2),wall(14,0,2,5),wall(13,-17,3,5)],
 barriers:[{id:'collapse',...wall(0,8,6,2),color:'#625d50'},{id:'shelf',...wall(-10,-8,3.2,.9),color:'#826e50'},{id:'recordsShortcut',...wall(-3,0,.35,3.2),color:'#8c7151'},{id:'stairsDoor',...wall(10,8,3.2,.35),color:'#8b644a'},{id:'lobbyShortcut',...wall(3,14,.35,3.2),color:'#8c7151'}],
 actions:[{id:'note',x:-12,z:17,label:'Read caretaker’s note'},{id:'shelf',x:-10,z:-6,label:'Slide the records shelf'},{id:'key',x:-12,z:-17,label:'Take stairwell key'},{id:'recordsShortcut',x:-4.6,z:0,label:'Unlatch records door'},{id:'stairsDoor',x:10,z:6,label:'Unlock stairwell'},{id:'lobbyShortcut',x:4.6,z:14,label:'Unlatch reception shortcut'},{id:'up',x:12,z:18,label:'Go upstairs'}],
 spawns:[{kind:'normal',x:-14,z:11},{kind:'crawler',x:-7,z:1},{kind:'normal',x:-7,z:-18},{kind:'normal',x:13,z:-4}],
 path:[[0,21],[0,14],[-10,14],[-12,17],[-10,14],[-10,0],[-10,-8],[-10,-16],[-12,-17],[-10,-16],[0,-16],[0,0],[10,0],[10,8],[12,18]],
 shortcut:[[-10,0],[0,0]],
 steps:['1. Enter reception; the direct corridor has collapsed.','2. Follow the caretaker’s note through administration into records.','3. Slide the shelf on its floor rails to reach the director’s office.','4. Take the stairwell key. Open the records shortcut from inside.','5. Cross the corridor into preparation; unlock the stairwell.','6. Unlatch the reception shortcut and climb to floor 2.']},
 {name:'Second floor · across to town',start:{x:12,z:18},stairs:{x:12,z:18},exit:{x:12,z:-22},
 rooms:[['Staff office',10,16],['Break room',10,1],['Accounts',-10,1],['Archive office',-10,-17],['Town-facing office',10,-17],['Staff storage',-10,16]],
 walls:[...perimeter,...vertical(-3,-24,24,[-16,0,14]),...vertical(3,-24,24,[-16,0]),...horizontal(8,-18,-3,[-10]),...horizontal(-8,-18,-3,[-10]),...horizontal(8,3,18,[10]),...horizontal(-8,3,18)],
 furniture:[wall(14,13,2,3),wall(14,0,2,4),wall(-14,-1,3,2),wall(-14,-18,3,2),wall(7,-19,3,2)],
 barriers:[{id:'collapse',...wall(0,-8,6,3),color:'#625d50'}],
 actions:[{id:'down',x:12,z:18,label:'Go downstairs'},{id:'window',x:12,z:-22,label:'Look through broken window'}],
 spawns:[{kind:'normal',x:7,z:12},{kind:'crawler',x:13,z:2},{kind:'runner',x:-9,z:-3},{kind:'normal',x:-7,z:-18}],
 path:[[12,18],[10,10],[10,0],[0,0],[-10,0],[-10,-16],[0,-16],[12,-16],[12,-22]],
 shortcut:[],steps:['1. Arrive at the same stairwell position as downstairs.','2. Cross staff offices and the break room.','3. The north corridor has collapsed: detour through accounts.','4. Cross the archive office into the town-facing office.','5. Inspect the broken window and the low annex roof below.','6. Confirm the climb and drop toward town. Chapter 2 boundary.']}
];
