//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.1;

contract Whitelist{

    //Max number of whitelisted address allowed
    uint8 public maxWhitelistedAddresses;

    //create a mapping of maxWhitelistedAddresses
    // if an address is whitelisted, we would set it to true, it is false by default for all address
    mapping(address => bool) public whitelistedAddresses;

    //numAddressesWHitelisted = how many address have been whitelisted
    //NOTE: dont change this variable name, as it will be part of verifcation
    uint8 public numAddressesWhitelisted;

    //settings the max number of whitelisted 
    //User will put the value at the time of deployment
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /* 
    addAddressToWhitelist - Here this fun adds the address of the sender to the whitelsit
     */

    function addAddressToWhitelist() public {
        // check if user is already whitelisted
        require(!whitelistedAddresses[msg.sender], "sender has already been whitelisted");

        //check numAddressesWhitelisted < maxWhitelistedAddresses
        require(numAddressesWhitelisted < maxWhitelistedAddresses, "More addresses can't be added, limit reached");
        //add the address which called the function to the whitelisted array[]
        whitelistedAddresses[msg.sender] = true;
        //increase the number whitelistedAddresses
        numAddressesWhitelisted +=1;

    }

}



















