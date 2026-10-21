import fs from 'node:fs';import {assets} from '../js/assets.js';
const components=JSON.parse(fs.readFileSync(new URL('./sprite-components.json',import.meta.url)));
const records=Object.values(assets).filter(a=>a.layer==='prop').map(a=>{const [x,y,w,h]=a.rect,cx=x+w/2,cy=y+h/2;
 const list=components[a.page].filter(c=>c[4]>5000);
 const best=list.sort((a,b)=>Math.hypot((a[0]+a[2]/2-cx)/w,(a[1]+a[3]/2-cy)/h)-Math.hypot((b[0]+b[2]/2-cx)/w,(b[1]+b[3]/2-cy)/h))[0];
 return {...a,component:best,mode:a.page==='018'||a.id==='blood'?'region':'component'};});
fs.writeFileSync(new URL('./prop-sources.json',import.meta.url),JSON.stringify(records,null,2));
