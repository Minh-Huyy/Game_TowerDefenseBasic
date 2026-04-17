Add-Type -AssemblyName System.Drawing

$files = @("img/tower_basic.png", "img/tower_aoe.png", "img/tower_slow.png", "img/tower_poison.png")

foreach ($f in $files) {
    if (Test-Path $f) {
        $path = (Resolve-Path $f).Path
        $img = [System.Drawing.Bitmap]::FromFile($path)
        
        $newImg = New-Object System.Drawing.Bitmap(128, 128)
        $g = [System.Drawing.Graphics]::FromImage($newImg)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, 128, 128)
        $g.Dispose()
        $img.Dispose()
        
        for($x=0; $x -lt 128; $x++){
            for($y=0; $y -lt 128; $y++){
                $c = $newImg.GetPixel($x,$y)
                if($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240){
                    $newImg.SetPixel($x,$y, [System.Drawing.Color]::Transparent)
                }
            }
        }
        
        $newPath = $path.Replace(".png", "_t.png")
        $newImg.Save($newPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $newImg.Dispose()
        
        Move-Item -Force $newPath $path
        Write-Host "Processed $f"
    }
}
