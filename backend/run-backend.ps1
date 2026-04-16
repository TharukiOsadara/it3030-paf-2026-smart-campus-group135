# Start the Spring Boot API without a global Maven install.
# Sets JAVA_HOME on Windows when it is missing (mvnw.cmd requires it).

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Get-ConfiguredPort {
    $defaultPort = 8080
    $envFile = Join-Path $root ".env"
    if (-not (Test-Path $envFile)) {
        return $defaultPort
    }

    $line = Get-Content $envFile | Where-Object { $_ -match '^\s*SERVER_PORT\s*=' } | Select-Object -First 1
    if (-not $line) {
        return $defaultPort
    }

    $value = ($line -split '=', 2)[1].Trim()
    $port = 0
    if ([int]::TryParse($value, [ref]$port) -and $port -gt 0) {
        return $port
    }
    return $defaultPort
}

function Get-FreePort([int]$preferredPort) {
    $port = $preferredPort
    for ($i = 0; $i -lt 20; $i++) {
        $inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if (-not $inUse) {
            return $port
        }
        $port++
    }
    throw "Unable to find a free port near $preferredPort"
}

function Stop-ExistingBackendProcesses {
    $javaProcs = Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue
    if (-not $javaProcs) {
        return
    }

    foreach ($proc in $javaProcs) {
        $cmd = $proc.CommandLine
        if ($cmd -and $cmd -match "com\.smartcampus\.SmartcampusApplication") {
            try {
                Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
                Write-Host "Stopped existing backend process PID $($proc.ProcessId)"
            } catch {
                Write-Warning "Could not stop backend PID $($proc.ProcessId): $($_.Exception.Message)"
            }
        }
    }
}

if (-not $env:JAVA_HOME) {
    $found = $null
    foreach ($name in @("jdk-17", "jdk-21")) {
        $p = "$env:ProgramFiles\Java\$name"
        if (Test-Path "$p\bin\javac.exe") {
            $found = $p
            break
        }
    }
    if (-not $found) {
        $adoptium = Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium" -Directory -Filter "jdk-*" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending
        foreach ($d in $adoptium) {
            if (Test-Path "$($d.FullName)\bin\javac.exe") {
                $found = $d.FullName
                break
            }
        }
    }
    if (-not $found) {
        Write-Error "JAVA_HOME is not set and no JDK was found under Program Files\Java or Eclipse Adoptium. Install JDK 17+ or set JAVA_HOME to your JDK folder."
    }
    $env:JAVA_HOME = $found
    Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
}

Set-Location $root
Stop-ExistingBackendProcesses
$preferredPort = Get-ConfiguredPort
$selectedPort = Get-FreePort -preferredPort $preferredPort
if ($selectedPort -ne $preferredPort) {
    Write-Host "Port $preferredPort is already in use. Starting backend on port $selectedPort instead."
}
$env:SERVER_PORT = "$selectedPort"

if ($args.Count -eq 0) {
    & "$root\mvnw.cmd" spring-boot:run
} else {
    & "$root\mvnw.cmd" @args
}
