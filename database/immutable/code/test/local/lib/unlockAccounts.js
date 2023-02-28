const fs = require('fs');
const Web3 = require('web3');
const network = "http://localhost:7545";
const web3 = new Web3(new Web3.providers.HttpProvider(network));
console.log(" ### " + network + " ACCOUNTS")

web3.eth.getAccounts().then((accounts)=>{

  accounts.forEach(function (account, index) {
    web3.eth.getBalance(account).then((balance)=>{
      
      try{
        web3.eth.personal.unlockAccount(account).then((a,b,c)=>{
          console.log(" #### account: "+ account +" "+balance)
          console.log(" ##### balance: " + balance + " unlocked: " + a)
        })
      }catch(e){console.log(e)}
    })
  });

})