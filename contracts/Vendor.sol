// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./AnnouncementService.sol";
import "./IdentifierIssuerService.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Smart contract template for vendors. cl
/// @author Jannik Lucas Sommer & Magnus Mølgaard Lund.
/// @notice The smart contract has the necessary functionallity to interact 
///         with the SENTINEL system and it's services. 
contract Vendor is Ownable {
  string public vendorName;
  IdentifierIssuerService private _IIS; 
  AnnouncementService private _AS;
  uint64 public vendorId; // Could be removed and replaced with a getter function on the _IIS.

  constructor(string memory name, address announcementServiceAddress, address identifierIssuerServiceAddress) {
    vendorName = name;
    _AS = AnnouncementService(announcementServiceAddress);
    _IIS = IdentifierIssuerService(identifierIssuerServiceAddress);
    vendorId = _IIS.registerVendor();
  }

  function getVulnerabilityId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return _IIS.requestVulnerabilityIdentifier();
  }
  
  function announceNewAdvisory(string memory productId, string memory location) onlyOwner public {
    _AS.announceNewAdvisory(getVulnerabilityId(), productId, location);
  }

  function announceUpdatedAdvisory(string memory vulnerabilityId, string memory productId, string memory location) onlyOwner public {
    _AS.announceUpdatedAdvisory(vulnerabilityId, productId, location);
  }

}