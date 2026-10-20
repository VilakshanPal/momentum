# Headless Chrome screenshots of the main screens. Usage: powershell -File scripts/shots.ps1 [outDir]
param([string]$out = "$PSScriptRoot\..\.shots")
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$base = "http://localhost:3000"
$p = "00000000-0000-4000-8000-000000000001"
New-Item -ItemType Directory -Force $out | Out-Null
$pages = @{
  "home"      = "/p/$p"
  "board"     = "/p/$p/board"
  "decisions" = "/p/$p/decisions"
  "published" = "/p/$p/m/00000000-0000-4000-8000-000000000012"
}
foreach ($k in $pages.Keys) {
  & $chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1568,900 --virtual-time-budget=6000 --user-data-dir="$env:TEMP\mom-shots" --screenshot="$out\$k.png" "$base$($pages[$k])" 2>$null | Out-Null
}
Get-ChildItem $out | Select-Object Name, Length
