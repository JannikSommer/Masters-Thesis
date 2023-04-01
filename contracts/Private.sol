// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Private Advisory Discloser
/// @author Jannik Lucas Sommer & Magnus Mølgaard Lund
/// @notice Allows whitelisted vendors to publish security advisories to the contract owner
contract Private is Ownable {

  /// @notice Represents an announcement of a security advisory
  /// @param location The location of the security advisory
  /// @param hash The hash of the security advisory
  /// @param decryptionKey The RSA-encrypted decryption key for deciphering the security advisory
  /// @param iv The initialization vector used for the AES encryption
  event Announcement(
    string location, 
    bytes32 hash,
    bytes decryptionKey,
    bytes12 iv
  );
  
  /// @notice Contains addresses of whitelisted vendors
  /// @dev Whitelisted vendors return 'true'
  mapping(address => bool) private vendors;
  
  /// @notice Stores the public RSA key in SubjectPublicKey format
  bytes public publicKey;

  modifier whitelisted() {
    require(vendors[msg.sender], "Caller is not whitelisted");
    _;
  }

  constructor() { }

  /// @notice Sets the 'publicKey' state variable
  /// @param pKey an array of bytes in representing a public RSA key in SubjectPublicKey format
  function setPublicKey(bytes memory pKey) public onlyOwner {
    publicKey = pKey;
  }

  /// @notice Adds an ethereum address to the whitelist
  /// @param vendor A valid ethereum address
  function addVendor(address vendor) public onlyOwner {
    require(vendor != address(0), "Address 0 is not whitelistable");
    require(!vendors[vendor], "Address is already whitelisted");
    vendors[vendor] = true;
  }

  /// @notice Removes an ethereum address to the whitelist
  /// @param vendor A valid ethereum address
  function removeVendor(address vendor) public onlyOwner {
    require(vendor != address(0), "Address 0 is not whitelistable");
    require(vendors[vendor], "Address is not whitelisted");
    vendors[vendor] = false;
  }

  /// @notice Emits an 'Announcement' event
  /// @dev Caller must be whitelisted
  /// @param location The location of the security advisory
  /// @param hash The hash of the security advisory
  /// @param dKey The RSA-encrypted decryption key for deciphering the security advisory
  function announce(string memory location, bytes32 hash, bytes memory dKey, bytes12 iv) external whitelisted {
    emit Announcement(location, hash, dKey, iv);
  }
}