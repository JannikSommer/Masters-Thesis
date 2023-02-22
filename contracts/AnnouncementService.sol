// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract AnnouncementService {
  event Announce(
    string indexed vendor,
    string productId,
    string documentLocation,
    string decryptionKey
  );
  
  function announce(
    string memory vendor,
    string memory productId,
    string memory documentLocation,
    string memory decryptionKey) public {
    emit Announce(vendor, productId, documentLocation, decryptionKey);
  }
}