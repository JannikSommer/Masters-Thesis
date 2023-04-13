import { LS_KEY_CON } from "../config";

class Contracts {
    /**
     * Loads the contracts from local storage.
     * @returns {[]} A list of contracts.
     */
    static load() {
        const contractsJSON = localStorage.getItem(LS_KEY_CON);
        if(contractsJSON === null) return;
        return JSON.parse(contractsJSON);
    }
    
    /**
     * Saves the contracts to local storage.
     * @param {[]} contracts An array of contracts.
     */
    static save(contracts) {
        localStorage.setItem(
            LS_KEY_CON,
            JSON.stringify(contracts)
        );
    }
    
    /**
     * Adds a new contract to the list.
     * @param {[]} contracts An array of contracts.
     * @param {String} address A valid Ethereum address.
     * @param {String} vendorName A name or note to identify the address.
     */
    static addContract(contracts, address, vendorName = undefined) {        
        const contract = {
            "address": address,
        };
        if(vendorName) contract["vendorName"] = vendorName;

        if(contracts.includes(contract)) return contracts;
        return contracts.concat([contract]);
    }

    /**
     * Removes a contract from the list.
     * @param {[]} contracts A list of contracts.
     * @param {String} address A valid Ethereum address.
     */
    static removeContract(contracts, address) {
        return contracts.filter((x) => {
            return x["address"] !== address;
        });
    }

    static updateKey(contracts, address, key) {
        const contract = {
            "address": address,
        }
        
        const existing = contracts.indexOf(contract);
        console.log(existing);
        if(existing !== -1) {
            return [...contracts][existing]["privateKey"] = key;
        } else {
            contract["privateKey"] = key;
            return contracts.concat([contract]);
        }
    }
}

export default Contracts;