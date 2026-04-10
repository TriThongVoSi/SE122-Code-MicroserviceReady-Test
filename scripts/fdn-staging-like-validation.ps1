$ErrorActionPreference = "Stop"

$backendDir = Resolve-Path "agricultural-crop-management-backend"
$runId = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $backendDir ("staging-like-validation-" + $runId + ".log")
$errFile = Join-Path $backendDir ("staging-like-validation-" + $runId + ".err.log")
$summaryFile = Join-Path $backendDir "staging-like-validation-summary.txt"
if (Test-Path $summaryFile) { Remove-Item $summaryFile -Force }

function Write-Summary([string]$line) {
  Add-Content -Path $summaryFile -Value $line
  Write-Output $line
}

function Stop-BackendProcesses([System.Diagnostics.Process]$parentProc) {
  if ($parentProc -and -not $parentProc.HasExited) {
    Stop-Process -Id $parentProc.Id -Force -ErrorAction SilentlyContinue
  }

  $javaChildren = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq "java.exe" -and $_.CommandLine -match "QuanLyMuaVuApplication|agricultural-crop-management-backend"
  }
  foreach ($child in $javaChildren) {
    Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

$proc = Start-Process -FilePath "mvn.cmd" -ArgumentList @("-q", "-DskipTests", "spring-boot:run") -WorkingDirectory $backendDir -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru

try {
  $ready = $false
  for ($i = 0; $i -lt 90; $i++) {
    Start-Sleep -Seconds 2
    if ($proc.HasExited) { break }
    $conn = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) { $ready = $true; break }
  }

  if (-not $ready) {
    if ($proc.HasExited) { Write-Summary "BACKEND_EXITED_EARLY" } else { Write-Summary "BACKEND_NOT_READY" }
    Write-Summary "--- LAST LOG LINES ---"
    Get-Content $logFile -Tail 120
    Write-Summary "--- LAST ERROR LOG LINES ---"
    if (Test-Path $errFile) { Get-Content $errFile -Tail 120 }
    exit 1
  }

  $base = "http://localhost:8080/api/v1"

  function Try-SignIn([string]$identifier, [string]$password) {
    $payload = @{ identifier = $identifier; password = $password; rememberMe = $false } | ConvertTo-Json
    try {
      $resp = Invoke-RestMethod -Uri "$base/auth/sign-in" -Method Post -ContentType "application/json" -Body $payload
      if ($resp.result.token) { return $resp }
    } catch {
      return $null
    }
    return $null
  }

  $auth = $null
  $candidates = @(
    @{ id = "farmer"; pass = "Farmer@123" },
    @{ id = "farmer"; pass = "12345678" },
    @{ id = "farmer@acm.local"; pass = "Farmer@123" },
    @{ id = "farmer@acm.local"; pass = "12345678" }
  )

  foreach ($c in $candidates) {
    $auth = Try-SignIn -identifier $c.id -password $c.pass
    if ($auth -ne $null) {
      Write-Summary ("AUTH_OK identifier=" + $c.id)
      break
    }
  }

  if ($auth -eq $null) {
    Write-Summary "AUTH_FAILED_ALL_CANDIDATES"
    exit 1
  }

  $token = $auth.result.token
  $headers = @{ Authorization = "Bearer $token" }

  $overview1 = Invoke-RestMethod -Uri "$base/dashboard/sustainability/overview?scope=field&seasonId=1" -Headers $headers -Method Get
  $overview2 = Invoke-RestMethod -Uri "$base/dashboard/sustainability/overview?scope=field&seasonId=2" -Headers $headers -Method Get

  $legacyPayload1 = @{
    plotId = 1
    inputSource = "IRRIGATION_WATER"
    value = 1.25
    unit = "kg_n"
    recordedAt = "2026-03-01"
    sourceType = "user_entered"
  } | ConvertTo-Json

  $legacyPayload2 = @{
    plotId = 1
    inputSource = "SOIL_LEGACY"
    value = 0.75
    unit = "kg_n"
    recordedAt = "2026-03-01"
    sourceType = "user_entered"
  } | ConvertTo-Json

  $legacyErr1 = $null
  try {
    Invoke-RestMethod -Uri "$base/seasons/1/nutrient-inputs" -Method Post -Headers $headers -ContentType "application/json" -Body $legacyPayload1 | Out-Null
    $legacyErr1 = "UNEXPECTED_SUCCESS"
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $legacyErr1 = $reader.ReadToEnd()
    } else {
      $legacyErr1 = $_.Exception.Message
    }
  }

  $legacyErr2 = $null
  try {
    Invoke-RestMethod -Uri "$base/seasons/1/nutrient-inputs" -Method Post -Headers $headers -ContentType "application/json" -Body $legacyPayload2 | Out-Null
    $legacyErr2 = "UNEXPECTED_SUCCESS"
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $legacyErr2 = $reader.ReadToEnd()
    } else {
      $legacyErr2 = $_.Exception.Message
    }
  }

  $iwaList = Invoke-RestMethod -Uri "$base/seasons/2/irrigation-water-analyses" -Headers $headers -Method Get
  $soilList = Invoke-RestMethod -Uri "$base/seasons/2/soil-tests" -Headers $headers -Method Get

  $o1 = $overview1.result
  $o2 = $overview2.result

  Write-Summary "=== OVERVIEW_RAW_SEASON_1 ==="
  Write-Summary ($overview1 | ConvertTo-Json -Depth 20 -Compress)
  Write-Summary "=== OVERVIEW_RAW_SEASON_2 ==="
  Write-Summary ($overview2 | ConvertTo-Json -Depth 20 -Compress)

  Write-Summary "=== OVERVIEW_SEASON_1 ==="
  Write-Summary ("fdnTotal=" + $o1.fdn.total + "; fdnMineral=" + $o1.fdn.mineral + "; fdnOrganic=" + $o1.fdn.organic + "; nue=" + $o1.nue + "; irrN=" + $o1.inputsBreakdown.irrigationWaterN + "; soilN=" + $o1.inputsBreakdown.soilLegacyN + "; confidence=" + $o1.confidence + "; missingInputs=" + ($o1.missingInputs -join ',') + "; recommendationSource=" + $o1.recommendationSource)

  Write-Summary "=== OVERVIEW_SEASON_2 ==="
  Write-Summary ("fdnTotal=" + $o2.fdn.total + "; fdnMineral=" + $o2.fdn.mineral + "; fdnOrganic=" + $o2.fdn.organic + "; nue=" + $o2.nue + "; irrN=" + $o2.inputsBreakdown.irrigationWaterN + "; soilN=" + $o2.inputsBreakdown.soilLegacyN + "; confidence=" + $o2.confidence + "; missingInputs=" + ($o2.missingInputs -join ',') + "; recommendationSource=" + $o2.recommendationSource)

  Write-Summary "=== LEGACY_CREATE_RESPONSE_IRRIGATION ==="
  Write-Summary $legacyErr1
  Write-Summary "=== LEGACY_CREATE_RESPONSE_SOIL ==="
  Write-Summary $legacyErr2

  Write-Summary "=== DEDICATED_LIST_COUNTS_SEASON_2 ==="
  Write-Summary ("irrigationCount=" + $iwaList.result.Count + "; soilCount=" + $soilList.result.Count)
}
finally {
  Stop-BackendProcesses -parentProc $proc
}
