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

  function announceNewAdvisory(string memory vulnerabilityId, string memory productId, string memory location) public {
    AnnouncementService service = AnnouncementService(serviceAddress);
    service.announceNewAdvisory(vulnerabilityId, productId, location);
  }

  function announceAdvisoryUpdate(string memory vulnerabilityId, string memory productId, string memory location) public {
    AnnouncementService service = AnnouncementService(serviceAddress);
    service.announceAdvisoryUpdate(vulnerabilityId, productId, location);
  }

}