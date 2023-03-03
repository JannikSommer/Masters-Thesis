// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

import "./MessageControlable.sol";

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

  function announceAdvisoryUpdate(
    string memory vulnerabilityId, 
    string memory productId, 
    string memory documentLocation) external onlyContract {
      emit UpdatedSecurityAdvisory(vulnerabilityId, productId, documentLocation);
    }
}