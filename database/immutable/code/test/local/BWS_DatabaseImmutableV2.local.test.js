const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const deploy = require('./lib/deploy-local');
const { exit } = require('process');

/* to use by tests */
var web3, localKeyProvider, contract, account;

jest.setTimeout(100000);

/* deploy and create contract object to interact with */
beforeAll(async () => {

  /* get config for network and account to use */
  let secretsFile = fs.readFileSync(path.join(__dirname, '../../../../../', 'secrets.json'));
  let secrets = JSON.parse(secretsFile).local;

  console.log(secrets);

  /* deploys the contract and gets his address */
  var contractAddress;
  var error = false;
  await deploy('BWS_DatabaseImmutableV2', secrets)
    .then(contract => { console.log("contract address: ", contract); contractAddress = contract })
    .catch(error => { console.log("Error deploying contract:" + error); error = true; });

  if (!error) {
    /* init web3 object */
    localKeyProvider = new HDWalletProvider({
      privateKeys: [secrets.private],
      providerOrUrl: secrets.endpoint,
    });
    web3 = new Web3(localKeyProvider);
    account = web3.eth.accounts.privateKeyToAccount(secrets.private);

    /* create the web3 contract object */
    let abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../../build/BWS_DatabaseImmutableV2.abi')));
    contract = new web3.eth.Contract(abi, contractAddress);
  } else
    exit(-1);
});

afterAll(async () => {
  await Promise.resolve().then(async function () {
    if (typeof localKeyProvider !== 'undefined') await localKeyProvider.engine.stop();
    localKeyProvider = null;
  });
});

test("insert bytes32 ('row1','hello world')", async () => {
  await contract.methods.insertBytes32(web3.utils.toHex('id'), web3.utils.toHex('row1'), web3.utils.toHex('hello world')).send({ from: account.address }).then(function (result) {
    expect(true).toBe(true);
  });
});

test("select bytes 32 ('row1','hello world')", async () => {
  await contract.methods.selectBytes32(web3.utils.toHex('id'), web3.utils.toHex('row1')).call({ from: account.address }).then(function (result) {
    expect(web3.utils.toHex(web3.utils.hexToAscii(result))).toBe(web3.utils.toHex('hello world'));
  });
});

test("insert string ('row1','hello world, this is more than 32 bytes string')", async () => {
  await contract.methods.insertString(web3.utils.toHex('id'), web3.utils.toHex('row1'), web3.utils.toHex('hello world, this is more than 32 bytes string')).send({ from: account.address }).then(function (result) {
    expect(true).toBe(true);
  });
});

test("select string ('row1')", async () => {
  await contract.methods.selectString(web3.utils.toHex('id'), web3.utils.toHex('row1')).call({ from: account.address }).then(function (result) {
    expect(web3.utils.toHex(web3.utils.hexToAscii(result))).toBe(web3.utils.toHex('hello world, this is more than 32 bytes string'));
  });
});