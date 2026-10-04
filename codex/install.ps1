param([string]$SkillRoot)
$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction Stop
$codexCommand = Get-Command codex -ErrorAction Stop
if (-not $SkillRoot) {
    $codexRoot = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $env:USERPROFILE '.codex' }
    $SkillRoot = Join-Path $codexRoot 'skills'
}
$destination = Join-Path $SkillRoot 'normify-gen'
if (Test-Path -LiteralPath $destination) {
    throw "Skill already exists at $destination. Preserve it or choose a different -SkillRoot."
}
& $codexCommand.Source mcp get normify --json 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    throw 'An MCP server named normify already exists. Preserve that configuration before replacing it.'
}
New-Item -ItemType Directory -Force -Path $SkillRoot | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'skills/normify-gen') -Destination $destination -Recurse
& $codexCommand.Source mcp add normify -- $nodeCommand.Source (Join-Path $PSScriptRoot 'mcp.mjs')
if ($LASTEXITCODE -ne 0) {
    throw "Skill installed at $destination, but MCP registration failed. See README.zh-CN.md for manual configuration."
}
Write-Output "Installed normify-gen at $destination. Keep $packageRoot in place for MCP. Start a new Codex turn; restart Codex if needed."
