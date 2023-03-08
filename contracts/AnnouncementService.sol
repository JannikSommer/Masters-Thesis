// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./MessageControlable.sol";

/// @title Announcement Service smart contract for the SENTINEL system.
/// @author Jannik Lucas Sommer & Magnus Mølgaard Lund.
/// @notice The smart contract is only responsible for emitting events for the SENTINEL system.
contract AnnouncementService is MessageControlable {

  event NewSecuriytAdvisory(
    string vulnerabilityId,
    string productId,
    string documentLocation
  );

  event UpdatedSecurityAdvisory(
    string indexed vulnerabilityId,
    string productId,
    string documentLocation 
  );
  
  /// @notice Emits a NewSecurityAdvisory event
  /// @param vulnerabilityId A vulnerability identifier from the IIS. 
  /// @param productId One or more product identifiers separated by comma. 
  /// @param documentLocation location for the security advisory.
  function announceNewAdvisory(
    string memory vulnerabilityId,
    string memory productId,
    string memory documentLocation) external onlyContract {
      emit NewSecuriytAdvisory(vulnerabilityId, productId, documentLocation);
  }

  /// @notice Emits an UpdatedSecurityAdvisory event
  /// @param vulnerabilityId A vulnerability identifier from the IIS. 
  /// @param productId One or more product identifiers separated by comma. 
  /// @param documentLocation location for the security advisory.
  function announceUpdatedAdvisory(
    string memory vulnerabilityId, 
    string memory productId, 
    string memory documentLocation) external onlyContract {
      emit UpdatedSecurityAdvisory(vulnerabilityId, productId, documentLocation);
    }
}