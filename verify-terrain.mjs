import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scenery} from './js/world.js';
import {assets,texturePages,pageSizes} from './js/assets.js';
import {buildSceneryBatches,SceneryRenderer} from './js/scenery.js';
const ground=scenery.filter(s=>s.flat&&s.y===.035);
assert.equal(ground.length,40000);
assert(ground.every(s=>Math.abs(s.w-.8)<1e-9&&Math.abs(s.d-.8)<1e-9));
assert(Math.abs(ground.reduce((n,s)=>n+s.w*s.d,0)-160*160)<1e-6);
assert(scenery.filter(s=>s.flat).every(s=>s.w<=.8+1e-9&&s.d<=.8+1e-9));
assert(['grass','moss-grass','flowers'].every(id=>ground.some(s=>s.id===id)));
assert(!texturePages.includes('007')&&!texturePages.includes('013'));
for(const a of Object.values(assets).filter(a=>a.layer==='terrain')){assert.equal(a.page,'terrain-low');assert.deepEqual(a.rect.slice(2),[32,32]);const [w,h]=pageSizes[a.page];assert(a.rect[0]+32<=w&&a.rect[1]+32<=h);}
const png=fs.readFileSync(new URL('./assets/terrain-low.png',import.meta.url));assert.equal(png.readUInt32BE(16),128);assert.equal(png.readUInt32BE(20),96);
const batches=buildSceneryBatches(scenery);
assert.equal(batches.reduce((n,b)=>n+b.vertices.length/30,0),scenery.length);
assert(batches.every(b=>b.vertices.every(Number.isFinite)));
for(const b of batches)for(let i=0;i<b.vertices.length;i+=5){assert(b.vertices[i+3]>=0&&b.vertices[i+3]<=1);assert(b.vertices[i+4]>=0&&b.vertices[i+4]<=1);}
let uploads=0,draws=0;
const gl=new Proxy({bufferData(){uploads++;},drawArrays(){draws++;}},{get:(o,k)=>k in o?o[k]:()=>{}});
SceneryRenderer.prototype.draw.call({ready:true,g:gl,batches:batches.map(b=>({...b,count:b.vertices.length/5})),textures:{}},[],[0,0,57],[]);
assert.equal(uploads,0);assert(draws>0&&draws<batches.length);
console.log(`PASS: 40,000 0.8-metre ground tiles with grass/moss/flower variation, 32px terrain samples, valid atlas/UVs, ${batches.length} static chunks, ${draws} visible draws and zero per-frame geometry uploads. Atlas: ${png.length} bytes.`);


