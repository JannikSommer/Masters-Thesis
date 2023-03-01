// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract IdentifierIssuerService {
  uint64 private vendorCount = 0;

  modifier onlyContract() {
    require(msg.sender != tx.origin, "Call only accesible from smart contract");
    _;
  }

  // VendorContractAddress => VendorId
  mapping(address => uint64) public vendors;

  // VendorId => VulnerabilityId
  mapping(uint64 => uint64[]) public vulnerabilites;

  function registerVendor() external onlyContract returns (uint64) {
    require(vendors[msg.sender] == 0, "Vendors can register once"); // Vendor is not registered already
    vendorCount++;
    vendors[msg.sender] = vendorCount;
    return vendorCount;
  }

  function generateVulnerabilityIdentifier(uint64 vendorId, uint64 vulnerabilityNumber) pure private returns (string memory) {
    return string.concat("SNTL-", Strings.toString(vendorId), "-", Strings.toString(vulnerabilityNumber));
  }

  function requestVulnerabilityIdentifier() external onlyContract returns (string memory) {
    require(vendors[msg.sender] != 0, "Vendors must be registered");
    uint64 vendorId = vendors[msg.sender];

    vulnerabilites[vendorId].push(uint64(vulnerabilites[vendorId].length + 1));
    uint64 vulnerabilityNumber = uint64(vulnerabilites[vendorId].length);

    return generateVulnerabilityIdentifier(vendorId, vulnerabilityNumber);
  }
}
