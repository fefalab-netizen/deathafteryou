const fs=require('fs'),p='deathcomesafteryou part1/';
let s=fs.readFileSync(p+'js/scenery.js','utf8');
s=s.replace('varying vec2 t;void main(){t=uv;', 'varying vec2 t;varying vec2 ground;void main(){t=uv;ground=p.xz;');
const old="precision mediump float;uniform sampler2D tex;varying vec2 t;void main(){vec4 c=texture2D(tex,t);if(c.a<.5)discard;gl_FragColor=vec4(c.rgb,1.);}";
const shader=`precision mediump float;
uniform sampler2D tex;uniform float material;varying vec2 t;varying vec2 ground;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec4 c=texture2D(tex,t);if(c.a<.5)discard;
 if(material>.5){
  float broad=noise(ground*.13),fine=noise(ground*11.);
  vec3 grass=mix(vec3(.255,.282,.133),vec3(.345,.365,.171),broad)+(fine-.5)*.037;
  if(material<1.5){c.rgb=grass;}
  else if(material<2.5){float gray=dot(c.rgb,vec3(.3,.59,.11));c.rgb=mix(c.rgb,vec3(gray*.96,gray*.94,gray*.78),.65)*.84;}
  else {c.rgb=mix(grass,vec3(.32,.278,.182),.35+.23*noise(ground*.8));}
 }gl_FragColor=vec4(c.rgb,1.);}`;
s=s.replace(old,shader.replaceAll('\n',' '));
s=s.replace("this.tex=g.getUniformLocation(this.program,'tex');", "this.tex=g.getUniformLocation(this.program,'tex');this.material=g.getUniformLocation(this.program,'material');");
s=s.replace('g.bindTexture(g.TEXTURE_2D,this.textures[b.page]);','g.uniform1f(this.material,b.material);g.bindTexture(g.TEXTURE_2D,this.textures[b.page]);');
s=s.replace("const a=assets[s.id],key=a.page+':'+Math.floor(s.x/16)+':'+Math.floor(s.z/16);", "const a=assets[s.id],material=a.layer!=='terrain'?0:['grass','flowers','moss-grass'].includes(s.id)?1:['earth','worn-earth','dirt-track'].includes(s.id)?3:2,key=a.page+':'+material+':'+Math.floor(s.x/16)+':'+Math.floor(s.z/16);");
s=s.replace('{page:a.page,data:[]','{page:a.page,material,data:[]');fs.writeFileSync(p+'js/scenery.js',s);
let w=fs.readFileSync(p+'js/world.js','utf8');
let start=w.indexOf('export function surfaceAt'),end=w.indexOf('// Angel court',start);
w=w.slice(0,start)+`export function surfaceAt(x,z){
 if(Math.abs(x)<5&&Math.abs(z)<5)return 'plaza';
 if(Math.abs(x)<8&&near(z,-61,6))return 'chapel';
 const avenue=Math.sin(z*.075)*.9;
 if(Math.abs(x-avenue)<1.8||Math.abs(z-Math.sin(x*.08)*.7)<1.7||near(Math.abs(x),42,1.6)||near(Math.abs(z),42,1.6))return 'path';
 if(near(Math.abs(x),70,1.5)||near(Math.abs(z),70,1.5))return 'trail';
 return 'grass';
}
// World-space grass shading spans tile boundaries. No repeated flowers or rocks in the lawn.
for(let z=-79;z<80;z+=2)for(let x=-79;x<80;x+=2){
 const type=surfaceAt(x,z);
 const id=type==='grass'?'grass':type==='trail'?'earth':pick(['paving','paving','broken-paving']);
 floor(id,x,z,2,2,.035,Math.floor(rand()*4));
}
// Small irregular stones soften selected path edges instead of continuous concrete curbs.
for(let z=-67;z<70;z+=3.3){if(Math.abs(z)<10)continue;const x=Math.sin(z*.075)*.9;
 for(const side of [-1,1])if(rand()<.30)prop('grass-tuft',x+side*(2+rand()*.4),z,.45+rand()*.3,.3);
}
`+w.slice(end);
w=w.replace('[8,14,20,26,32,51,57,63]','[9,19,29,52,62]').replace('[17,24,31,51,58,65]','[18,30,52,64]');
w=w.replace("const x=sx*xx,z=sz*zz;", "const x=sx*xx+(rand()-.5)*1.1,z=sz*zz+(rand()-.5)*1.3;");
w=w.replace("const r=rand();floor(pick(['earth','worn-earth']),x,z+1,2.3,3.4,.055);", "const r=rand();");
w=w.replace("if(r<.10)","if(r<.045)").replace("else if(r<.16)","else if(r<.07)");
w=w.replace("['headstone','headstone','cross','broken-stone']","['headstone','headstone','headstone','cross','broken-stone']");
w=w.replace("if(rand()<.28)prop('wildflowers'", "if(rand()<.65)prop('wildflowers'");
w=w.replace("if(rand()<.14)prop('bones'", "if(rand()<.035)prop('bones'");
w=w.replace("prop('dead-tree',x,z,4.5,6", "prop(pick(['oak','oak','dead-tree']),x,z,6,7");
w=w.replace("['oak','dead-tree','pine']","['oak','oak','pine']").replace("[-62,-49,-29,-13,13,29,49,62]","[-66,-58,-50,-30,-22,-14,14,22,30,50,58,66]");
start=w.indexOf('// Low vegetation fills');end=w.indexOf('export const outdoorObstacles',start);
w=w.slice(0,start)+`// Planting is clustered around trees and boundaries; lawns remain quiet for combat readability.
for(const [cx,cz] of [[-35,10],[34,12],[-34,-12],[34,-12],[-51,10],[52,11],[-52,-52],[33,59],[-73,54],[73,-50]]){
 for(let i=0;i<9;i++){const a=rand()*Math.PI*2,r=1.8+rand()*2.6,x=cx+Math.sin(a)*r,z=cz+Math.cos(a)*r;
 if(surfaceAt(x,z)!=='grass')continue;prop(pick(['grass-tuft','wildflowers','bush']),x,z,.6+rand(),.45+rand()*.65);}
}
for(let i=0;i<65;i++){const x=rand()*146-73,z=rand()*146-73;if(surfaceAt(x,z)!=='grass')continue;prop('grass-tuft',x,z,.35+rand()*.4,.25);}
`+w.slice(end);
fs.writeFileSync(p+'js/world.js',w);
