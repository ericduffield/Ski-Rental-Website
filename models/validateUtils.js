const validator = require('validator');

/**
 * Checks if name and price are valid.
 * This function is called before adding to the database to make sure the data is valid.
 * @param {*} name name of the ski equipment
 * @param {*} price price of the ski equipment
 * @returns returns true if the data is valid, false otherwise
 */
function isValid(name, price) {
    return isValidName(name) && isValidPrice(price);
}

function isValidName(name) {
    if (validator.isEmpty(name)) {
        console.log('Name cannot be empty string');
        return false;
    }
    else if (!validator.isAlpha(name)) {
        console.log('Name cannot contain numbers');
        return false;
    }
    return true;
}

function isValidPrice(price) {
    if (price <= 0) {
        console.log('Price must be greater than 0');
        return false;
    }
    if (price > 10000) {
        console.log('Price must be smaller than 10000');
        return false;
    }
    if (!validator.isDecimal(price)) {
        console.log('Price must be a number.');
        return false;
    }
    return true;
}
module.exports = {
    isValid,
    isValidName,
    isValidPrice
}