// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;

contract AnnouncementService {
  event Announce(
    string indexed vendor,
    string indexed product,
    string productId,
    string signature,
    string documentLocation,
    string decryptionKey
  );
  
  function announce(
    string memory vendor,
    string memory product,
    string memory productId,
    string memory signature, 
    string memory documentLocation,
    string memory decryptionKey) public {
    emit Announce(vendor, product, productId, signature, documentLocation, decryptionKey);
  }
}