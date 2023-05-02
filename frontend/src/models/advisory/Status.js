/**
 * Specifies the types of status a product version can have regarding a vulnerability.
 */
const Status = Object.freeze({
    Fixed: "fixed", 
    KnownAffected: "known_affected",
    KnownNotAffected: "known_not_affected", 
    UnderInvestigation: "under_investigation", 
});
export default Status;