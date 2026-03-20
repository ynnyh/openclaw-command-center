param(
  [switch]$Quiet,
  [int]$StartupWaitSeconds = 5
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$helperScript = Join-Path $root 'scripts\command-center-helper.mjs'
$outputRoot = Join-Path $root 'output\command-center'
$stdoutLog = Join-Path $outputRoot 'helper-stdout.log'
$stderrLog = Join-Path $outputRoot 'helper-stderr.log'

function Write-Info($message, $color = 'Cyan') {
  if (-not $Quiet) {
    Write-Host $message -ForegroundColor $color
  }
}

function Test-CommandCenterHelper {
  try {
    $response = Invoke-RestMethod -Uri 'http://127.0.0.1:3211/health' -Method Get -TimeoutSec 2
    return $response.ok -eq $true
  } catch {
    return $false
  }
}

function Start-CommandCenterHelper {
  if (Test-CommandCenterHelper) {
    Write-Info 'Command center helper already running.' 'DarkCyan'
    return
  }

  if (-not (Test-Path $helperScript)) {
    throw "Helper script not found: $helperScript"
  }

  New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

  $node = (Get-Command node -ErrorAction Stop).Source
  Start-Process -FilePath $node -ArgumentList @($helperScript) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog | Out-Null

  $deadline = (Get-Date).AddSeconds([Math]::Max(1, $StartupWaitSeconds))
  do {
    Start-Sleep -Milliseconds 500
    if (Test-CommandCenterHelper) {
      Write-Info 'Command center helper online at http://127.0.0.1:3211'
      return
    }
  } while ((Get-Date) -lt $deadline)

  throw "Command center helper did not pass the health check after startup. Check logs: $stdoutLog / $stderrLog"
}

Start-CommandCenterHelper
