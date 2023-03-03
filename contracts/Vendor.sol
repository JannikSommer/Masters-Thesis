// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
import "./AnnouncementService.sol";
import "./IdentifierIssuerService.sol";

contract Vendor {
  address private _owner;
  string public vendorName;
  IdentifierIssuerService IIS; 
  AnnouncementService AS;
  uint64 public vendorId; // Could be removed and replaced with a getter function on the IIS.

  constructor(string memory name, address announcementServiceAddress, address identifierIssuerServiceAddress)
  {
    _owner = msg.sender;
    vendorName = name;
    AS = AnnouncementService(announcementServiceAddress);
    IIS = IdentifierIssuerService(identifierIssuerServiceAddress);
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

  function getVendorId() onlyOwner public {
    vendorId = IIS.registerVendor();
  }

  function getVulnerabilityId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return IIS.requestVulnerabilityIdentifier();
  }
  
  function announceNewAdvisory(string memory vulnerabilityId, string memory productId, string memory location) public {
    AS.announceNewAdvisory(vulnerabilityId, productId, location);
  }

  function announceAdvisoryUpdate(string memory vulnerabilityId, string memory productId, string memory location) public {
    AS.announceAdvisoryUpdate(vulnerabilityId, productId, location);
  }

}