$ErrorActionPreference = "Stop"
$logDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stdout = Join-Path $logDir "server-stdout.log"
$stderr = Join-Path $logDir "server-stderr.log"
$proc = Start-Process -FilePath "node" -ArgumentList "node_modules/next/dist/bin/next dev -p 3000 --webpack" -WorkingDirectory $logDir -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru -NoNewWindow
$proc.Id | Out-File (Join-Path $logDir "server.pid") -Encoding ASCII
Write-Output "Server PID: $($proc.Id)"
