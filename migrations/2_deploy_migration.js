var vendor = artifacts.require("./Vendor.sol");
var as = artifacts.require("./AnnouncementService.sol");
var iis = artifacts.require("./IdentifierIssuerService.sol");
var private = artifacts.require("./Private.sol");

module.exports = async function(deployer) {
    // announcment service
    await deployer.deploy(as);
    const as_instanse = await as.deployed(); 

    // identifier issuer service
    await deployer.deploy(iis); 
    const iis_instance = await iis.deployed(); 

    // vendor 1
    await deployer.deploy(vendor, "SommerSoftware Inc.", as_instanse.address, iis_instance.address); 
    const vendor_instance1 = await vendor.deployed();
    await vendor_instance1.announceNewAdvisory("CSAFPID-0001,CSAFPID-0002,CSAFPID-0003,CSAFPID-0004,CSAFPID-0005,CSAFPID-0006", "QmPQuXq1JuipvhLKdDz84eSM3tLbESjDAKeAHNzScjZz7Y"); 

    // vendor 2
    await deployer.deploy(vendor, "SommerSoftware Inc.", as_instanse.address, iis_instance.address); 
    const vendor_instance2 = await vendor.deployed();
    await vendor_instance2.announceNewAdvisory("CSAFPID-0001,CSAFPID-0002,CSAFPID-0003,CSAFPID-0004,CSAFPID-0005,CSAFPID-0006", "QmPQuXq1JuipvhLKdDz84eSM3tLbESjDAKeAHNzScjZz7Y"); 


    await deployer.deploy(private); 
    const private_instance = await private.deployed();
};


async function setupNetwork() {

}