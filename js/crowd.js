import {SHIRT_COLORS} from './zombies.js';
const tints=SHIRT_COLORS.map(c=>c?c.match(/\w\w/g).map(v=>parseInt(v,16)/255):null);

// One immutable GPU mesh per pose; instances supply only position, rotation,
// and shirt color. This avoids transforming/uploading every vertex per actor.
export class CrowdRenderer {
 constructor(renderer,fragmentSource){
  this.r=renderer;const g=this.g=renderer.g;
  this.ext=g.getExtension('ANGLE_instanced_arrays');
  this.cache=new Map();this.groups=new Map();this.bytes=0;
  if(!this.ext)return;
  const shader=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s;};
  this.program=g.createProgram();
  g.attachShader(this.program,shader(g.VERTEX_SHADER,`
   attribute vec3 pos,normal,color,offset,tint;attribute vec2 turn;
   uniform mat4 vp;uniform vec3 shirtBase;
   varying vec3 c;varying vec2 worldXZ;
   void main(){
    vec3 p=vec3(turn.x*pos.x+turn.y*pos.z,pos.y,-turn.y*pos.x+turn.x*pos.z)+offset;
    vec3 n=vec3(turn.x*normal.x+turn.y*normal.z,normal.y,-turn.y*normal.x+turn.x*normal.z);
    vec3 col=distance(color,shirtBase)<.00001?tint:color;
    float light=.48+.52*max(dot(normalize(n),normalize(vec3(-.6,1.,.5))),0.);
    c=col*light;worldXZ=p.xz;gl_Position=vp*vec4(p,1.);
   }`));
  g.attachShader(this.program,shader(g.FRAGMENT_SHADER,fragmentSource));g.linkProgram(this.program);
  if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw Error(g.getProgramInfoLog(this.program));
  this.attrs=['pos','normal','color','offset','turn','tint'].map(n=>g.getAttribLocation(this.program,n));
  this.uniforms=Object.fromEntries(['vp','shirtBase','dark','lamp','shadows'].map(n=>[n,g.getUniformLocation(this.program,n)]));
  this.instances=g.createBuffer();
 }
 begin(){this.groups.clear();}
 add(mesh,x,y,z,yaw,shirt){
  if(!this.ext)return false;
  let instances=this.groups.get(mesh);if(!instances)this.groups.set(mesh,instances=[]);
  instances.push(x,y,z,Math.cos(yaw),Math.sin(yaw),...(tints[shirt]||mesh.shirtBase));
  return true;
 }
 draw(){
  if(!this.groups.size)return;
  const g=this.g,r=this.r,e=this.ext,u=this.uniforms;
  g.useProgram(this.program);for(const a of r.attrs)g.disableVertexAttribArray(a);
  for(const a of this.attrs)g.enableVertexAttribArray(a);
  g.uniformMatrix4fv(u.vp,false,r.vp);g.uniform1f(u.dark,r.dark?1:0);g.uniform2fv(u.lamp,r.lamp);
  g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,r.shadowTexture);g.uniform1i(u.shadows,0);
  for(const [mesh,data] of this.groups){
   let buffer=this.cache.get(mesh);
   if(!buffer){buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,mesh,g.STATIC_DRAW);this.bytes+=mesh.byteLength;}
   this.cache.delete(mesh);this.cache.set(mesh,buffer);
   g.bindBuffer(g.ARRAY_BUFFER,buffer);
   for(let i=0;i<3;i++)g.vertexAttribPointer(this.attrs[i],3,g.FLOAT,false,36,i*12);
   g.uniform3fv(u.shirtBase,mesh.shirtBase);
   g.bindBuffer(g.ARRAY_BUFFER,this.instances);g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.STREAM_DRAW);
   for(const [i,size,offset] of [[3,3,0],[4,2,12],[5,3,20]]){g.vertexAttribPointer(this.attrs[i],size,g.FLOAT,false,32,offset);e.vertexAttribDivisorANGLE(this.attrs[i],1);}
   e.drawArraysInstancedANGLE(g.TRIANGLES,0,mesh.length/9,data.length/8);
  }
  for(const a of this.attrs){e.vertexAttribDivisorANGLE(a,0);g.disableVertexAttribArray(a);}
  for(const a of r.attrs)g.enableVertexAttribArray(a);
  // Bound retained CPU references and GPU pose storage between frames.
  while(this.bytes>48*1024*1024){const [mesh,buffer]=this.cache.entries().next().value;g.deleteBuffer(buffer);this.cache.delete(mesh);this.bytes-=mesh.byteLength;}
 }
}
