import { LS_KEY_PWD } from "../config";

export class PasswordData {

    /**
     * Saves password data to localStorage.
     * @param {{hash: String, salt: String, iv: String}} passwordData 
     */
    static async save(passwordData) {
        localStorage.setItem(LS_KEY_PWD, JSON.stringify(passwordData));
    }

    /**
     * Load password data from local storage.
     * @returns {{hash: String, salt: String, iv: String}}
     */
    static async load() {
        return JSON.parse(localStorage.getItem(LS_KEY_PWD));
    }
}