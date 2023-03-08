// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./MessageControlable.sol";

/**
 * @title Announcement Service smart contract for the SENTINEL system.
 * @author Jannik Lucas Sommer & Magnus Mølgaard Lund.
 * @notice The smart contract is only responsible for emitting events.
 */

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
  
  function announceNewAdvisory(
    string memory vulnerabilityId,
    string memory productId,
    string memory documentLocation) external onlyContract {
      emit NewSecuriytAdvisory(vulnerabilityId, productId, documentLocation);
  }

  function announceUpdatedAdvisory(
    string memory vulnerabilityId, 
    string memory productId, 
    string memory documentLocation) external onlyContract {
      emit UpdatedSecurityAdvisory(vulnerabilityId, productId, documentLocation);
    }
}