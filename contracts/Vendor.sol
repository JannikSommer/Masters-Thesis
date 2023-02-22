// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
import "./AnnouncementService.sol";

contract Vendor {
  address private _owner;
  address private serviceAddress;

  constructor()
  {
    _owner = msg.sender;
  }

  modifier onlyOwner() 
  {
    require(isOwner(), "Function accessible only by the owner !!");
    _;
  }

  function isOwner() public view returns(bool) 
  {
    return msg.sender == _owner;
  }

  function setServiceAddress(address addr) onlyOwner public {
    serviceAddress = addr;
  }

  function announce(string memory productId, string memory location, string memory key) public {
    AnnouncementService service = AnnouncementService(serviceAddress);
    service.announce("IBM", productId, location, key);
  }
}