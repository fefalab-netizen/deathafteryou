// Install the measured isolated-prop manifest without altering the original sheets.
const fs=require('fs'),p='deathcomesafteryou part1/';const clean=JSON.parse(fs.readFileSync(p+'assets/props-clean.json','utf8').replace(/^\uFEFF/,''));
fs.writeFileSync(p+'js/prop-cuts.js','export const propCuts='+JSON.stringify(clean,null,2)+';\n');
let a=fs.readFileSync(p+'js/assets.js','utf8');a="import {propCuts} from './prop-cuts.js';\n"+a;
a=a.replace("export const pageSizes={'terrain-low':[128,96]};","export const pageSizes={'terrain-low':[128,96],'props-clean':[2048,2048]};\nfor(const [id,cut] of Object.entries(propCuts))Object.assign(assets[id],cut);");fs.writeFileSync(p+'js/assets.js',a);
let w=fs.readFileSync(p+'js/world.js','utf8');w=w.replace('const tileSize=1,','const tileSize=.8,').replace('// One-metre repeats reduce the size of individual stones and grass details.','// 0.8m repeats are 20% smaller; atlas borders are matched by terrain family.');
w=w.replace('for(let z=-79;z<80;z+=2)for(let x=-79;x<80;x+=2){','for(let row=0;row<200;row++)for(let col=0;col<200;col++){\n const x=-80+(col+.5)*.8,z=-80+(row+.5)*.8;');
w=w.replace('floor(id,x,z,2,2,.035,Math.floor(rand()*4));','floor(id,x,z,.8,.8,.035,0);');
fs.writeFileSync(p+'js/world.js',w);
let v=fs.readFileSync(p+'verify-terrain.mjs','utf8').replace('ground.length,25600','ground.length,40000').replace('s.w===1&&s.d===1','Math.abs(s.w-.8)<1e-9&&Math.abs(s.d-.8)<1e-9').replace('s.w<=1&&s.d<=1','s.w<=.8+1e-9&&s.d<=.8+1e-9').replace('25,600 one-metre ground tiles','40,000 0.8-metre ground tiles');fs.writeFileSync(p+'verify-terrain.mjs',v);
