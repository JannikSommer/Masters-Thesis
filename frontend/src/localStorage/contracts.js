import { LS_KEY_CON } from "../config";

class Contracts {

    /**
     * @readonly
     * The list of confidential contracts.
     */
    contracts = [];

    /**
     * Loads the contracts from local storage.
     */
    load() {
        const contractsJSON = localStorage.getItem(LS_KEY_CON);
        if(contractsJSON === null) return;
        contracts = JSON.parse(contractsJSON);
    }
    
    /**
     * Saves the contracts to local storage.
     */
    save() {
        localStorage.setItem(
            LS_KEY_PWL,
            JSON.stringify(localWhitelist.current)
        );
    }
    
    /**
     * Adds a new contract to the list.
     * @param {String} address A valid Ethereum address.
     * @param {String} vendorName A name or note to identify the address.
     */
    addContract(address, vendorName = undefined) {        
        const contract = {
            "address": address,
        };
        if(!vendorName) vendor["vendorName"] = vendorName;
    
        if(this.contracts.includes(contract)) return;

        contracts.push = contract;
        saveContracts();
    }

    /**
     * Removes a contract from the list.
     * @param {String} address A valid Ethereum address.
     */
    removeContract(address) {
        this.contracts = this.contracts.filter((x) => {
            return x["address"] !== address;
        });
    }
}

export default Contracts;