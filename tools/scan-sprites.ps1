Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Private.Windows.GdiPlus,System.Private.Windows.Core,System.Collections,System.Runtime -TypeDefinition @"
using System;using System.Collections.Generic;using System.Drawing;
public class SpriteScan {
 public static int[][] Bounds(string file){using(var bmp=new Bitmap(file)){int w=bmp.Width,h=bmp.Height;var mask=new bool[w*h];for(int y=0;y<h;y++)for(int x=0;x<w;x++)mask[y*w+x]=bmp.GetPixel(x,y).A>=100;
 var output=new List<int[]>();var q=new int[w*h];for(int i=0;i<mask.Length;i++){if(!mask[i])continue;int head=0,tail=1;q[0]=i;mask[i]=false;int lx=w,ly=h,rx=0,ry=0;
 while(head<tail){int k=q[head++],x=k%w,y=k/w;lx=Math.Min(lx,x);rx=Math.Max(rx,x);ly=Math.Min(ly,y);ry=Math.Max(ry,y);for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int nk=ny*w+nx;if(mask[nk]){mask[nk]=false;q[tail++]=nk;}}}
 if(tail>300)output.Add(new int[]{lx,ly,rx-lx+1,ry-ly+1,tail});}return output.ToArray();}}
}
"@
$result=@{}
foreach($page in '014','015','016','017','018'){$result[$page]=[SpriteScan]::Bounds((Join-Path (Split-Path $PSScriptRoot -Parent) "assets/$page.png"))}
$result | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $PSScriptRoot 'sprite-components.json')
$result | ConvertTo-Json -Depth 6


