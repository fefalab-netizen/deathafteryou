Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$entries = Get-Content (Join-Path $PSScriptRoot 'terrain-sources.json') -Raw | ConvertFrom-Json
$atlas = New-Object System.Drawing.Bitmap 128,96
$graphics = [System.Drawing.Graphics]::FromImage($atlas)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$i=0
foreach ($entry in $entries) {
 $source = [System.Drawing.Image]::FromFile((Join-Path $root "assets/$($entry.page).png"))
 $dst = [System.Drawing.Rectangle]::new(($i%4)*32,[math]::Floor($i/4)*32,32,32)
 $r = $entry.rect
 $graphics.DrawImage($source,$dst,$r[0],$r[1],$r[2],$r[3],[System.Drawing.GraphicsUnit]::Pixel)
 $source.Dispose()
 $i++
}
$graphics.Dispose()
$atlas.Save((Join-Path $root 'assets/terrain-low.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$atlas.Dispose()
