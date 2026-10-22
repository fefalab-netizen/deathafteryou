// Tuning is centralized so each playtest can change the roster without touching rendering.
export const TYPES={
 wrecker:{name:'The Undertaker',wave:Infinity,hp:90,speed:2.85,radius:.48,damage:28,reach:2.1,windup:.8,recovery:1.2,stagger:.04,skin:'#a89479',shirt:'#303831',pants:'#3d4240',scale:[1.85,1.65,1.7]},
 normal:{name:'Shambler',wave:1,hp:4,speed:2.22,radius:.38,damage:14,reach:1.05,windup:.38,recovery:.38,stagger:.12,skin:'#a4aa8a',shirt:'#c4b695',pants:'#635641',scale:[1,1,1]},
 runner:{name:'Runner',wave:6,hp:4,speed:3.36,radius:.34,damage:12,reach:1.0,windup:.15,recovery:.3,stagger:.13,skin:'#a8a18a',shirt:'#7b3934',pants:'#444648',scale:[.88,.98,.9]},
 worker:{name:'Worker',wave:3,hp:8,speed:2.04,radius:.43,damage:20,reach:1.2,windup:.32,recovery:.5,stagger:.05,skin:'#a6a489',shirt:'#b47c36',pants:'#51534e',scale:[1.16,1.04,1.1]},
 crawler:{name:'Crawler',wave:4,hp:3,speed:1.7,radius:.36,damage:10,reach:1.1,windup:.32,recovery:.42,stagger:.1,skin:'#b2a58b',shirt:'#797565',pants:'#454644',scale:[1,1,1]},
 brute:{name:'Brute',wave:5,hp:18,speed:1.62,radius:.48,damage:30,reach:1.55,windup:.55,recovery:.75,stagger:.035,skin:'#c0ad96',shirt:'#b7a38e',pants:'#494648',scale:[1.65,1.4,1.5]}
};
export const WAVES=[6,8,11,14,17,24];
export function waveRoster(wave,count){const crawlers=wave===1?1:Math.round(count*(.15+wave*.018)),runners=wave===6?Math.round(count*.25):0;return Array.from({length:count},(_,i)=>i<crawlers?'crawler':i<crawlers+runners?'runner':'normal').sort(()=>Math.random()-.5);}

// Persistent per-enemy shirt choice; index zero retains each type's original shirt.
export const SHIRT_COLORS=[null,'#a44840','#446fa0','#b69b43','#82558f'];
export function rollShirt(value=Math.random()){return value<.40?0:value<.55?1:value<.70?2:value<.85?3:4;}
