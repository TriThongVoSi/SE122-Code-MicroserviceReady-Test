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

function Assert-FileContains {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string]$Needle,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $content = Get-Content -LiteralPath $FilePath -Raw
    if (-not $content.Contains($Needle)) {
        throw $Message
    }
}

function Assert-FileNotContains {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string]$Needle,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $content = Get-Content -LiteralPath $FilePath -Raw
    if ($content.Contains($Needle)) {
        throw $Message
    }
}

function Assert-NoMatches {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Pattern,
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $matches = rg --line-number --no-heading $Pattern $Path 2>$null
    if ($LASTEXITCODE -eq 0) {
        throw "$Message`n$matches"
    }
    if ($LASTEXITCODE -ne 1) {
        throw "rg failed while checking path '$Path' with pattern '$Pattern'"
    }
}

$frontendDir = Join-Path $repoRoot "agricultural-crop-management-frontend"
$backendDir = Join-Path $repoRoot "agricultural-crop-management-backend"

$frontendRoutesFile = Join-Path $frontendDir "src\app\routes.tsx"
$frontendMarketplaceClientFile = Join-Path $frontendDir "src\shared\api\marketplace\client.ts"
$frontendMarketplaceContractsFile = Join-Path $frontendDir "src\shared\api\marketplace\contracts.ts"
$frontendMarketplaceRealAdapterFile = Join-Path $frontendDir "src\shared\api\marketplace\real-adapter.ts"
$frontendSignInHookFile = Join-Path $frontendDir "src\pages\shared\hooks\useSignInPage.ts"
$frontendAdminPortalConstantsFile = Join-Path $frontendDir "src\features\admin\portal\constants.ts"
$frontendAdminPortalContentFile = Join-Path $frontendDir "src\features\admin\portal\components\AdminPortalContent.tsx"
$frontendFarmerPortalConstantsFile = Join-Path $frontendDir "src\features\farmer\portal\constants.ts"
$frontendProdEnvFile = Join-Path $frontendDir ".env.production"

$frontendMarketplaceFeatureDir = Join-Path $frontendDir "src\features\marketplace"
$frontendMarketplaceApiDir = Join-Path $frontendDir "src\shared\api\marketplace"
$backendMarketplaceDir = Join-Path $backendDir "src\main\java\org\example\QuanLyMuaVu\module\marketplace"
$backendSecurityConfigFile = Join-Path $backendDir "src\main\java\org\example\QuanLyMuaVu\module\shared\config\SecurityConfig.java"
$backendApiResponseFile = Join-Path $backendDir "src\main\java\org\example\QuanLyMuaVu\DTO\Common\ApiResponse.java"

Write-Host "[Marketplace Gate] Static release-safety checks"
Assert-FileContains `
    -FilePath $frontendMarketplaceClientFile `
    -Needle "if (import.meta.env.PROD) {" `
    -Message "Marketplace client must explicitly force real adapter path in production."
Assert-FileContains `
    -FilePath $frontendMarketplaceClientFile `
    -Needle "return false;" `
    -Message "Marketplace client must default to real adapter when no mock override is set."
Assert-FileNotContains `
    -FilePath $frontendProdEnvFile `
    -Needle "VITE_MARKETPLACE_USE_MOCK=true" `
    -Message "Production env must not enable marketplace mock path."
Assert-FileContains `
    -FilePath $frontendMarketplaceContractsFile `
    -Needle 'export const MARKETPLACE_API_PREFIX = "/api/v1/marketplace";' `
    -Message "Marketplace API prefix must stay /api/v1/marketplace."
Assert-FileContains `
    -FilePath $frontendMarketplaceContractsFile `
    -Needle "code: z.string()" `
    -Message "Marketplace response envelope must include `code`."
Assert-FileContains `
    -FilePath $frontendMarketplaceContractsFile `
    -Needle "message: z.string()" `
    -Message "Marketplace response envelope must include `message`."
