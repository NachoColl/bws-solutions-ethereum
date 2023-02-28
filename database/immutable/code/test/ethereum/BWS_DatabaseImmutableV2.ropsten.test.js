const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const
  contractAddress = "0x81D575b53239BcB4332bb1608a21F1A17035deeA", /* check deployed folder for contract address */
  contractBaseName = "BWS_DatabaseImmutable",
  contractVersion = 2;

/* web3 variables */
var web3, localKeyProvider, contract, account, secrets;

/* to use as the key for insert/select */
var userId, insertKey;

jest.setTimeout(1000000);

/* deploy and create contract object to interact with */
beforeAll(async () => {

  /* get config for network and account to use */
  let secretsFile = fs.readFileSync(path.join(__dirname, '../../../../../', 'secrets.json'));
  secrets = JSON.parse(secretsFile).ropsten;

  /* init web3 object */
  localKeyProvider = new HDWalletProvider({
    privateKeys: [secrets.private],
    providerOrUrl: secrets.endpoint,
  });
  web3 = new Web3(localKeyProvider);
  account = web3.eth.accounts.privateKeyToAccount(secrets.private);

  /* create the web3 contract object */
  let abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../deployed/ropsten/v' + contractVersion + '/' + contractAddress + '/' + contractBaseName + 'V' + contractVersion + '.abi')));
  contract = new web3.eth.Contract(abi, contractAddress);

  /* to use as ids/keys for contract operation */
  userId = web3.utils.randomHex(32)
  insertKey = web3.utils.randomHex(32)

});

afterAll(async () => {
  await Promise.resolve().then(async function () {
    if (typeof localKeyProvider !== 'undefined') await localKeyProvider.engine.stop();
    localKeyProvider = null;
  });
});

test("estimageGas for insertBytes32(userId, insertKey,'hello world') < available gas", async () => {
  await web3.eth.getBalance(secrets.address).then(async function (balance) {
    await contract.methods.insertBytes32(web3.utils.soliditySha3Raw(userId), insertKey, web3.utils.toHex('hello world')).estimateGas({ from: account.address }).then(function (gasAmount) {
      console.log("### estimageGas for insertBytes32: " + gasAmount);
      expect(gasAmount).toBeLessThan(BigInt(balance));
    });
  });
});

test("insertBytes32(userId, insertKey,'hello world')", async () => {
  await contract.methods.insertBytes32(web3.utils.soliditySha3Raw(userId), insertKey, web3.utils.toHex('hello world')).send({ from: account.address }).then(function (result) {
    console.log(result);
    expect(true).toBe(true);
  });
});

test("selectBytes32(userId, insertKey)", async () => {
  await contract.methods.selectBytes32(web3.utils.soliditySha3Raw(userId), insertKey).call({ from: account.address }).then(function (result) {
    console.log(result);
    expect(web3.utils.toHex(web3.utils.hexToAscii(result))).toBe(web3.utils.toHex('hello world'));
  });
});


test("estimageGas for insertString(userId, insertKey, 'hello world, this is more than 32 bytes string') < available gas", async () => {
  await web3.eth.getBalance(secrets.address).then(async function (balance) {
    await contract.methods.insertString(web3.utils.soliditySha3Raw(userId), insertKey, web3.utils.toHex('hello world, this is more than 32 bytes string')).estimateGas({ from: account.address }).then(function (gasAmount) {
      console.log("### estimageGas for insertString: " + gasAmount);
      expect(gasAmount).toBeLessThan(BigInt(balance));
    });
  });
});

test("insertString(userId, insertKey, 'hello world, this is more than 32 bytes string')", async () => {
  await contract.methods.insertString(web3.utils.soliditySha3Raw(userId), insertKey, web3.utils.toHex('hello world, this is more than 32 bytes string')).send({ from: account.address }).then(function (result) {
    console.log(result);
    expect(true).toBe(true);
  });
});

test("selectString(userId, insertKey)", async () => {
  await contract.methods.selectString(web3.utils.soliditySha3Raw(userId), insertKey).call({ from: account.address }).then(function (result) {
    console.log(result);
    expect(web3.utils.toHex(web3.utils.hexToAscii(result))).toBe(web3.utils.toHex('hello world, this is more than 32 bytes string'));
  });
});
