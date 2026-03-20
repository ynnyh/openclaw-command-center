param(
  [string]$TaskName = 'OpenClaw Command Center Helper',
  [switch]$StartNow
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$ensureScript = Join-Path $root 'scripts\ensure-command-center-helper.ps1'

if (-not (Test-Path $ensureScript)) {
  throw "Ensure script not found: $ensureScript"
}

$powershell = (Get-Command powershell.exe -ErrorAction Stop).Source
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$argument = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $ensureScript + '" -Quiet'

$action = New-ScheduledTaskAction -Execute $powershell -Argument $argument
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $currentUser
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 0)
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "Registered scheduled task: $TaskName" -ForegroundColor Cyan

if ($StartNow) {
  & $ensureScript
}
