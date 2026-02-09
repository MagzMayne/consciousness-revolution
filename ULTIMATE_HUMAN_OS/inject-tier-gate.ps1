$base = "C:\Users\dwrek\100X_DEPLOYMENT\ULTIMATE_HUMAN_OS\LEVEL_1_FOUNDATION"
$count = 0

$tierTags = @"

    <!-- Tier Gate System -->
    <link rel="stylesheet" href="../../../tier-gate.css">
    <script src="../../../tier-gate.js"></script>
"@

Get-ChildItem -Path $base -Recurse -Filter "index.html" | ForEach-Object {
    $path = $_.FullName
    # Only process aspect-level pages (depth 3: LEVEL_1/DOMAIN/ASPECT/index.html)
    $rel = $path.Substring($base.Length + 1)
    $parts = $rel.Split('\')
    if ($parts.Count -eq 3 -and $parts[2] -eq "index.html") {
        $content = Get-Content -Path $path -Raw
        if ($content -notmatch "tier-gate") {
            $newContent = $content -replace '</body>', "$tierTags`n</body>"
            Set-Content -Path $path -Value $newContent -NoNewline
            $count++
            Write-Host "Injected: $rel"
        } else {
            Write-Host "Skipped (already has tier-gate): $rel"
        }
    }
}

Write-Host "`nTotal files injected: $count"
