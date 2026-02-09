# Inject Araya widget into all UHOS aspect pages
# Adds <script src="../../../araya-widget.js"></script> before </body>
# Skips pages that already have it

$root = "C:\Users\dwrek\100X_DEPLOYMENT\ULTIMATE_HUMAN_OS\LEVEL_1_FOUNDATION"
$count = 0
$skipped = 0

Get-ChildItem -Path $root -Filter "index.html" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw

    if ($content -match 'araya-widget\.js') {
        $skipped++
        Write-Host "SKIP: $($_.FullName)" -ForegroundColor Yellow
        return
    }

    if ($content -match '</body>') {
        $injection = "`n    <!-- Araya Chat Widget -->`n    <script src=`"../../../araya-widget.js`"></script>"
        $newContent = $content -replace '</body>', "$injection`n</body>"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        $count++
        Write-Host "INJECTED: $($_.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone: $count injected, $skipped skipped" -ForegroundColor Cyan
