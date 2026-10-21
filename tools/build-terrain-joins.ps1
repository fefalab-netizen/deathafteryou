Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot -Parent
& (Join-Path $PSScriptRoot 'build-terrain.ps1')
$path=Join-Path $root 'assets/terrain-low.png'
$src=[System.Drawing.Bitmap]::FromFile($path)
$out=[System.Drawing.Bitmap]::new(128,96)
$families=@(0,0,2,2,4,4,4,4,0,2)
$templates=@{}
foreach($base in 0,2,4){
 $t=[System.Drawing.Bitmap]::new(32,32)
 for($y=0;$y -lt 32;$y++){for($x=0;$x -lt 32;$x++){$t.SetPixel($x,$y,$src.GetPixel(($base%4)*32+$x,[math]::Floor($base/4)*32+$y))}}
 for($y=0;$y -lt 32;$y++){$a=$t.GetPixel(0,$y);$b=$t.GetPixel(31,$y);$c=[System.Drawing.Color]::FromArgb(255,($a.R+$b.R)/2,($a.G+$b.G)/2,($a.B+$b.B)/2);$t.SetPixel(0,$y,$c);$t.SetPixel(31,$y,$c)}
 for($x=0;$x -lt 32;$x++){$a=$t.GetPixel($x,0);$b=$t.GetPixel($x,31);$c=[System.Drawing.Color]::FromArgb(255,($a.R+$b.R)/2,($a.G+$b.G)/2,($a.B+$b.B)/2);$t.SetPixel($x,0,$c);$t.SetPixel($x,31,$c)}
 $templates[$base]=$t
}
for($i=0;$i -lt 10;$i++){
 $ox=($i%4)*32;$oy=[math]::Floor($i/4)*32;$base=$templates[$families[$i]]
 for($y=0;$y -lt 32;$y++){for($x=0;$x -lt 32;$x++){
 $a=$src.GetPixel($ox+$x,$oy+$y);$b=$base.GetPixel($x,$y)
 $d=[math]::Min([math]::Min($x,31-$x),[math]::Min($y,31-$y));$f=[math]::Min(1,$d/5.0);$f=$f*$f*(3-2*$f)
 $c=[System.Drawing.Color]::FromArgb(255,[int]($b.R+($a.R-$b.R)*$f),[int]($b.G+($a.G-$b.G)*$f),[int]($b.B+($a.B-$b.B)*$f));$out.SetPixel($ox+$x,$oy+$y,$c)
 }}
}
$src.Dispose();$out.Save($path,[System.Drawing.Imaging.ImageFormat]::Png);$out.Dispose()
foreach($t in $templates.Values){$t.Dispose()}
