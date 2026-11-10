# Cycle Rush: Kolkata Alleyways - Local Development Server
$portsToTry = @(8080, 8081, 8082, 3000, 5000)
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$listener = $null
$boundPort = 0

foreach ($port in $portsToTry) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
        $listener.Start()
        $boundPort = $port
        break
    } catch {
        # Port occupied, try next
    }
}

if (-not $listener) {
    Write-Host "Error: Could not bind to any test port (8080-8082, 3000, 5000)." -ForegroundColor Red
    exit 1
}

$url = "http://localhost:$boundPort/"
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " Cycle Rush: Kolkata Alleyways running at: $url" -ForegroundColor Green
Write-Host " Opening default web browser..." -ForegroundColor Cyan
Write-Host " Press Ctrl+C in this console to stop the server" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

Start-Process $url

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".mp3"  = "audio/mpeg"
    ".wav"  = "audio/wav"
    ".ogg"  = "audio/ogg"
    ".glb"  = "model/gltf-binary"
    ".gltf" = "model/gltf+json"
    ".bin"  = "application/octet-stream"
}

try {
    while ($true) {
        $client = $null
        try {
            $client = $listener.AcceptTcpClient()
            $client.ReceiveTimeout = 6000
            $client.SendTimeout = 10000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $requestLine = $reader.ReadLine()
            
            if ($requestLine) {
                $tokens = $requestLine.Split(" ")
                if ($tokens.Length -ge 2) {
                    $rawPath = [System.Uri]::UnescapeDataString($tokens[1].Split("?")[0])
                    if ($rawPath -eq "/" -or $rawPath -eq "") { $rawPath = "/index.html" }
                    
                    $safeRelPath = $rawPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
                    $localPath = [System.IO.Path]::Combine($root, $safeRelPath)
                    if (-not [System.IO.File]::Exists($localPath)) {
                        $fallbackPublic = [System.IO.Path]::Combine($root, "public", $safeRelPath)
                        if ([System.IO.File]::Exists($fallbackPublic)) {
                            $localPath = $fallbackPublic
                        }
                    }
                    
                    if ([System.IO.File]::Exists($localPath)) {
                        $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                        $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                        $fileStream = [System.IO.File]::OpenRead($localPath)
                        $fileLen = $fileStream.Length
                        
                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $fileLen`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        
                        # High-speed 64KB chunk buffer for smooth 24MB GLB streaming
                        $buffer = [byte[]]::new(65536)
                        $bytesRead = 0
                        while (($bytesRead = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                            $stream.Write($buffer, 0, $bytesRead)
                        }
                        $fileStream.Dispose()
                    } else {
                        $notFound = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nConnection: close`r`n`r`n404 Not Found: $rawPath"
                        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($notFound)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                    }
                }
            }
            $stream.Flush()
        } catch {
            # Catch client socket drops / aborted connections without crashing the server
        } finally {
            if ($client) {
                try { $client.Close() } catch {}
            }
        }
    }
} finally {
    if ($listener) { $listener.Stop() }
}