Assert-FileContains `
    -FilePath $frontendMarketplaceContractsFile `
    -Needle "result: z.unknown()" `
    -Message "Marketplace response envelope must include `result`."
Assert-FileContains `
    -FilePath $frontendMarketplaceRealAdapterFile `
    -Needle '${MARKETPLACE_API_PREFIX}/farmer/' `
    -Message "Marketplace real adapter must use /api/v1/marketplace/farmer/* endpoints."
Assert-FileContains `
    -FilePath $frontendMarketplaceRealAdapterFile `
    -Needle '${MARKETPLACE_API_PREFIX}/admin/' `
    -Message "Marketplace real adapter must use /api/v1/marketplace/admin/* endpoints."
Assert-FileContains `
    -FilePath $frontendSignInHookFile `
    -Needle "marketplaceApi.mergeCart" `
    -Message "Login flow must merge guest cart to server cart."
Assert-FileContains `
    -FilePath $frontendSignInHookFile `
    -Needle "clearGuestCartItems();" `
    -Message "Guest cart must be cleared after successful merge."
Assert-FileContains `
    -FilePath $backendApiResponseFile `
    -Needle "private String code;" `
    -Message "Backend API response wrapper must include `code`."
Assert-FileContains `
    -FilePath $backendApiResponseFile `
    -Needle "private String message;" `
    -Message "Backend API response wrapper must include `message`."
Assert-FileContains `
    -FilePath $backendApiResponseFile `
    -Needle "private T result;" `
    -Message "Backend API response wrapper must include `result`."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '.requestMatchers("/api/v1/marketplace/farmer/**").hasRole("FARMER")' `
    -Message "Security config must protect /api/v1/marketplace/farmer/** by FARMER role."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '.requestMatchers("/api/v1/marketplace/admin/**").hasRole("ADMIN")' `
    -Message "Security config must protect /api/v1/marketplace/admin/** by ADMIN role."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '/api/v1/marketplace/cart/**' `
    -Message "Security config must include marketplace cart matcher."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '/api/v1/marketplace/orders/**' `
    -Message "Security config must include marketplace orders matcher."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '/api/v1/marketplace/addresses/**' `
    -Message "Security config must include marketplace addresses matcher."
Assert-FileContains `
    -FilePath $backendSecurityConfigFile `
    -Needle '/api/v1/marketplace/reviews/**' `
    -Message "Security config must include marketplace reviews matcher."

Assert-NoMatches `
    -Pattern "/api/v1/buyer/" `
    -Path $frontendMarketplaceFeatureDir `
    -Message "Buyer namespace residue found in frontend marketplace feature scope."
Assert-NoMatches `
    -Pattern "/api/v1/buyer/" `
    -Path $frontendMarketplaceApiDir `
    -Message "Buyer namespace residue found in frontend marketplace API scope."
Assert-NoMatches `
    -Pattern "/api/v1/buyer/" `
    -Path $backendMarketplaceDir `
    -Message "Buyer namespace residue found in backend marketplace module."
Assert-NoMatches `
    -Pattern 'requiredRole="buyer"' `
    -Path $frontendMarketplaceFeatureDir `
    -Message "Marketplace UI must not depend on buyer role guard."
Assert-NoMatches `
    -Pattern "/api/v1/(farmer|admin)/marketplace/" `
    -Path $frontendMarketplaceApiDir `
    -Message "Frontend marketplace API must use /api/v1/marketplace/(farmer|admin) namespace."
Assert-NoMatches `
    -Pattern '/api/v1/marketplace/buyer/' `
    -Path $backendMarketplaceDir `
    -Message "Marketplace backend module must not introduce /api/v1/marketplace/buyer/* namespace."
