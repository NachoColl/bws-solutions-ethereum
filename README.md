# Blockchain Web Services ETHEREUM Contracts

Ethereum contracts you can call using Blockchain Web Services.

## Database

### BWS_DatabaseImmutable 

#### Version

2
#### Network(s) Contract Addresses

| Network Id | Contract Address                                                                                                                   | Version |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- |
| ethereum   | [0x58ca3f44cf5c84c1c29591a483be3288d0a01b7c](https://etherscan.io/address/0x58ca3f44cf5c84c1c29591a483be3288d0a01b7c)              | 2       |
| sepolia    | [0xEF28790d1C8ac0833e8c05BB4344e479Da8a4Dd3](https://sepolia.etherscan.io/address/0xEF28790d1C8ac0833e8c05BB4344e479Da8a4Dd3) | 2       |


### BWS_DatabaseMutable

#### Version

1
#### Network(s) Contract Addresses

| Network Id | Contract Address                                                                                                                   | Version |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- |
| ethereum   | [0x1aFEe6DD9A1D4af90c39CD8B09296FC505beA00d](https://etherscan.io/address/0x1aFEe6DD9A1D4af90c39CD8B09296FC505beA00d)              | 1       |
| sepolia    | [0x58ca3f44cF5c84C1C29591A483be3288D0A01b7C](https://sepolia.etherscan.io/address/0x58ca3f44cF5c84C1C29591A483be3288D0A01b7C) | 1       |

## How To

### Build

Run `build.ps1` for building code (check [solc](https://docs.soliditylang.org/en/v0.8.13/installing-solidity.html) website for options). Script will check for same folder contract file and compile them into the `build` folder you will use to test and deploy:

```ps
Get-ChildItem -Path  ${PSScriptRoot}/*.sol | ForEach-Object { Write-Output $_.Name } | ForEach-Object { docker run -v ${PSScriptRoot}:/sources ethereum/solc:stable -o /sources/build --abi --bin /sources/$_ --overwrite }
```

### Test

We use [jest](https://jestjs.io/) and [Ganache](https://www.trufflesuite.com/ganache) as the local blockchain network to test contracts calling web3 library:

- Run `npm install` to get required dependencies (if not already done),
- launch [Ganache](https://trufflesuite.com/docs/ganache/) and update `config.json` file with the account keys and the network variables you want to use.
- and then just run `jest` command.

You should get something like:

![Jest run example](.assets/images/jest_test_results_example.jpg)

### Deployment

We use web3 code to deploy contracts,

- Go to `deploy` folder,
- run `npm install`if required,
- execute `node deploy network=network-name contract=contract-name`.

e.g. `node deploy network=mainnet contract=BWS_DatabaseImmutableV2`

The network name should match on `secrets.json` file (check Notes), and contract-name must match contract file name on `build` folder.

## Notes

### Configure secrets.json

In order to run/test smart contracts locally you need to create and configure the relevant secrets in `secrets.json` file. Check your local [Ganache](https://www.trufflesuite.com/ganache) for getting the values for local testing.

```json
{
  "local": {
    "endpoint": "http://127.0.0.1:7545",
    "address": "0x2656811B4C0128CF5F03388493Ca2c2b2A6426A",
    "private": "4d6ca7a5259e6020b3094e63f9733004382f6f26d24d941ed1646d588a27b50",
    "mnemonic": "local advice wait monday tide bike regret circle uncle armed indoor sheriff"
  }
}
```