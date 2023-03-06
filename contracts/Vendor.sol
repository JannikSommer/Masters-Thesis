// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

import "./AnnouncementService.sol";
import "./IdentifierIssuerService.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vendor is Ownable{
  address private _owner;
  string public vendorName;
  IdentifierIssuerService IIS; 
  AnnouncementService AS;
  uint64 public vendorId; // Could be removed and replaced with a getter function on the IIS.

  constructor(string memory name, address announcementServiceAddress, address identifierIssuerServiceAddress) {
    vendorName = name;
    AS = AnnouncementService(announcementServiceAddress);
    IIS = IdentifierIssuerService(identifierIssuerServiceAddress);
    vendorId = IIS.registerVendor();
  }

  function getVulnerabilityId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return IIS.requestVulnerabilityIdentifier();
  }
  
  function announceNewAdvisory(string memory productId, string memory location) onlyOwner public {
    AS.announceNewAdvisory(getVulnerabilityId(), productId, location);
  }

  function announceUpdatedAdvisory(string memory vulnerabilityId, string memory productId, string memory location) onlyOwner public {
    AS.announceUpdatedAdvisory(vulnerabilityId, productId, location);
  }

}