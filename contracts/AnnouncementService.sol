// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "./MessageControlable.sol";

/// @title Announcement Service smart contract for the SENTINEL system.
/// @author Jannik Lucas Sommer & Magnus Mølgaard Lund.
/// @notice The smart contract is only responsible for emitting events for the SENTINEL system.
contract AnnouncementService is MessageControlable {

  /// @notice Event that is emitted for announcing new security advisories.
  /// @param advisoryIdentifier An advisory identifier for the security advisory.
  /// @param vulnerabilityIdentifiers One or more vulnerability identifiers separated by comma. 
  /// @param productIdentifiers One or more product identifiers separated by comma.
  /// @param documentLocation Location for the security advisory (i.e. IPFS CID). 
  event NewSecurityAdvisory(
    string advisoryIdentifier,
    string vulnerabilityIdentifiers,
    string productIdentifiers,
    string documentLocation
  );

  /// Event that is emitted for announcing updated security advisories. 
  /// @param advisoryIdentifier An advisory identifier for the security advisory.
  /// @param vulnerabilityIdentifiers One or more vulnerability identifiers from the IIS separated by comma.
  /// @param productIdentifiers One or more product identifiers separated by comma.
  /// @param documentLocation Location for the security advisory (i.e. IPFS CID). 
  event UpdatedSecurityAdvisory(
    string indexed advisoryIdentifier, 
    string vulnerabilityIdentifiers,
    string productIdentifiers,
    string documentLocation 
  );
  
  /// @notice Emits a NewSecurityAdvisory event
  /// @param advisoryIdentifier An advisory identifier from the IIS. 
  /// @param vulnerabilityIdentifiers One or more vulnerability identifiers from the IIS separated by comma.
  /// @param productIdentifiers One or more product identifiers separated by comma. 
  /// @param documentLocation Location for the security advisory (i.e. IPFS CID). 
  function announceNewAdvisory(
    string memory advisoryIdentifier,
    string memory vulnerabilityIdentifiers,
    string memory productIdentifiers,
    string memory documentLocation) external onlyContract {
      emit NewSecurityAdvisory(advisoryIdentifier, vulnerabilityIdentifiers, productIdentifiers, documentLocation);
  }

  /// @notice Emits an UpdatedSecurityAdvisory event
  /// @param advisoryIdentifier An advisory identifier from the IIS. 
  /// @param vulnerabilityIdentifiers A vulnerability identifier from the IIS. 
  /// @param productIdentifiers One or more product identifiers separated by comma. 
  /// @param documentLocation location for the security advisory.
  function announceUpdatedAdvisory(
    string memory advisoryIdentifier,
    string memory vulnerabilityIdentifiers, 
    string memory productIdentifiers, 
    string memory documentLocation) external onlyContract {
      emit UpdatedSecurityAdvisory(advisoryIdentifier, vulnerabilityIdentifiers, productIdentifiers, documentLocation);
    }
}