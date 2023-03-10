// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

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
  function getVulnerabilityId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    return _IIS.requestVulnerabilityIdentifier();
  }
  
  /// Calls function on the Announcement Service which emits an event. 
  /// @dev This function will automatically get a new vulnerability identifier. 
  /// @param productId One or more product identifiers separated by comma.
  /// @param documentLocation Location for the security advisory (i.e. IPFS CID). 
  function announceNewAdvisory(string memory productId, string memory location) onlyOwner public {
    _AS.announceNewAdvisory(getVulnerabilityId(), productId, location);
  }

  /// @notice Calls function on the Announcement Service which emits an event. 
  /// @param vulnerabilityId A vulnerability identifier for the vulnerability.
  /// @param productId One or more product identifiers separated by comma.
  /// @param documentLocation Location for the security advisory (i.e. IPFS CID). 
  function announceUpdatedAdvisory(string memory vulnerabilityId, string memory productId, string memory location) onlyOwner public {
    _AS.announceUpdatedAdvisory(vulnerabilityId, productId, location);
  }

}