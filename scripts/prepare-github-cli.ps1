$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$toolDirectory = Join-Path $repoRoot '.tools/github-cli'
$null = New-Item -ItemType Directory -Path $toolDirectory -Force
$release = Invoke-RestMethod -Uri 'https://api.github.com/repos/cli/cli/releases/latest' -Headers @{'User-Agent'='china-ethnic-atlas-deployment'} -TimeoutSec 30
$archive = $release.assets | Where-Object { $_.name -match '^gh_.*_windows_amd64.zip$' } | Select-Object -First 1
$checksums = $release.assets | Where-Object { $_.name -match '^gh_.*_checksums.txt$' } | Select-Object -First 1
if (!$archive -or !$checksums) { throw 'Official GitHub CLI release files were not found.' }
$archivePath = Join-Path $toolDirectory $archive.name
$checksumPath = Join-Path $toolDirectory $checksums.name
Invoke-WebRequest -Uri $archive.browser_download_url -OutFile $archivePath -UseBasicParsing -TimeoutSec 90
Invoke-WebRequest -Uri $checksums.browser_download_url -OutFile $checksumPath -UseBasicParsing -TimeoutSec 30
$checksumLine = Get-Content -LiteralPath $checksumPath | Where-Object { $_ -match ([regex]::Escape($archive.name) + '$') } | Select-Object -First 1
if (!$checksumLine) { throw 'Archive checksum missing.' }
$expected = ($checksumLine.Trim() -split '\s+')[0]
$actual = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
if ($actual -ne $expected) { throw 'Official archive checksum mismatch.' }
Expand-Archive -LiteralPath $archivePath -DestinationPath $toolDirectory -Force
$executable = Get-ChildItem -LiteralPath $toolDirectory -Filter gh.exe -Recurse | Select-Object -First 1
if (!$executable) { throw 'GitHub CLI executable missing.' }
Write-Output $executable.FullName
& $executable.FullName --version