Assert-NoMatches `
    -Pattern 'requiredRole="buyer"' `
    -Path $frontendRoutesFile `
    -Message "App routes must not depend on buyer role guard for marketplace."

# Regression touchpoints for non-marketplace modules that must remain wired.
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="/marketplace"' `
    -Message "Marketplace route group must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="cart"' `
    -Message "Marketplace cart route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="checkout"' `
    -Message "Marketplace checkout route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="orders/:id"' `
    -Message "Marketplace order detail route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle '<ProtectedRoute requireAuth>' `
    -Message "Marketplace buyer routes must keep auth-only guard."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="marketplace-dashboard"' `
    -Message "Farmer marketplace dashboard route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="marketplace-products"' `
    -Message "Farmer marketplace products route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle 'path="marketplace-orders"' `
    -Message "Farmer marketplace orders route must remain wired."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle "AiAssistantPage" `
    -Message "AI assistant route touchpoint is missing from app routes."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle "SeasonReportsWorkspace" `
    -Message "Season reports workspace touchpoint is missing from app routes."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle "SeasonNutrientInputsWorkspace" `
    -Message "FDN nutrient-input touchpoint is missing from app routes."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle "SeasonIrrigationWaterAnalysesWorkspace" `
    -Message "FDN irrigation-water touchpoint is missing from app routes."
Assert-FileContains `
    -FilePath $frontendRoutesFile `
    -Needle "SeasonSoilTestsWorkspace" `
    -Message "FDN soil-test touchpoint is missing from app routes."
Assert-FileContains `
    -FilePath $frontendFarmerPortalConstantsFile `
    -Needle "'marketplace-dashboard'" `
    -Message "Farmer portal navigation must expose marketplace dashboard."
Assert-FileContains `
    -FilePath $frontendFarmerPortalConstantsFile `
    -Needle "'marketplace-products'" `
    -Message "Farmer portal navigation must expose marketplace products."
Assert-FileContains `
    -FilePath $frontendFarmerPortalConstantsFile `
    -Needle "'marketplace-orders'" `
    -Message "Farmer portal navigation must expose marketplace orders."
Assert-FileContains `
    -FilePath $frontendAdminPortalConstantsFile `
    -Needle '"marketplace-dashboard"' `
    -Message "Admin portal navigation must expose marketplace dashboard."
Assert-FileContains `
    -FilePath $frontendAdminPortalConstantsFile `
    -Needle '"marketplace-products"' `
    -Message "Admin portal navigation must expose marketplace products."
Assert-FileContains `
    -FilePath $frontendAdminPortalConstantsFile `
    -Needle '"marketplace-orders"' `
    -Message "Admin portal navigation must expose marketplace orders."
Assert-FileContains `
    -FilePath $frontendAdminPortalContentFile `
    -Needle "AdminMarketplaceDashboardPage" `
    -Message "Admin portal content must wire marketplace dashboard page."
Assert-FileContains `
    -FilePath $frontendAdminPortalContentFile `
    -Needle "AdminMarketplaceProductsPage" `
    -Message "Admin portal content must wire marketplace products page."
Assert-FileContains `
    -FilePath $frontendAdminPortalContentFile `
    -Needle "AdminMarketplaceOrdersPage" `
    -Message "Admin portal content must wire marketplace orders page."

Invoke-Step -Name "[Marketplace Gate] Backend compile" `
    -WorkingDirectory $backendDir `
    -Executable "mvn" `
    -Arguments @("-q", "-DskipTests", "compile")

Invoke-Step -Name "[Marketplace Gate] Backend marketplace targeted tests" `
    -WorkingDirectory $backendDir `
    -Executable "mvn" `
    -Arguments @("-q", "-Dtest=MarketplaceServiceTest", "test")

Invoke-Step -Name "[Marketplace Gate] Frontend build" `
    -WorkingDirectory $frontendDir `
    -Executable "npm" `
    -Arguments @("run", "build")

Invoke-Step -Name "[Marketplace Gate] Frontend FDN regression suite" `
    -WorkingDirectory $frontendDir `
    -Executable "npm" `
    -Arguments @("run", "test:fdn")

Write-Host "[Marketplace Gate] Completed"
