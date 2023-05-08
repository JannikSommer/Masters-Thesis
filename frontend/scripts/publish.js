import {create, globSource} from "ipfs-http-client";

const ipfs = await create({host: process.argv[2], protocol: "https"});
console.log(ipfs);
//const address = "ipfs/k51qzi5uqu5dmjabueumy621fbdczkie0z0sa1vq57kjet242lcum9opm1qvbl";

//options specific to globSource
const globSourceOptions = { recursive: true };
  
//example options to pass to IPFS
const addOptions = { pin: true, wrapWithDirectory: true, timeout: 10000 };

var response = await ipfs.addAll(globSource(process.argv[3], globSourceOptions), addOptions);
console.log(response);

const res = await ipfs.name.publish("/ipfs/" + response[0].cid.toString());
console.log(`https://gateway.ipfs.io/ipns/${res.name}`);