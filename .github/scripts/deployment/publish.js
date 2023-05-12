import {create, globSource} from "ipfs-http-client";

const ipfs = await create({url: process.argv[2]});
console.log("IPFS node connection established");

//options specific to globSource
const globSourceOptions = { recursive: true };
  
//example options to pass to IPFS
const options = { wrapWithDirectory: true, timeout: 60000 };

var results = [];
for await (const file of ipfs.addAll(globSource(process.argv[3].toString(), "**/*", globSourceOptions), options)) {
    results.push(file);
}
console.log("IPFS directory/files added to host node.");

for await (let result of results) {
    if (result.path === '') { // this is the wrapping directory
        const res = await ipfs.name.publish("/ipfs/" + result.cid.toString(), {key: "self"});
        console.log("IPNS key updated.");
        console.log(`https://gateway.ipfs.io/ipns/${res.name}`);
    }
}