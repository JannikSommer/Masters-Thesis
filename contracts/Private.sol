// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Private is Ownable {

  event Announcement(
    string location, 
    bytes32 hash
  );
  
  mapping(address => bool) private vendors;
  
  modifier whitelisted() {
    require(vendors[msg.sender], "Vendor must be whitelisted to announce");
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
