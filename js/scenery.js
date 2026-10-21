import {assets,ATLAS_SIZE,texturePages,pageSizes} from './assets.js';
// Alpha-tested textured geometry shares the existing 3D depth buffer.
// Upright art is aligned to this game's fixed camera, with a ground-contact pivot.
export class SceneryRenderer {
 constructor(g,items){
  this.g=g;this.items=items;this.ready=false;
  const compile=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s;};
  this.program=g.createProgram();g.attachShader(this.program,compile(g.VERTEX_SHADER,'attribute vec3 p;attribute vec2 uv;uniform mat4 vp;varying vec2 t;varying vec2 ground;void main(){t=uv;ground=p.xz;gl_Position=vp*vec4(p,1.);}'));
  g.attachShader(this.program,compile(g.FRAGMENT_SHADER,'precision mediump float; uniform sampler2D tex;uniform float material;varying vec2 t;varying vec2 ground; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);} void main(){vec4 c=texture2D(tex,t);if(c.a<.5)discard;  if(material>.5){   float broad=noise(ground*.13),fine=noise(ground*11.);   vec3 grass=mix(vec3(.255,.282,.133),vec3(.345,.365,.171),broad)+(fine-.5)*.037;   if(material<1.5){c.rgb=mix(c.rgb*.85,grass,.28);}   else if(material<2.5){float gray=dot(c.rgb,vec3(.3,.59,.11));c.rgb=mix(c.rgb,vec3(gray*.96,gray*.94,gray*.78),.65)*.84; float edge=min(min(abs(ground.x),abs(ground.y)),min(abs(abs(ground.x)-42.),abs(abs(ground.y)-42.))); bool court=abs(ground.x)<5.&&abs(ground.y)<5.; bool chapel=abs(ground.x)<8.&&abs(ground.y+61.)<6.; bool crypt=ground.x>49.&&ground.x<67.&&ground.y> -29.&&ground.y< -13.; if(!court&&!chapel&&!crypt)c.rgb=mix(c.rgb,grass,smoothstep(1.3,2.,edge+noise(ground*3.)*.3));}   else {c.rgb=mix(c.rgb*.82,mix(grass,vec3(.32,.278,.182),.6),.25);}  }float luma=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(luma),c.rgb,.76)*vec3(.72,.78,.79);gl_FragColor=vec4(c.rgb,1.);}'));
  g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw Error(g.getProgramInfoLog(this.program));
  this.p=g.getAttribLocation(this.program,'p');this.uv=g.getAttribLocation(this.program,'uv');this.vp=g.getUniformLocation(this.program,'vp');this.tex=g.getUniformLocation(this.program,'tex');this.material=g.getUniformLocation(this.program,'material');this.textures={};this.batches=buildSceneryBatches(items).map(batch=>{const buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,batch.vertices,g.STATIC_DRAW);return {...batch,vertices:null,count:batch.vertices.length/5,buffer};});
  this.loaded=Promise.all(texturePages.map(page=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const texture=g.createTexture();g.bindTexture(g.TEXTURE_2D,texture);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.NEAREST);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.NEAREST);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,img);this.textures[page]=texture;resolve();};img.onerror=()=>reject(Error('Cannot load cemetery sheet '+page));img.src=new URL('../assets/'+page+'.png',import.meta.url).href;}))).then(()=>{this.ready=true;});
 }
 draw(vp,camera,baseAttributes){if(!this.ready)return;const g=this.g;g.useProgram(this.program);for(const a of baseAttributes)g.disableVertexAttribArray(a);g.enableVertexAttribArray(this.p);g.enableVertexAttribArray(this.uv);g.uniformMatrix4fv(this.vp,false,vp);g.activeTexture(g.TEXTURE0);g.uniform1i(this.tex,0);
  // Static GPU buffers: no per-frame terrain construction or uploads.
  for(const b of this.batches){if(b.maxX<camera[0]-33||b.minX>camera[0]+33||b.maxZ<camera[2]-32||b.minZ>camera[2]+32)continue;
   g.uniform1f(this.material,b.material);g.bindTexture(g.TEXTURE_2D,this.textures[b.page]);g.bindBuffer(g.ARRAY_BUFFER,b.buffer);g.vertexAttribPointer(this.p,3,g.FLOAT,false,20,0);g.vertexAttribPointer(this.uv,2,g.FLOAT,false,20,12);g.drawArrays(g.TRIANGLES,0,b.count);
  }g.disableVertexAttribArray(this.p);g.disableVertexAttribArray(this.uv);for(const a of baseAttributes)g.enableVertexAttribArray(a);
 }
}
// Shared with the geometry checks; chunks bound draw calls and view-culling work.
export function buildSceneryBatches(items){
 const groups=new Map();
 for(const s of items){const a=assets[s.id],material=a.layer!=='terrain'?0:['grass','flowers','moss-grass'].includes(s.id)?1:['earth','worn-earth','dirt-track'].includes(s.id)?3:2,key=a.page+':'+material+':'+Math.floor(s.x/16)+':'+Math.floor(s.z/16);
  if(!groups.has(key))groups.set(key,{page:a.page,material,data:[],minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity});
  const b=groups.get(key),[width,height]=pageSizes[a.page]||[ATLAS_SIZE,ATLAS_SIZE];
  const [rx,ry,rw,rh]=a.rect,u0=(rx+.5)/width,v0=(ry+.5)/height,u1=(rx+rw-.5)/width,v1=(ry+rh-.5)/height;
  let pts;if(s.flat){const y=s.y??.035;pts=[[-s.w/2,y,-s.d/2],[s.w/2,y,-s.d/2],[s.w/2,y,s.d/2],[-s.w/2,y,s.d/2]];}else{const h=s.h*Math.SQRT1_2,y=s.y??.04;pts=[[-s.w/2,y+h,-h],[s.w/2,y+h,-h],[s.w/2,y,0],[-s.w/2,y,0]];}
  let uvs=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];if(s.flip)uvs=uvs.map(([u,v])=>[u0+u1-u,v]);if(s.flat)for(let n=0;n<(s.turn||0);n++)uvs.push(uvs.shift());
  for(const k of [0,1,2,0,2,3]){const x=pts[k][0]+s.x,z=pts[k][2]+s.z;b.data.push(x,pts[k][1],z,...uvs[k]);b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}
 }
 return [...groups.values()].map(({data,...batch})=>({...batch,vertices:new Float32Array(data)}));
}
