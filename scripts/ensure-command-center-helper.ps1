param(
  [switch]$Quiet,
  [int]$StartupWaitSeconds = 5
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$helperScript = Join-Path $root 'scripts\command-center-helper.mjs'
$envFile = Join-Path $root '.env'

function Get-EnvFileValues {
  param([string]$Path)
  $values = @{}
  if (-not (Test-Path $Path)) {
    return $values
  }
  foreach ($line in Get-Content $Path) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#') -or -not $line.Contains('=')) {
      continue
    }
    $pair = $line -split '=', 2
    $key = $pair[0].Trim()
    if (-not $key) {
      continue
    }
    $value = if ($pair.Length -gt 1) { $pair[1].Trim().Trim('"').Trim("'") } else { '' }
    $values[$key] = $value
  }
  return $values
}

function Get-SettingValue {
  param(
    [hashtable]$Values,
    [string]$Name,
    [string]$Fallback
  )
  $current = [Environment]::GetEnvironmentVariable($Name)
  if (-not [string]::IsNullOrWhiteSpace($current)) {
    return $current.Trim()
  }
  if ($Values.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace($Values[$Name])) {
    return [string]$Values[$Name]
  }
  return $Fallback
}

$envValues = Get-EnvFileValues -Path $envFile
$helperHost = Get-SettingValue -Values $envValues -Name 'COMMAND_CENTER_HELPER_HOST' -Fallback '127.0.0.1'
$helperPort = Get-SettingValue -Values $envValues -Name 'COMMAND_CENTER_HELPER_PORT' -Fallback '3211'
$configuredOutputDir = Get-SettingValue -Values $envValues -Name 'COMMAND_CENTER_OUTPUT_DIR' -Fallback ''
$outputRoot = if ([string]::IsNullOrWhiteSpace($configuredOutputDir)) {
  Join-Path $root 'output\command-center'
} elseif ([System.IO.Path]::IsPathRooted($configuredOutputDir)) {
  $configuredOutputDir
} else {
  Join-Path $root $configuredOutputDir
}
$stdoutLog = Join-Path $outputRoot 'helper-stdout.log'
$stderrLog = Join-Path $outputRoot 'helper-stderr.log'

function Write-Info($message, $color = 'Cyan') {
  if (-not $Quiet) {
    Write-Host $message -ForegroundColor $color
  }
}

function Test-CommandCenterHelper {
  try {
    $response = Invoke-RestMethod -Uri ("http://{0}:{1}/health" -f $helperHost, $helperPort) -Method Get -TimeoutSec 2
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
      Write-Info ("Command center helper online at http://{0}:{1}" -f $helperHost, $helperPort)
      return
    }
  } while ((Get-Date) -lt $deadline)

  throw "Command center helper did not pass the health check after startup. Check logs: $stdoutLog / $stderrLog"
}

Start-CommandCenterHelper
