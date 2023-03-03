var vendor = artifacts.require("./Vendor.sol");
var as = artifacts.require("./AnnouncementService.sol");
var iis = artifacts.require("./IdentifierIssuerService.sol");

module.exports = function(deployer) {
    deployer.deploy(vendor);
    deployer.deploy(as);
    deployer.deploy(iis);
};