const fs=require('fs'),p='deathcomesafteryou part1/';
let a=fs.readFileSync(p+'js/assets.js','utf8');a=a.replace('export const texturePages=',`// The terrain uses a dedicated low-resolution atlas; full sheets stay as source art only.
export const pageSizes={'terrain-low':[128,96]};
Object.values(assets).filter(a=>a.layer==='terrain').forEach((a,i)=>{a.page='terrain-low';a.rect=[i%4*32,Math.floor(i/4)*32,32,32];});
export const texturePages=`);fs.writeFileSync(p+'js/assets.js',a);
let w=fs.readFileSync(p+'js/world.js','utf8');w=w.replace('function floor(id,x,z,w=4,d=4,y=.035,turn=0){scenery.push({id,x,z,w,d,y,turn,flat:true});}',`function floor(id,x,z,w=4,d=4,y=.035,turn=0){
 // One metre tiles: exactly 4 x 4 repetitions within each original 4m cell.
 const columns=Math.ceil(w),rows=Math.ceil(d),tw=w/columns,td=d/rows;
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++)scenery.push({id,x:x-w/2+(col+.5)*tw,z:z-d/2+(row+.5)*td,w:tw,d:td,y,turn,flat:true});
}`);w=w.replace('4.015,4.015,.035','4,4,.035');fs.writeFileSync(p+'js/world.js',w);
let s=fs.readFileSync(p+'js/scenery.js','utf8').replace('assets,ATLAS_SIZE,texturePages','assets,ATLAS_SIZE,texturePages,pageSizes');
s=s.replace('this.buffer=g.createBuffer();this.textures={};','this.textures={};this.batches=buildSceneryBatches(items).map(batch=>{const buffer=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buffer);g.bufferData(g.ARRAY_BUFFER,batch.vertices,g.STATIC_DRAW);return {...batch,vertices:null,count:batch.vertices.length/5,buffer};});');
const start=s.indexOf(' draw(vp,camera,baseAttributes)');
s=s.slice(0,start)+` draw(vp,camera,baseAttributes){if(!this.ready)return;const g=this.g;g.useProgram(this.program);for(const a of baseAttributes)g.disableVertexAttribArray(a);g.enableVertexAttribArray(this.p);g.enableVertexAttribArray(this.uv);g.uniformMatrix4fv(this.vp,false,vp);g.activeTexture(g.TEXTURE0);g.uniform1i(this.tex,0);
  // Static GPU buffers: no per-frame terrain construction or uploads.
  for(const b of this.batches){if(b.maxX<camera[0]-33||b.minX>camera[0]+33||b.maxZ<camera[2]-32||b.minZ>camera[2]+32)continue;
   g.bindTexture(g.TEXTURE_2D,this.textures[b.page]);g.bindBuffer(g.ARRAY_BUFFER,b.buffer);g.vertexAttribPointer(this.p,3,g.FLOAT,false,20,0);g.vertexAttribPointer(this.uv,2,g.FLOAT,false,20,12);g.drawArrays(g.TRIANGLES,0,b.count);
  }g.disableVertexAttribArray(this.p);g.disableVertexAttribArray(this.uv);for(const a of baseAttributes)g.enableVertexAttribArray(a);
 }
}
// Shared with the geometry checks; chunks bound draw calls and view-culling work.
export function buildSceneryBatches(items){
 const groups=new Map();
 for(const s of items){const a=assets[s.id],key=a.page+':'+Math.floor(s.x/16)+':'+Math.floor(s.z/16);
  if(!groups.has(key))groups.set(key,{page:a.page,data:[],minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity});
  const b=groups.get(key),[width,height]=pageSizes[a.page]||[ATLAS_SIZE,ATLAS_SIZE];
  const [rx,ry,rw,rh]=a.rect,u0=(rx+.5)/width,v0=(ry+.5)/height,u1=(rx+rw-.5)/width,v1=(ry+rh-.5)/height;
  let pts;if(s.flat){const y=s.y??.035;pts=[[-s.w/2,y,-s.d/2],[s.w/2,y,-s.d/2],[s.w/2,y,s.d/2],[-s.w/2,y,s.d/2]];}else{const h=s.h*Math.SQRT1_2,y=s.y??.04;pts=[[-s.w/2,y+h,-h],[s.w/2,y+h,-h],[s.w/2,y,0],[-s.w/2,y,0]];}
  let uvs=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];if(s.flip)uvs=uvs.map(([u,v])=>[u0+u1-u,v]);if(s.flat)for(let n=0;n<(s.turn||0);n++)uvs.push(uvs.shift());
  for(const k of [0,1,2,0,2,3]){const x=pts[k][0]+s.x,z=pts[k][2]+s.z;b.data.push(x,pts[k][1],z,...uvs[k]);b.minX=Math.min(b.minX,x);b.maxX=Math.max(b.maxX,x);b.minZ=Math.min(b.minZ,z);b.maxZ=Math.max(b.maxZ,z);}
 }
 return [...groups.values()].map(({data,...batch})=>({...batch,vertices:new Float32Array(data)}));
}
`;fs.writeFileSync(p+'js/scenery.js',s);
