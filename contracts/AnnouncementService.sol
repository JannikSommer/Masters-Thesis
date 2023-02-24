// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract AnnouncementService {
  event Announce(
    string productId,
    string documentLocation
  );
  
  function announce(
    string memory productId,
    string memory documentLocation) public {
    emit Announce(productId, documentLocation);
  }
}