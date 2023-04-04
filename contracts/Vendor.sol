// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./AnnouncementService.sol";
import "./IdentifierIssuerService.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Smart contract template for vendors.
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

  /// @notice Retrieves a vulnerability identifier from the Identifier Issuer Service. 
  /// @dev The smart contract must be registered as a vendor (get vendoerId from constructor). 
  /// @return String of the generated vulnerability identifier. 
  function getVulnerabilityIds(uint16 count) onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return _IIS.requestVulnerabilityIdentifiers(count);
  }

  function getAdvisoryId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return _IIS.requestAdvisoryIdentifier();
  }
  
  /// Calls function on the Announcement Service which emits an event. 
  /// @dev This function will automatically get a new vulnerability identifier. 
  /// @param count The amount of vulnerability identifiers to create.
  /// @param productIds One or more product identifiers separated by comma.
  /// @param location Location for the security advisory (i.e. IPFS CID). 
  function announceNewAdvisory(
    uint16 count, 
    string memory productIds, 
    string memory location) onlyOwner public {
    _AS.announceNewAdvisory(getAdvisoryId(), getVulnerabilityIds(count), productIds, location);
  }

  /// @notice Calls function on the Announcement Service which emits an event. 
  /// @param vulnerabilityIds A vulnerability identifier for the vulnerability.
  /// @param productId One or more product identifiers separated by comma.
  /// @param location Location for the security advisory (i.e. IPFS CID). 
  function announceUpdatedAdvisory(
    string memory advisoryId, 
    string memory vulnerabilityIds, 
    string memory productId,
    string memory location) onlyOwner public {
    _AS.announceUpdatedAdvisory(advisoryId, vulnerabilityIds, productId, location);
  }
}