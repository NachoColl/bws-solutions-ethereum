const fs = require('fs');
const Web3 = require('web3');
const network = "http://localhost:7545";
const web3 = new Web3(new Web3.providers.HttpProvider(network));
console.log(" ### " + network + " UNLOCK ACCOUNT 0")

let count = 1
web3.eth.getAccounts().then((accounts)=>{
  for(let i=0;i<count;i++){
    web3.eth.getBalance(accounts[i]).then((balance)=>{
      console.log(" #### account: "+accounts[i]+" "+balance)
      try{
        web3.eth.personal.unlockAccount(accounts[i]).then((a,b,c)=>{
          console.log(" ##### balance: " + balance + " unlocked: " + a)
        })
      }catch(e){console.log(e)}
    })
  }
})
