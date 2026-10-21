import {propCuts} from './prop-cuts.js';
// Authored pixel rectangles in the original 1254px sheets; originals remain untouched.
export const ATLAS_SIZE=1254;
export const assets={};
function entry(id,page,rect,layer='prop'){assets[id]={id,page,rect,layer,anchor:layer==='terrain'?'center':'bottom-center',collision:'separate world footprint'};}
const terrain=(id,page,x,y,w=250,h=250)=>entry(id,page,[x,y,w,h],'terrain');
terrain('grass','013',658,60,236,224);terrain('flowers','013',65,954,220,220);
terrain('earth','013',365,356,220,220);terrain('worn-earth','013',662,657,224,224);
terrain('paving','013',349,48,253,249);terrain('broken-paving','013',350,646,250,242);
terrain('stepping','013',350,947,250,235);terrain('old-slab','007',350,344,250,246);
terrain('moss-grass','007',660,648,234,232);terrain('dirt-track','007',967,949,235,232);
const rows14=[18,335,628,925], cols14=[12,320,638,947];
const names14=['mausoleum','iron-panel','arch','gothic-shrine','gate','ruined-wall','crypt-door','wall-end','mourning-angel','sarcophagus','balustrade','broken-column','gothic-window','corner-wall','broken-fence','columbarium'];
names14.forEach((id,i)=>entry(id,'014',[cols14[i%4],rows14[Math.floor(i/4)],i%4===3?295:302,Math.floor(i/4)===3?306:300]));
const names15=['headstone','cross','broken-stone','angel','lantern','shovel','open-grave','coffin','dead-shrub','small-fence','urn','raven','sign','candles','bones','blood'];
names15.forEach((id,i)=>entry(id,'015',[i%4*310+5,Math.floor(i/4)*310+8,305,302]));
entry('vine','016',[30,85,650,255]);entry('grass-tuft','016',[715,120,208,220]);entry('wildflowers','016',[945,98,285,245]);entry('bush','016',[32,395,290,245]);entry('brush','016',[350,365,280,280]);entry('thicket','016',[650,390,580,520]);entry('tall-grass','016',[30,665,590,235]);entry('roots','016',[940,945,290,265]);
entry('oak','017',[22,15,610,680]);entry('dead-tree','017',[640,38,590,662]);entry('pine','017',[50,705,550,525]);entry('fallen-log','017',[635,725,590,250]);entry('stump','017',[630,1004,290,226]);entry('sapling','017',[950,980,270,250]);
entry('rubble','018',[22,40,600,660]);entry('wall-rubble','018',[640,135,590,290]);entry('bricks','018',[650,450,280,225]);entry('stones','018',[950,440,280,245]);entry('wrecked-fence','018',[20,710,610,250]);entry('glass','018',[660,715,255,245]);entry('timbers','018',[20,995,600,230]);entry('debris','018',[950,990,280,240]);
// The terrain uses a dedicated low-resolution atlas; full sheets stay as source art only.
export const pageSizes={'terrain-low':[128,96],'props-clean':[2048,2048]};
for(const [id,cut] of Object.entries(propCuts))Object.assign(assets[id],cut);
Object.values(assets).filter(a=>a.layer==='terrain').forEach((a,i)=>{a.page='terrain-low';a.rect=[i%4*32,Math.floor(i/4)*32,32,32];});
export const texturePages=[...new Set(Object.values(assets).map(a=>a.page))];
