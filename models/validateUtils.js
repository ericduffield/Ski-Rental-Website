const validator = require('validator');

function isValidUserType(userType){
    if(userType.toLowerCase() == 'user' || userType.toLowerCase() == 'admin'){
        return true;
    }
    return false;
}
function isValidUsername(username){
    if(validator.isAlphanumeric(username)){
        return true;
    }
    return false;
}
function isValidPassword(password){
    if(validator.isStrongPassword(password)){
        return true;
    }
    return false;
}
function isValidDecimal(decimal){
    if(validator.isDecimal(decimal)){
        return true;
    }
    return false;
}
function isValidInteger(integer){
    integer = integer.toString();
    if(validator.isInt(integer)){
        return true;
    }
    return false;
}
function isValidBoolean(boolean){
    if(validator.isBoolean(boolean)){
        return true;
    }
    return false;
}
function isValidName(name){
    if(validator.isAlpha(name)){
        return true;
    }
    return false;
}
function isValidTime(time){
    if(validator.isISO8601(time)){
        return true;
    }
    return false;
}

module.exports = {
    isValidUserType,
    isValidUsername,
    isValidPassword,
    isValidDecimal,
    isValidInteger,
    isValidBoolean,
    isValidName,
    isValidTime
}