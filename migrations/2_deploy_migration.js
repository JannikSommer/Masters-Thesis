var vendor = artifacts.require("./Vendor.sol");
var as = artifacts.require("./AnnouncementService.sol");
var iis = artifacts.require("./IdentifierIssuerService.sol");
var private = artifacts.require("./Private.sol");

// Do not remove network as it cuases accounts to no longer work...
module.exports = async function(deployer, network, accounts) {
    // announcment service
    await deployer.deploy(as);
    const as_instanse = await as.deployed(); 

    // identifier issuer service
    await deployer.deploy(iis); 
    const iis_instance = await iis.deployed(); 

    // vendor 1
    let v1w = accounts[0];
    await deployer.deploy(vendor, "SommerSoftware Inc.", as_instanse.address, iis_instance.address, {from: v1w}); // "from" must be places last
    const vendor_instance1 = await vendor.deployed();
    await vendor_instance1.announceNewAdvisory(1, "CSAFPID-0001,CSAFPID-0002,CSAFPID-0003,CSAFPID-0004,CSAFPID-0005,CSAFPID-0006", "QmPQuXq1JuipvhLKdDz84eSM3tLbESjDAKeAHNzScjZz7Y", {from: v1w});

    //vendor 2
    // let v2w = accounts[1]; // vendor 2 wallet
    // await deployer.deploy(vendor, "BigMag Inc.", as_instanse.address, iis_instance.address, {from: v2w}); 
    // const vendor_instance2 = await vendor.deployed();
    // await vendor_instance2.announceNewAdvisory("CSAFPID-0001,CSAFPID-0002", "QmPQuXq1JuipvhLKdDz84eSM3tLbESjDAKeAHNzScjZz7Y", {from: v2w});


    await deployer.deploy(private); 
    const private_instance = await private.deployed();
};