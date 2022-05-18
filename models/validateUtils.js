const validator = require('validator');
var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

function isValidUserType(userType) {
    if (userType == '1' || userType == '2') {
        return true;
    }
    return false;
}
function isValidAlphanumeric(string) {
    if (validator.isAlphanumeric(validator.blacklist(string, ' '))) {
        return true;
    }
    return string != '' && !string.match(format);
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
    integer = integer.toString();
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

function isValidDescription(description) {
    return description != '';
}

function isValidItemType(itemType) {
    return itemType != '' && itemType >= 0 && itemType <= 7;
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

function isValidName(name) {
    if (validator.isAlpha(name)) {
        return true;
    }
    return false;
}
function isValidTime(time) {
    if (validator.isISO8601(time)) {
        return true;
    }
    return false;
}


module.exports = {
    isValidUserType,
    isValidAlphanumeric,
    isValidPassword,
    isValidDecimal,
    isValidInteger,
    isValidBoolean,
    isValidItemType,
    isValidStartTime,
    isValidEndTime,
    isValidDuration,
    isValidDescription,
    isValidName,
    isValidTime
}