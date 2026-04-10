$ErrorActionPreference = "Stop"
$resolvedRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$rootItem = Get-Item -LiteralPath $resolvedRoot
$repoRoot = if ($rootItem.Target -and $rootItem.Target.Count -gt 0) {
    $rootItem.Target[0]
} else {
    $rootItem.FullName
}

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory = $true)]
        [string]$Executable,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $resolvedExecutable = switch ($Executable.ToLowerInvariant()) {
        "npm" { "npm.cmd" }
        "mvn" { "mvn.cmd" }
        default { $Executable }
    }

    Write-Host $Name
    Push-Location $WorkingDirectory
    try {
        & $resolvedExecutable @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Step failed with exit code ${LASTEXITCODE}: $resolvedExecutable $($Arguments -join ' ')"
        }
    } finally {
        Pop-Location
    }
}

$frontendDir = Join-Path $repoRoot "agricultural-crop-management-frontend"
$backendDir = Join-Path $repoRoot "agricultural-crop-management-backend"
$backendTargetedTests = "-Dtest=NutrientInputControllerTest,IrrigationWaterAnalysisControllerTest,SoilTestControllerTest,SustainabilityControllerTest,NutrientInputIngestionServiceTest,LegacyNutrientInputBackfillServiceTest,LegacyNutrientBackfillRunnerTest,IrrigationWaterAnalysisServiceTest,SoilTestServiceTest,SustainabilityCalculationServiceTest,SustainabilityDashboardServiceTest"

Invoke-Step -Name "[FDN Gate] Frontend build + targeted tests" `
    -WorkingDirectory $frontendDir `
    -Executable "npm" `
    -Arguments @("run", "ci:fdn:frontend")

Invoke-Step -Name "[FDN Gate] Backend compile + targeted tests" `
    -WorkingDirectory $backendDir `
    -Executable "mvn" `
    -Arguments @("-q", "-DskipTests", "compile")

Invoke-Step -Name "[FDN Gate] Backend targeted test suite" `
    -WorkingDirectory $backendDir `
    -Executable "mvn" `
    -Arguments @("-q", $backendTargetedTests, "test")

Write-Host "[FDN Gate] Completed"
