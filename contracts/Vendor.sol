// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.16 <0.9.0;
import "./AnnouncementService.sol";
import "./IdentifierIssuerService.sol";

contract Vendor {
  address private _owner;
  address private announcementServiceAddress;
  address private identifierIssuerServiceAddress;
  uint64 public vendorId;


  constructor()
  {
    _owner = msg.sender;
  }

  modifier onlyOwner() 
  {
    require(isOwner(), "Function accessible only by the owner !!");
    _;
  }

  function isOwner() public view returns(bool) 
  {
    return msg.sender == _owner;
  }

  function setAnnouncementServiceAddress(address addr) onlyOwner public {
    announcementServiceAddress = addr;
  }
  function setIdentifierIssuerServiceAddress(address addr) onlyOwner public {
    identifierIssuerServiceAddress = addr;
  }

  function announce(string memory productId, string memory location) public {
    AnnouncementService service = AnnouncementService(announcementServiceAddress);
    service.announce(productId, location);
  }

  function getVendorId() onlyOwner public {
    IdentifierIssuerService service = IdentifierIssuerService(identifierIssuerServiceAddress);
    vendorId = service.registerVendor();
  }

  function getVulnerabilityId() onlyOwner public returns (string memory) {
    require(vendorId != 0, "Function only available with a vendor id");
    IdentifierIssuerService service = IdentifierIssuerService(identifierIssuerServiceAddress);
    return service.requestVulnerabilityIdentifier();
  }
}