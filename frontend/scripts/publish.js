import {create, globSource} from "ipfs-http-client";

const ipfs = await create({url: process.argv[2]});
//const address = "ipfs/k51qzi5uqu5dmjabueumy621fbdczkie0z0sa1vq57kjet242lcum9opm1qvbl";

//options specific to globSource
const globSourceOptions = { recursive: true };
  
//example options to pass to IPFS
const addOptions = { pin: true, wrapWithDirectory: true, timeout: 60000 };

var results = [];
for await (const file of ipfs.addAll(globSource(process.argv[3].toString(), "**/*", globSourceOptions), addOptions)) {
    results.push(file);
}
for await (let result of results) {
    if (result.path === '') { // this is the directory itself
        const res = await ipfs.name.publish("/ipfs/" + results[0].cid.toString());
        console.log(`https://gateway.ipfs.io/ipns/${res.name}`);
    }
}