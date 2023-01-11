
const { ethers } = require("hardhat");

async function main() {
  /* 
  A contractFactory in ethers.js is an abstraction used to deploy SC
  so whitelistedContract here is a factory for instances of our whitelist contract
  */

  const whitelistContract = await ethers.getContractFactory("Whitelist");
  
  //Here we deploy the contract
  const deployedWhitelistContract = await whitelistContract.deploy(10);
  //Max 10 address are allowed

  await deployedWhitelistContract.deployed();

  //print the address of the deployed contract
  console.log("Whitelist Contract Address:", deployedWhitelistContract.address);

}

  //call the main functions and catch if any error
  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





























