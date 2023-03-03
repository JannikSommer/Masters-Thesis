var vendor = artifacts.require("./Vendor.sol");
var as = artifacts.require("./AnnouncementService.sol");
var iis = artifacts.require("./IdentifierIssuerService.sol");

module.exports = function(deployer) {
    deployer.deploy(as);
    deployer.deploy(iis).then( () => {
        deployer.deploy(vendor, "Sommer Software Inc", as.address, iis.address);
    })
    
};