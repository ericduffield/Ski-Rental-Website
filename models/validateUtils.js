const validator = require('validator');

function isValidUserType(userType) {
    if (userType === '0' || userType === '1') {
        return true;
    }
    return false;
}
function isValidUsername(username) {
    if (validator.isAlphanumeric(username)) {
        return true;
    }
    return false;
}
function isValidDescription(description) {
    if (validator.isAlphanumeric(description)) {
        return true;
    }
    return false;
}
function isValidPassword(passsword) {
    if (validator.isStrongPassword(passsword)) {
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
function isValidName(name) {
    if (validator.isAlpha(name)) {
        return true;
    }
    return false;
}

module.exports = {
    isValidUserType,
    isValidUsername,
    isValidDescription,
    isValidPassword,
    isValidDecimal,
    isValidInteger,
    isValidBoolean,
    isValidName
}