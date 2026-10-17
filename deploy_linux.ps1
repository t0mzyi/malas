$ErrorActionPreference = "Stop"

$deployDir = "c:\Users\jaide\Desktop\melleson\deploy"
$adminStaging = "$deployDir\admin_linux_dist"
$landingStaging = "$deployDir\landing_linux_dist"

Write-Host "Cleaning up old deploy directories..."
if (Test-Path $adminStaging) { Remove-Item -Recurse -Force $adminStaging }
if (Test-Path $landingStaging) { Remove-Item -Recurse -Force $landingStaging }
if (Test-Path "$deployDir\admin_production.zip") { Remove-Item -Force "$deployDir\admin_production.zip" }
if (Test-Path "$deployDir\landing_production.zip") { Remove-Item -Force "$deployDir\landing_production.zip" }

New-Item -ItemType Directory -Force -Path $adminStaging | Out-Null
New-Item -ItemType Directory -Force -Path $landingStaging | Out-Null

Write-Host "Copying Admin files..."
# Copy specific admin files (ignoring the node.js backend)
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\api" -Destination $adminStaging -Recurse
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\.htaccess" -Destination $adminStaging
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\index.html" -Destination $adminStaging
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\app.js" -Destination $adminStaging
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\styles.css" -Destination $adminStaging
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\favicon.ico" -Destination $adminStaging
Copy-Item "c:\Users\jaide\Desktop\melleson\admin\logo.png" -Destination $adminStaging

Write-Host "Copying Landing Page files..."
Copy-Item "c:\Users\jaide\Desktop\melleson\landing page\dist\*" -Destination $landingStaging -Recurse

Write-Host "Creating Linux-compatible zip archives using tar.exe..."
# tar.exe natively uses forward slashes internally, making the zip safe for Linux cPanel/DirectAdmin extractors
Set-Location $adminStaging
& tar.exe -a -c -f "..\admin_production.zip" *

Set-Location $landingStaging
& tar.exe -a -c -f "..\landing_production.zip" *

Write-Host "Done! Production zips created in deploy folder:"
Write-Host "- deploy\admin_production.zip"
Write-Host "- deploy\landing_production.zip"

# Clean up staging
Set-Location $deployDir
Remove-Item -Recurse -Force $adminStaging
Remove-Item -Recurse -Force $landingStaging
