import {mm,ortho,lookAt} from './spriteforge.js';

// Capture the final pose once from the fixed game camera, then project its
// silhouette onto the floor. Each retained body costs two triangles.
export class CorpseSprites {
 constructor(renderer){
  this.renderer=renderer;this.g=renderer.g;this.entries=new Map();this.visible=[];
  const g=this.g,compile=(type,source)=>{const s=g.createShader(type);g.shaderSource(s,source);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s;};
  this.program=g.createProgram();
  g.attachShader(this.program,compile(g.VERTEX_SHADER,'attribute vec3 p;attribute vec2 uv;uniform mat4 vp;varying vec2 t;void main(){t=uv;gl_Position=vp*vec4(p,1.);}'));
  g.attachShader(this.program,compile(g.FRAGMENT_SHADER,'precision mediump float;uniform sampler2D tex;varying vec2 t;void main(){vec4 c=texture2D(tex,t);if(c.a<.5)discard;gl_FragColor=c;}'));
  g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw Error(g.getProgramInfoLog(this.program));
  this.p=g.getAttribLocation(this.program,'p');this.uv=g.getAttribLocation(this.program,'uv');this.vp=g.getUniformLocation(this.program,'vp');this.tex=g.getUniformLocation(this.program,'tex');
  this.framebuffer=g.createFramebuffer();this.depth=g.createRenderbuffer();this.captureBuffer=g.createBuffer();
  g.bindRenderbuffer(g.RENDERBUFFER,this.depth);g.renderbufferStorage(g.RENDERBUFFER,g.DEPTH_COMPONENT16,128,128);
 }
 sync(bodies){
  const keep=new Set(bodies),g=this.g;
  for(const [body,item] of this.entries)if(!keep.has(body)){g.deleteTexture(item.texture);g.deleteBuffer(item.buffer);this.entries.delete(body);}
  this.visible=[];this.captured=false;
 }
 add(body,getMesh){
  let item=this.entries.get(body);
  if(!item){
   // Spread simultaneous deaths over frames; remaining bodies finish in 3D.
   if(this.captured)return false;
   item=this.capture(body,getMesh());this.entries.set(body,item);this.captured=true;
  }
  this.visible.push(item);return true;
 }
 capture(body,mesh){
  const r=this.renderer,g=this.g,saved=r.dynamic,used=r.used;
  r.dynamic=new Float32Array(mesh.length);r.used=0;
  r.append(mesh,0,0,0,body.yaw,1,body.shirtVariant||0);
  const data=r.dynamic;r.dynamic=saved;r.used=used;
  let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
  for(let i=0;i<data.length;i+=9){const v=(data[i+1]-data[i+2])/Math.SQRT2;left=Math.min(left,data[i]);right=Math.max(right,data[i]);bottom=Math.min(bottom,v);top=Math.max(top,v);}
  left-=.06;right+=.06;bottom-=.06;top+=.06;
  const texture=g.createTexture();g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,texture);
  for(const key of [g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER])g.texParameteri(g.TEXTURE_2D,key,g.NEAREST);
  for(const key of [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T])g.texParameteri(g.TEXTURE_2D,key,g.CLAMP_TO_EDGE);
  g.texImage2D(g.TEXTURE_2D,0,g.RGBA,128,128,0,g.RGBA,g.UNSIGNED_BYTE,null);
  g.bindFramebuffer(g.FRAMEBUFFER,this.framebuffer);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,texture,0);g.framebufferRenderbuffer(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.RENDERBUFFER,this.depth);
  if(g.checkFramebufferStatus(g.FRAMEBUFFER)!==g.FRAMEBUFFER_COMPLETE)throw Error('Corpse sprite framebuffer unavailable');
  g.viewport(0,0,128,128);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
  g.useProgram(r.program);g.uniformMatrix4fv(r.vpLocation,false,mm(ortho(left,right,bottom,top,.1,110),lookAt([0,30,30],[0,0,0])));
  g.uniform1f(r.darkLocation,0);
  // Avoid sampling the texture currently attached to the framebuffer.
  g.bindTexture(g.TEXTURE_2D,r.shadowTexture);g.uniform1i(r.shadowLocation,0);
  g.bindBuffer(g.ARRAY_BUFFER,this.captureBuffer);g.bufferData(g.ARRAY_BUFFER,data,g.STREAM_DRAW);
  r.attrs.forEach((a,i)=>{g.enableVertexAttribArray(a);g.vertexAttribPointer(a,3,g.FLOAT,false,36,i*12);});
  g.drawArrays(g.TRIANGLES,0,data.length/9);g.bindFramebuffer(g.FRAMEBUFFER,null);
  const point=(x,v,u,t)=>[body.x+x,.055,body.z-v*Math.SQRT2,u,t];
  const a=point(left,bottom,0,0),b=point(right,bottom,1,0),c=point(right,top,1,1),d=point(left,top,0,1);
  const buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array([...a,...b,...c,...a,...c,...d]),g.STATIC_DRAW);
  return {texture,buffer};
 }
 draw(){
  if(!this.visible.length)return;
  const r=this.renderer,g=this.g;g.useProgram(this.program);
  for(const a of r.attrs)g.disableVertexAttribArray(a);
  g.enableVertexAttribArray(this.p);g.enableVertexAttribArray(this.uv);g.uniformMatrix4fv(this.vp,false,r.vp);g.activeTexture(g.TEXTURE0);g.uniform1i(this.tex,0);
  for(const item of this.visible){g.bindTexture(g.TEXTURE_2D,item.texture);g.bindBuffer(g.ARRAY_BUFFER,item.buffer);g.vertexAttribPointer(this.p,3,g.FLOAT,false,20,0);g.vertexAttribPointer(this.uv,2,g.FLOAT,false,20,12);g.drawArrays(g.TRIANGLES,0,6);}
  g.disableVertexAttribArray(this.p);g.disableVertexAttribArray(this.uv);for(const a of r.attrs)g.enableVertexAttribArray(a);
 }
}
