const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const gaspriceInGWei = 20;
const args = getArgs();

async function deploy() {

  let network = args["network"];
  let contract = args["contract"];

  /* get config for network and account to use */
  let secretsFile = fs.readFileSync(path.join(__dirname, '../../../../', 'secrets.json'));
  let secrets = JSON.parse(secretsFile)[network];

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
  const contractsBuildPath = path.join(__dirname, '../build');
  const abi = JSON.parse(fs.readFileSync(contractsBuildPath + "/" + contract + ".abi", 'utf8'));
  const bin = fs.readFileSync(contractsBuildPath + "/" + contract + ".bin", 'utf8');
  const myContract = new web3.eth.Contract(abi)
    .deploy({
      data: bin,
      arguments: []
    });
  const estimate = await web3.eth.estimateGas({
    data: bin
  });
  /*
   * deploy contract
   */
  console.log(" ###  DEPLOYING " + contract + " to network " + secrets.endpoint + " using ACCOUNT " + account.address + " estimate Gas: " + estimate);

  return await (new Promise(async (resolveDeployContract, rejectDeployContract) => {


    myContract
      .send({
        from: account.address,
        gas: estimate * 2,
        gasPrice: gaspriceInGWei * 10 * 10 ** 8
      }, async function (error, transactionHash) {
        if (error) {
          await localKeyProvider.engine.stop();
          rejectDeployContract(error);
        }
        else {
          await (new Promise(resolveTransaction => {

            /**********************/
            /* check transaction */
            var count = 0;
            const checkTransaction = setInterval(() => {
              web3.eth.getTransactionReceipt(transactionHash, (error, result) => {
                if (result && result.contractAddress && result.cumulativeGasUsed) {
                  clearInterval(checkTransaction);
                  resolveTransaction(result.contractAddress)
                } else {
                  if (count++ == 0) process.stdout.write(" #### WAITING .")
                  else process.stdout.write(".");
                }
              });
            }, 1000);
            /* END check transaction */
            /*************************/

          })).then(async contractAddress => { await localKeyProvider.engine.stop(); resolveDeployContract(contractAddress); }).catch(async error => { await localKeyProvider.engine.stop(); rejectDeployContract(error); });
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

  console.log(args);

  return params;
}

if (require.main == module) {
  (async () => {
    await deploy().then(contractAddress => { console.log(" #### Contract created at: ", contractAddress) }).catch(error => { console.log(" #### ERROR : ", error); });
  })();
}
