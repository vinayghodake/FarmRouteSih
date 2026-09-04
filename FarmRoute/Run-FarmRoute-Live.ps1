$root = $PSScriptRoot
$python = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $python) { $python = (Get-Command py -ErrorAction SilentlyContinue).Source }

function Test-Backend {
  try {
    $response = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

$backendStarted = $false

if ($python) {
  & $python -m pip install -r (Join-Path $root 'backend\requirements.txt')
  Start-Process -WindowStyle Hidden -FilePath $python -ArgumentList '-m', 'uvicorn', 'backend.app:app', '--host', '127.0.0.1', '--port', '8000' -WorkingDirectory $root

  # Give uvicorn a few seconds to bind, then confirm it actually came up before trusting it.
  for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Backend) { $backendStarted = $true; break }
  }
}

if (-not $backendStarted) {
  # Either Python isn't installed, or the live OSM/OSRM backend failed to start.
  # Fall back to the built-in static server so the website still loads
  # (only the live nearest-mandi lookup will be unavailable in this mode).
  Start-Process -WindowStyle Hidden -FilePath powershell.exe -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $root 'Serve-FarmRoute-Static.ps1')
  Start-Sleep -Seconds 2
}

$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LocalAppData\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($chrome) { Start-Process -FilePath $chrome -ArgumentList 'http://127.0.0.1:8000' } else { Start-Process 'http://127.0.0.1:8000' }
