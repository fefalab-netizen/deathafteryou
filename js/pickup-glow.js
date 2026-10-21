// Small additive ground halos, batched into one draw. No shadow maps, bloom
// targets or per-item dynamic lights are needed.
export class PickupGlow {
 constructor(g){
  this.g=g;this.vertices=[];this.buffer=g.createBuffer();
  const compile=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));return s;};
  this.program=g.createProgram();
  g.attachShader(this.program,compile(g.VERTEX_SHADER,'attribute vec3 p,color;attribute vec2 uv;uniform mat4 vp;varying vec2 t;varying vec3 c;void main(){t=uv;c=color;gl_Position=vp*vec4(p,1.);}'));
  g.attachShader(this.program,compile(g.FRAGMENT_SHADER,'precision mediump float;varying vec2 t;varying vec3 c;void main(){float d=length(t);float a=pow(max(0.,1.-d),2.)*.65;gl_FragColor=vec4(c,a);}'));
  g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw Error(g.getProgramInfoLog(this.program));
  this.attrs=['p','uv','color'].map(n=>g.getAttribLocation(this.program,n));this.vp=g.getUniformLocation(this.program,'vp');
 }
 begin(){this.vertices.length=0;}
 add(x,z,health,time){
  const radius=.85+.06*Math.sin(time*2),color=health?[.35,.85,.63]:[.95,.77,.39];
  for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]])this.vertices.push(x+u*radius,.085,z+v*radius,u,v,...color);
 }
 draw(vp,baseAttributes){
  if(!this.vertices.length)return;
  const g=this.g;g.useProgram(this.program);for(const a of baseAttributes)g.disableVertexAttribArray(a);
  g.bindBuffer(g.ARRAY_BUFFER,this.buffer);g.bufferData(g.ARRAY_BUFFER,new Float32Array(this.vertices),g.STREAM_DRAW);
  for(const [i,size,offset] of [[0,3,0],[1,2,12],[2,3,20]]){g.enableVertexAttribArray(this.attrs[i]);g.vertexAttribPointer(this.attrs[i],size,g.FLOAT,false,32,offset);}
  g.uniformMatrix4fv(this.vp,false,vp);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE);g.depthMask(false);
  g.drawArrays(g.TRIANGLES,0,this.vertices.length/8);
  g.depthMask(true);g.disable(g.BLEND);for(const a of this.attrs)g.disableVertexAttribArray(a);for(const a of baseAttributes)g.enableVertexAttribArray(a);
 }
}
