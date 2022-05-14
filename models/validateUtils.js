const validator = require('validator');

function isValidUserType(userType) {
    if (userType == '0' || userType == '1') {
        return true;
    }
    return false;
}
function isValidAlphanumeric(string) {
    if (validator.isAlphanumeric(validator.blacklist(string, ' '))) {
        return true;
    }
    return false;
}
function isValidPassword(password) {
    if (validator.isStrongPassword(password)) {
        return true;
    }
    return false;
}
function isValidDecimal(decimal) {
    if (validator.isDecimal(decimal)) {
        return true;
    }
    return false;
}
function isValidInteger(integer) {
    if (validator.isInt(integer)) {
        return true;
    }
    return false;
}
function isValidBoolean(boolean) {
    if (validator.isBoolean(boolean)) {
        return true;
    }
    return false;
}


function isValidItemType(itemType) {
    //TODO
    return true;
}
function isValidRentalState(rentalState) {
    //TODO
    return true;
}
function isValidStartTime(startTime) {
    //TODO
    return true;
}
function isValidEndTime(endTime) {
    //TODO
    return true;
}
function isValidDuration(duration) {
    //TODO
    return true;
}
function isValidCredit(credit) {
    //TODO
    return true;
}

module.exports = {
    isValidUserType,
    isValidAlphanumeric,
    isValidPassword,
    isValidDecimal,
    isValidInteger,
    isValidBoolean,
    isValidItemType,
    isValidRentalState,
    isValidStartTime,
    isValidEndTime,
    isValidDuration
}