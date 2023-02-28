const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const gaspriceInGWei = 500;
const args = getArgs();

async function deploy(contract, secrets) {

  /*
   * build web3 client
   */
  const localKeyProvider = new HDWalletProvider({
    privateKeys: [secrets.private],
    providerOrUrl: secrets.endpoint,
  });
  const web3 = new Web3(localKeyProvider);

  /* 
   * get account for related secrets.private
   */
  const account = web3.eth.accounts.privateKeyToAccount(secrets.private);

  /*
   * build contract from ABI
   */
  const contractsBuildPath = path.join(__dirname, '../../../build');
  const abi = JSON.parse(fs.readFileSync(contractsBuildPath + "/" + contract + ".abi", 'utf8'));
  const bin = fs.readFileSync(contractsBuildPath + "/" + contract + ".bin", 'utf8');
  const myContract = new web3.eth.Contract(abi)
    .deploy({
      data: bin,
      arguments: []
    });

  /*
   * deploy contract
   */
  console.log(" ###  DEPLOYING " + contract + " to network " + secrets.endpoint + " using ACCOUNT " + account.address);
  return await (new Promise(async (resolveDeployContract, rejectDeployContract) => {
    myContract
      .send({
        from: account.address,
        gas: 6721975,
        gasPrice: gaspriceInGWei * 10 * 10 ** 8
      }, async function (error, transactionHash) {
        if (error) {
          console.log(" #### ERROR : ", error);
          await localKeyProvider.engine.stop();
          rejectDeployContract(error);
        }
        else {
          await (new Promise(resolveTransaction => {

            /**********************/
            /* check transaction */
            const checkTransaction = setInterval(() => {
              web3.eth.getTransactionReceipt(transactionHash, (error, result) => {
                if (result && result.contractAddress && result.cumulativeGasUsed) {
                  clearInterval(checkTransaction);
                  resolveTransaction(result.contractAddress)
                } else {
                  process.stdout.write(".")
                }
              });
            }, 1000);
            /* END check transaction */
            /*************************/

          })).then(async contractAddress => { await localKeyProvider.engine.stop(); resolveDeployContract(contractAddress); });
        }
      });
  }));
}

function getArgs() {
  const args = process.argv.slice(2);
  let params = {};

  args.forEach(a => {
    const nameValue = a.split("=");
    params[nameValue[0]] = nameValue[1];
  });

  return params;
}

if (require.main == module) {
  (async () => {
    await deploy('BWS_DatabaseMutableV1').then(contractAddress => { console.log(" #### Contract created at: ", contractAddress) });
  })();
}

module.exports = deploy;
