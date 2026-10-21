Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Private.Windows.GdiPlus,System.Private.Windows.Core,System.Collections,System.Runtime -TypeDefinition @"
using System;using System.Drawing;using System.Drawing.Imaging;
public class SpriteCut {
 public static Bitmap Extract(string file,int[] box,int[] component,bool region){using(var src=new Bitmap(file)){int w=src.Width,h=src.Height;var mask=new bool[w*h];int lx=w,ly=h,rx=0,ry=0;
 if(region){for(int y=box[1];y<Math.Min(h,box[1]+box[3]);y++)for(int x=box[0];x<Math.Min(w,box[0]+box[2]);x++)if(src.GetPixel(x,y).A>=100)mask[y*w+x]=true;}
 else {int seed=-1;for(int y=component[1];y<component[1]+component[3]&&seed<0;y++)for(int x=component[0];x<component[0]+component[2];x++)if(src.GetPixel(x,y).A>=100){seed=y*w+x;break;}
 var q=new int[w*h];int head=0,tail=1;q[0]=seed;mask[seed]=true;while(head<tail){int k=q[head++],x=k%w,y=k/w;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;int nk=ny*w+nx;if(!mask[nk]&&src.GetPixel(nx,ny).A>=100){mask[nk]=true;q[tail++]=nk;}}}}
 for(int y=0;y<h;y++)for(int x=0;x<w;x++)if(mask[y*w+x]){lx=Math.Min(x,lx);rx=Math.Max(x,rx);ly=Math.Min(y,ly);ry=Math.Max(y,ry);}
 lx=Math.Max(0,lx-4);ly=Math.Max(0,ly-4);rx=Math.Min(w-1,rx+4);ry=Math.Min(h-1,ry+4);var result=new Bitmap(rx-lx+1,ry-ly+1);
 for(int y=ly;y<=ry;y++)for(int x=lx;x<=rx;x++){bool keep=mask[y*w+x];if(!keep&&src.GetPixel(x,y).A<100)for(int dy=-2;dy<=2&&!keep;dy++)for(int dx=-2;dx<=2;dx++){int nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<w&&ny<h&&mask[ny*w+nx]){keep=true;break;}}if(keep)result.SetPixel(x-lx,y-ly,src.GetPixel(x,y));}
 return result;}}
}
"@
$root=Split-Path $PSScriptRoot -Parent
$entries=Get-Content (Join-Path $PSScriptRoot 'prop-sources.json') -Raw | ConvertFrom-Json
$atlas=[System.Drawing.Bitmap]::new(2048,2048)
$g=[System.Drawing.Graphics]::FromImage($atlas)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$manifest=@{}
$i=0
foreach($a in $entries){
 $cut=[SpriteCut]::Extract((Join-Path $root "assets/$($a.page).png"),[int[]]$a.rect,[int[]]$a.component,($a.mode -eq 'region'))
 $scale=[Math]::Min(248.0/$cut.Width,248.0/$cut.Height)
 $w=[Math]::Max(1,[Math]::Round($cut.Width*$scale));$h=[Math]::Max(1,[Math]::Round($cut.Height*$scale))
 $x=($i%8)*256+4;$y=[Math]::Floor($i/8)*256+4
 $g.DrawImage($cut,[System.Drawing.Rectangle]::new(($x+2),($y+2),$w,$h),0,0,$cut.Width,$cut.Height,[System.Drawing.GraphicsUnit]::Pixel)
 $manifest[$a.id]=@{page='props-clean';rect=@($x,$y,($w+4),($h+4));sourcePage=$a.page;sourceBounds=$a.component[0..3];category= $(if($a.page -eq '014'){'cemetery architecture'}elseif($a.page -eq '015'){'cemetery props'}elseif($a.page -eq '016'){'vegetation'}elseif($a.page -eq '017'){'trees and wood'}else{'rubble'})}
 $cut.Dispose();$i++
}
$g.Dispose();$atlas.Save((Join-Path $root 'assets/props-clean.png'),[System.Drawing.Imaging.ImageFormat]::Png);$atlas.Dispose()
$manifest | ConvertTo-Json -Depth 6 | Set-Content (Join-Path $root 'assets/props-clean.json')
"Isolated and packed $i sprites"

