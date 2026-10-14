$secureToken = Read-Host 'Cole o Bot Token (o texto ficará oculto)' -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)

try {
  $env:DISCORD_BOT_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)
  node (Join-Path $PSScriptRoot 'register-discord-commands.mjs')
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
  Remove-Item Env:DISCORD_BOT_TOKEN -ErrorAction SilentlyContinue
}
