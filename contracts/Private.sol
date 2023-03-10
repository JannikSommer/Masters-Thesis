// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Private is Ownable {

  event Announcement(
    string location, 
    bytes32 hash
  );
  
  mapping(address => bool) private vendors;
  
  modifier whitelisted() {
    require(vendors[msg.sender], "Caller is not whitelisted");
    _;
  }

  constructor() {
  }

  function addVendor(address vendor) public onlyOwner {
    require(!vendors[vendor], "Address is already whitelisted");
    vendors[vendor] = true;
  }

  function removeVendor(address vendor) public onlyOwner {
    require(vendors[vendor], "Address is not whitelisted");
    vendors[vendor] = false;
  }

  function announce(string memory location, bytes32 hash) external whitelisted {
    emit Announcement(location, hash);
  }
}