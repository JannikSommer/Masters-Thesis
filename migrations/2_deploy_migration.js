var vendor = artifacts.require("./Vendor.sol");
var as = artifacts.require("./AnnouncementService.sol");

module.exports = function(deployer) {
    deployer.deploy(vendor);
    deployer.deploy(as);
};