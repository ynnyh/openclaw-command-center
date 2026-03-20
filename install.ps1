param(
  [Parameter(Mandatory = $true)]
  [string]$OpenClawRoot,
  [string]$Container,
  [switch]$WriteDockerOverride,
  [switch]$WriteEnvExample,
  [switch]$EnableAutostart,
  [switch]$Force,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$PackageRoot = $PSScriptRoot
$ShellDir = Join-Path $PackageRoot 'shell'
$IconsDir = Join-Path $PackageRoot 'icons'
$SourceScriptsDir = Join-Path $PackageRoot 'scripts'
$ControlUiPath = '/usr/local/lib/node_modules/openclaw/dist/control-ui'
$RequiredScriptFiles = @(
  'command-center-helper.mjs',
  'ensure-command-center-helper.ps1',
  'install-command-center-helper-autostart.ps1'
)

function Write-Info([string]$Message) {
  Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
  Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-WarnLine([string]$Message) {
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Fail([string]$Message) {
  throw $Message
}

function Write-Utf8NoBom([string]$Path, [string]$Content) {
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

function Resolve-RequiredDirectory([string]$Path, [string]$Label) {
  if (-not (Test-Path $Path -PathType Container)) {
    Fail "$Label not found: $Path"
  }
  return (Resolve-Path $Path).Path
}

function Resolve-OptionalFile([string[]]$Candidates) {
  foreach ($candidate in $Candidates) {
    if (Test-Path $candidate -PathType Leaf) {
      return (Resolve-Path $candidate).Path
    }
  }
  return $null
}

function Test-OpenClawContainer([string]$Name) {
  if ([string]::IsNullOrWhiteSpace($Name)) {
    return $false
  }
  & docker exec $Name sh -c "test -d $ControlUiPath" *> $null
  return $LASTEXITCODE -eq 0
}

function Get-OpenClawContainer([string]$RequestedContainer) {
  if (-not [string]::IsNullOrWhiteSpace($RequestedContainer)) {
    if (-not (Test-OpenClawContainer $RequestedContainer)) {
      Fail "Container '$RequestedContainer' is not running or does not contain $ControlUiPath"
    }
    return $RequestedContainer
  }

  Write-Info 'Detecting a running OpenClaw container...'
  $runningContainers = & docker ps --format '{{.Names}}'
  foreach ($name in $runningContainers) {
    if (Test-OpenClawContainer $name) {
      Write-Ok "Detected container: $name"
      return $name
    }
  }

  Fail 'No running OpenClaw container was detected. Use -Container to specify one.'
}

function Get-OpenClawVersion([string]$Name) {
  $version = & docker exec $Name node -p "require('/usr/local/lib/node_modules/openclaw/package.json').version" 2>$null
  if ([string]::IsNullOrWhiteSpace($version)) {
    return 'unknown'
  }
  return ($version | Select-Object -First 1).Trim()
}

function Get-RequiredAsset([string]$AssetsDir, [string]$Pattern, [string]$Label) {
  $match = Get-ChildItem -Path $AssetsDir -File -Filter $Pattern | Select-Object -First 1
  if (-not $match) {
    Fail "Could not find $Label in $AssetsDir matching $Pattern"
  }
  return $match.Name
}

function Render-Template([string]$TemplatePath, [hashtable]$Replacements) {
  $content = Get-Content $TemplatePath -Raw
  foreach ($key in $Replacements.Keys) {
    $content = $content.Replace($key, $Replacements[$key])
  }
  return $content
}

function Get-ComposeServiceName([string]$ComposeFile, [string]$Fallback) {
  if ([string]::IsNullOrWhiteSpace($ComposeFile) -or -not (Test-Path $ComposeFile -PathType Leaf)) {
    return $Fallback
  }

  $inServicesBlock = $false
  foreach ($line in Get-Content $ComposeFile) {
    if ($line -match '^\s*services:\s*$') {
      $inServicesBlock = $true
      continue
    }
    if ($inServicesBlock -and $line -match '^\S') {
      break
    }
    if ($inServicesBlock -and $line -match '^\s{2}([A-Za-z0-9._-]+):\s*$') {
      return $Matches[1]
    }
  }

  return $Fallback
}

function Update-EnvExample([string]$SourcePath, [string]$TargetPath) {
  $sourceLines = Get-Content $SourcePath
  if (-not (Test-Path $TargetPath -PathType Leaf)) {
    Write-Utf8NoBom -Path $TargetPath -Content (($sourceLines -join "`r`n") + "`r`n")
    return 'created'
  }

  $targetLines = Get-Content $TargetPath
  $existingKeys = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($line in $targetLines) {
    if ($line -match '^\s*([A-Za-z0-9_]+)\s*=') {
      [void]$existingKeys.Add($Matches[1])
    }
  }

  $missingLines = New-Object 'System.Collections.Generic.List[string]'
  foreach ($line in $sourceLines) {
    if ($line -match '^\s*([A-Za-z0-9_]+)\s*=') {
      if (-not $existingKeys.Contains($Matches[1])) {
        [void]$missingLines.Add($line)
      }
    }
  }

  if ($missingLines.Count -eq 0) {
    return 'unchanged'
  }

  $combined = @($targetLines)
  if ($combined.Count -gt 0 -and $combined[-1] -ne '') {
    $combined += ''
  }
  $combined += '# OpenClaw Command Center'
  $combined += $missingLines
  Write-Utf8NoBom -Path $TargetPath -Content (($combined -join "`r`n") + "`r`n")
  return 'updated'
}

$OpenClawRoot = Resolve-RequiredDirectory -Path $OpenClawRoot -Label 'OpenClaw root'
$dataDir = Resolve-RequiredDirectory -Path (Join-Path $OpenClawRoot 'data') -Label 'OpenClaw data directory'
$configFile = Join-Path $dataDir 'openclaw.json'
if (-not (Test-Path $configFile -PathType Leaf)) {
  Fail "OpenClaw config not found: $configFile"
}

$composeCandidates = @(
  (Join-Path $OpenClawRoot 'docker-compose.yml'),
  (Join-Path $OpenClawRoot 'docker-compose.yaml'),
  (Join-Path $OpenClawRoot 'compose.yml'),
  (Join-Path $OpenClawRoot 'compose.yaml')
)
$composeFile = Resolve-OptionalFile -Candidates $composeCandidates
if (-not $composeFile) {
  Fail 'No compose file found in the OpenClaw root. Expected docker-compose.yml, docker-compose.yaml, compose.yml, or compose.yaml.'
}

Resolve-RequiredDirectory -Path $ShellDir -Label 'shell directory' | Out-Null
Resolve-RequiredDirectory -Path $IconsDir -Label 'icons directory' | Out-Null
Resolve-RequiredDirectory -Path $SourceScriptsDir -Label 'scripts directory' | Out-Null
foreach ($scriptFile in $RequiredScriptFiles) {
  $sourcePath = Join-Path $SourceScriptsDir $scriptFile
  if (-not (Test-Path $sourcePath -PathType Leaf)) {
    Fail "Required helper script not found: $sourcePath"
  }
}

Get-Command docker -ErrorAction Stop | Out-Null

$Container = Get-OpenClawContainer -RequestedContainer $Container
$OpenClawVersion = Get-OpenClawVersion -Name $Container
Write-Info "OpenClaw version: $OpenClawVersion"

$TargetUiDir = Join-Path $OpenClawRoot 'custom-ui'
$TargetAssetsDir = Join-Path $TargetUiDir 'assets'
$TargetMissionAssetsDir = Join-Path $TargetUiDir 'mission-control-assets'
$TargetScriptsDir = Join-Path $OpenClawRoot 'scripts'
$PatchFile = Join-Path $OpenClawRoot 'openclaw.command-center.patch.json'
$OverrideFile = Join-Path $OpenClawRoot 'docker-compose.command-center.override.yml'
$TargetEnvExample = Join-Path $OpenClawRoot '.env.example'
$SourceEnvExample = Join-Path $PackageRoot '.env.example'

if (Test-Path $TargetUiDir) {
  if (-not $Force) {
    Fail "Target UI directory already exists: $TargetUiDir . Use -Force to replace it."
  }
  if ($DryRun) {
    Write-Info "Would remove existing UI directory: $TargetUiDir"
  } else {
    Remove-Item -Recurse -Force $TargetUiDir
    Write-Ok "Removed existing UI directory: $TargetUiDir"
  }
}

if ($DryRun) {
  Write-Info "Would create UI directory: $TargetUiDir"
  Write-Info "Would create scripts directory: $TargetScriptsDir"
} else {
  New-Item -ItemType Directory -Force -Path $TargetUiDir | Out-Null
  New-Item -ItemType Directory -Force -Path $TargetScriptsDir | Out-Null
}

if ($DryRun) {
  Write-Info "Would extract ${Container}:$ControlUiPath into $TargetUiDir"
  $DetectedAssets = @{
    '{{OPENCLAW_INDEX_JS}}' = 'index-<detected>.js'
    '{{OPENCLAW_LIT_JS}}' = 'lit-<detected>.js'
    '{{OPENCLAW_FORMAT_JS}}' = 'format-<detected>.js'
    '{{OPENCLAW_INDEX_CSS}}' = 'index-<detected>.css'
  }
} else {
  Write-Info 'Extracting upstream control UI from the running container...'
  & docker cp "${Container}:${ControlUiPath}/." "$TargetUiDir/"
  if ($LASTEXITCODE -ne 0) {
    Fail "docker cp failed while extracting the control UI from container '$Container'"
  }
  Write-Ok "Copied upstream control UI to $TargetUiDir"

  if (-not (Test-Path $TargetAssetsDir -PathType Container)) {
    Fail "Extracted UI is missing assets directory: $TargetAssetsDir"
  }

  $DetectedAssets = @{
    '{{OPENCLAW_INDEX_JS}}' = Get-RequiredAsset -AssetsDir $TargetAssetsDir -Pattern 'index-*.js' -Label 'index JS'
    '{{OPENCLAW_LIT_JS}}' = Get-RequiredAsset -AssetsDir $TargetAssetsDir -Pattern 'lit-*.js' -Label 'Lit runtime JS'
    '{{OPENCLAW_FORMAT_JS}}' = Get-RequiredAsset -AssetsDir $TargetAssetsDir -Pattern 'format-*.js' -Label 'format runtime JS'
    '{{OPENCLAW_INDEX_CSS}}' = Get-RequiredAsset -AssetsDir $TargetAssetsDir -Pattern 'index-*.css' -Label 'index CSS'
  }

  foreach ($entry in $DetectedAssets.GetEnumerator()) {
    Write-Ok ("Detected {0} -> {1}" -f $entry.Key, $entry.Value)
  }
}

$IndexHtml = Render-Template -TemplatePath (Join-Path $ShellDir 'index.html') -Replacements $DetectedAssets
$OverviewHtml = Render-Template -TemplatePath (Join-Path $ShellDir 'mission-control-overview.html') -Replacements @{
  '{{OPENCLAW_INDEX_JS}}' = $DetectedAssets['{{OPENCLAW_INDEX_JS}}']
}
$PatchJson = (@{
    gateway = @{
      controlUi = @{
        root = '/custom-ui'
      }
    }
  } | ConvertTo-Json -Depth 8)

if ($DryRun) {
  Write-Info "Would render index.html into $TargetUiDir"
  Write-Info "Would render mission-control-overview.html into $TargetUiDir"
  Write-Info "Would copy overlay assets into $TargetAssetsDir"
  Write-Info "Would copy mission-control-assets into $TargetMissionAssetsDir"
  Write-Info "Would copy helper scripts into $TargetScriptsDir"
  Write-Info "Would write patch file: $PatchFile"
} else {
  Write-Utf8NoBom -Path (Join-Path $TargetUiDir 'index.html') -Content $IndexHtml
  Write-Utf8NoBom -Path (Join-Path $TargetUiDir 'mission-control-overview.html') -Content $OverviewHtml
  Copy-Item -Force (Join-Path $ShellDir 'mission-control.html') $TargetUiDir

  foreach ($assetFile in @(
    'mission-control-shell.js',
    'mission-control-shell.css',
    'theme-switcher.js',
    'theme-switcher.css',
    'theme-shanshui.css',
    'theme-taohua.css',
    'theme-qingci.css',
    'mission-control-overview.css',
    'mission-control-overview.js',
    'mission-control-preview.css'
  )) {
    Copy-Item -Force (Join-Path $ShellDir $assetFile) $TargetAssetsDir
  }

  if (Test-Path $TargetMissionAssetsDir) {
    Remove-Item -Recurse -Force $TargetMissionAssetsDir
  }
  Copy-Item -Recurse -Force (Join-Path $ShellDir 'mission-control-assets') $TargetMissionAssetsDir

  foreach ($iconFile in @('favicon.svg', 'favicon-32.png', 'favicon.ico', 'apple-touch-icon.png')) {
    $iconPath = Join-Path $IconsDir $iconFile
    if (Test-Path $iconPath -PathType Leaf) {
      Copy-Item -Force $iconPath $TargetUiDir
    }
  }

  foreach ($scriptFile in $RequiredScriptFiles) {
    Copy-Item -Force (Join-Path $SourceScriptsDir $scriptFile) $TargetScriptsDir
  }

  Write-Utf8NoBom -Path $PatchFile -Content ($PatchJson + "`r`n")
  Write-Ok 'Rendered command center UI and copied helper scripts'
}

if ($WriteDockerOverride) {
  $serviceFallback = if (-not [string]::IsNullOrWhiteSpace($Container)) { $Container } else { 'openclaw' }
  $serviceName = Get-ComposeServiceName -ComposeFile $composeFile -Fallback $serviceFallback
  $OverrideYaml = @"
services:
  ${serviceName}:
    volumes:
      - ./custom-ui:/custom-ui
"@

  if ($DryRun) {
    Write-Info "Would write Docker override: $OverrideFile"
  } else {
    Write-Utf8NoBom -Path $OverrideFile -Content $OverrideYaml
    Write-Ok "Wrote Docker override: $OverrideFile"
  }
}

if ($WriteEnvExample) {
  if ($DryRun) {
    Write-Info "Would update env example: $TargetEnvExample"
  } else {
    $envResult = Update-EnvExample -SourcePath $SourceEnvExample -TargetPath $TargetEnvExample
    Write-Ok ".env.example ${envResult}: $TargetEnvExample"
  }
}

if ($EnableAutostart) {
  $AutostartScript = Join-Path $TargetScriptsDir 'install-command-center-helper-autostart.ps1'
  if ($DryRun) {
    Write-Info "Would register helper autostart using $AutostartScript"
  } else {
    try {
      & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $AutostartScript -StartNow
      if ($LASTEXITCODE -ne 0) {
        Fail "Autostart script exited with code $LASTEXITCODE"
      }
      Write-Ok 'Registered helper autostart and started the helper'
    } catch {
      Write-WarnLine ("Autostart registration failed: " + $_.Exception.Message)
    }
  }
}

Write-Host ''
Write-Host 'OpenClaw Command Center install summary' -ForegroundColor Green
Write-Host ("  OpenClaw root: {0}" -f $OpenClawRoot)
Write-Host ("  Compose file:   {0}" -f $composeFile)
Write-Host ("  Container:      {0}" -f $Container)
Write-Host ("  Version:        {0}" -f $OpenClawVersion)
Write-Host ("  UI target:      {0}" -f $TargetUiDir)
Write-Host ("  Scripts target: {0}" -f $TargetScriptsDir)
Write-Host ("  Patch file:     {0}" -f $PatchFile)
if ($WriteDockerOverride) {
  Write-Host ("  Override file:  {0}" -f $OverrideFile)
}
if ($WriteEnvExample) {
  Write-Host ("  Env example:    {0}" -f $TargetEnvExample)
}
Write-Host ''
if ($DryRun) {
  Write-Host 'Dry run only. No files were written.' -ForegroundColor Yellow
} else {
  Write-Host 'Next steps:' -ForegroundColor Cyan
  Write-Host '  1. Merge openclaw.command-center.patch.json into data/openclaw.json.'
  Write-Host '  2. If you wrote docker-compose.command-center.override.yml, merge or include it in your compose stack.'
  Write-Host '  3. Restart the OpenClaw deployment.'
  if (-not $EnableAutostart) {
    Write-Host '  4. Start the helper with scripts\ensure-command-center-helper.ps1 if you want host diagnostics.'
  }
}