const fs=require('fs'),p='deathcomesafteryou part1/';
let r=fs.readFileSync(p+'js/render.js','utf8');r=r.replace('export class WorldRenderer{',`// Internal canvas pixels are independent of CSS size and device pixel density.
export function renderDimensions(width,height,scale=.5){const s=Math.max(.25,Math.min(1,Number(scale)||.5));return [Math.max(1,Math.round(width*s)),Math.max(1,Math.round(height*s))];}
export class WorldRenderer{`);
r=r.replace('const dpr=Math.min(window.devicePixelRatio||1,quality),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);','const [w,h]=renderDimensions(innerWidth,innerHeight,quality);');fs.writeFileSync(p+'js/render.js',r);
let g=fs.readFileSync(p+'js/game.js','utf8').replace('quality=1.5,previous','quality=.5,previous');fs.writeFileSync(p+'js/game.js',g);
let h=fs.readFileSync(p+'index.html','utf8').replace('<option value="1">Low · Phone friendly</option><option value="1.5" selected>Balanced</option><option value="2">High</option>','<option value="0.5" selected>Performance · 50%</option><option value="0.67">Balanced · 67%</option><option value="1">Full size · 100%</option>');fs.writeFileSync(p+'index.html',h);
fs.appendFileSync(p+'style.css','\n/* Upscale only the world canvas; HTML HUD and input coordinates remain full-size. */\n#game{image-rendering:pixelated;}\n');
