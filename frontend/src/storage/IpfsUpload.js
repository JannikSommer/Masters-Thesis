export async function uploadToIpfs (ipfs, file) {
    const { cid } = await ipfs.add(file);
    return cid.toString();
}