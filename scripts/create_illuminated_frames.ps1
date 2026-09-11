Add-Type -AssemblyName System.Drawing

function RefineCleanFrame($inputPath, $outputPath, $isPage2) {
    $src = New-Object System.Drawing.Bitmap($inputPath)
    $w = $src.Width
    $h = $src.Height

    $dest = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Draw original
    $g.DrawImage($src, 0, 0, $w, $h)

    # 1. Clear top watermark (y: 0 to 45)
    $topMarginBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 252, 246))
    $g.FillRectangle($topMarginBrush, 0, 0, $w, 45)

    # Background parchment color matching scanned page: #fbf9f2
    $parchmentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(251, 249, 242))

    # Inner borders:
    $leftX = if ($isPage2) { 156 } else { 150 }
    $rightX = if ($isPage2) { 898 } else { 899 }
    $boxW = $rightX - $leftX
    $topY = if ($isPage2) { 533 } else { 534 }
    $botY = if ($isPage2) { 1349 } else { 1344 }
    $boxH = $botY - $topY

    # 2. Clear the 6 text lines completely
    $g.FillRectangle($parchmentBrush, $leftX, $topY, $boxW, $boxH)

    # Draw the 5 golden divider lines (2px)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 180, 150, 70), 2)
    $lineStep = $boxH / 6.0
    for ($i = 1; $i -lt 6; $i++) {
        $ly = [int]($topY + ($i * $lineStep))
        $g.DrawLine($pen, $leftX, $ly, $rightX, $ly)
    }

    # 3. Clear Bismillah cartouche (cover all way down to topY):
    $bismLeft = if ($isPage2) { 210 } else { 210 }
    $bismRight = if ($isPage2) { 840 } else { 835 }
    $bismTop = 345
    $bismH = $topY - $bismTop + 2

    $g.FillRectangle($parchmentBrush, $bismLeft + 10, $bismTop, ($bismRight - $bismLeft - 20), $bismH)
    $g.FillEllipse($parchmentBrush, $bismLeft, $bismTop, ($bismRight - $bismLeft), $bismH)

    # 4. Clear Surah Header cartouche:
    $headTop = 220
    $headBot = 338
    $headH = $headBot - $headTop
    $g.FillRectangle($parchmentBrush, $bismLeft + 15, $headTop, ($bismRight - $bismLeft - 30), $headH)
    $g.FillEllipse($parchmentBrush, $bismLeft, $headTop, ($bismRight - $bismLeft), $headH)

    $pen.Dispose()
    $parchmentBrush.Dispose()
    $topMarginBrush.Dispose()
    $g.Dispose()

    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $dest.Dispose()
    $src.Dispose()
    Write-Host "Perfected frame: $outputPath"
}

RefineCleanFrame "d:\Holy Quran app\public\pages\page_002.jpg" "d:\Holy Quran app\public\images\frame_page_002.jpg" $true
RefineCleanFrame "d:\Holy Quran app\public\pages\page_003.jpg" "d:\Holy Quran app\public\images\frame_page_003.jpg" $false
