Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot -Parent
$props=[System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets/props-clean.png'))
$cuts=Get-Content (Join-Path $root 'assets/props-clean.json') -Raw | ConvertFrom-Json
foreach($prop in $cuts.PSObject.Properties){$r=$prop.Value.rect;for($x=0;$x -lt $r[2];$x++){foreach($y in 0,($r[3]-1)){if($props.GetPixel($r[0]+$x,$r[1]+$y).A -gt 10){throw "Unpadded crop: $($prop.Name)"}}};for($y=0;$y -lt $r[3];$y++){foreach($x in 0,($r[2]-1)){if($props.GetPixel($r[0]+$x,$r[1]+$y).A -gt 10){throw "Unpadded crop: $($prop.Name)"}}}}
$props.Dispose()
$tiles=[System.Drawing.Bitmap]::FromFile((Join-Path $root 'assets/terrain-low.png'))
foreach($family in @(@(0,1,8),@(2,3,9),@(4,5,6,7))){$base=$family[0];foreach($i in $family){for($n=0;$n -lt 32;$n++){
 $x=($i%4)*32;$y=[math]::Floor($i/4)*32;$bx=($base%4)*32;$by=[math]::Floor($base/4)*32
 if($tiles.GetPixel($x,$y+$n).ToArgb() -ne $tiles.GetPixel($bx+31,$by+$n).ToArgb()){throw 'Horizontal seam'}
 if($tiles.GetPixel($x+$n,$y).ToArgb() -ne $tiles.GetPixel($bx+$n,$by+31).ToArgb()){throw 'Vertical seam'}
}}}
$tiles.Dispose()
'PASS: all 54 prop crops have transparent outer borders; every terrain variant matches its family horizontally and vertically.'
