var as = artifacts.require("./AnnouncementService.sol");

module.exports = function(deployer) {
    deployer.deploy(as);
};