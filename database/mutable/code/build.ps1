Get-ChildItem -Path  ${PSScriptRoot}/*.sol | ForEach-Object { Write-Output $_.Name } | ForEach-Object { docker run -v ${PSScriptRoot}:/sources ethereum/solc:stable -o /sources/build --abi --bin /sources/$_ --overwrite }