const mysql = require('mysql2/promise');
const validate = require('./validateUtils');

const logger = require('../logger');

var connection;


/**
 * Inject database name so we can use this model for both testing and main program without overwriting our main database.
 * @param {*} dbname name of database
 * @param {*} reset boolean to reset database
 * @throws SystemError if connection fails
 */
async function initialize(dbname, reset) {
    try {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            port: '10000',
            password: 'pass',
            database: dbname
        });

        if (reset) {
            const dropQuery = "DROP TABLE IF EXISTS skiEquipment";
            await connection.execute(dropQuery);
            logger.info("Table skiEquipment dropped");
        }
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS skiEquipment(id int AUTO_INCREMENT, name VARCHAR(50), price DECIMAL(5,2), PRIMARY KEY(id))';

        await connection.execute(sqlQuery)
            .catch((error) => { throw new SystemError("SQL Execution Error"); });
    }
    catch (error) {
        throw new SystemError("SQL Execution Error");
    }
}


//Get for connection
function getConnection() {
    return connection;
}

/**
 * Adds the given skiEquipment to the db if  valid and returns that skiEquipment as an object
 * @param {*} name name of skiEquipment
 * @param {*} price price of skiEquipment
 * @returns object that represents the ski equipment
 * @throws UserDataError if user sends invalid data or SystemError if database error
 */
async function addSkiEquipment(name, price) {
    if (!validate.isValid(name, price)) {
        throw new UserDataError("Invalid name or price");
    }

    const sqlQuery = 'INSERT INTO skiEquipment (name, price) VALUES (\"'
        + name + '\",\"' + price + '\")';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding ski equipment");
        });

    return { "name": name, "price": price };
}


/**
 * Lists all the ski equipment in the database.
 * @returns object that represents the ski equipment if it exists
 * @throws UserDataError if user sends invalid data or SystemError if database error
 */
async function listSkiEquipment() {
    const sqlQuery = 'SELECT name, price FROM skiEquipment';
    let [rows, fields] = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting ski equipment");
        });

    if (rows.length == 0) {
        throw new UserDataError("Error. No ski equipment in database");
    }
    return rows;
}

/**
 * Checks if the ski equipment with the specified name exists in the database.
 * @param {*} name name of the ski equipment
 * @returns arrays that represents all ski equipment in the database
 * @throws UserDataError if user sends invalid data or SystemError if database error
 */
async function findByName(name) {
    if (!validate.isValidName(name))
        throw new SystemError("Error invalid name");

    const sqlQuery = 'SELECT name, price FROM skiEquipment WHERE name = ?';
    let [rows, fields] = await connection.execute(sqlQuery, [name])
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error finding ski equipment");
        });
    //If empty rows then not found
    if (rows.length == 0) {
        throw new UserDataError("Error. Ski equipment not found in database");
    }
    return {
        "name": rows[0].name,
        "price": Number(rows[0].price)
    }
}

/**
 * Replaces the ski equipment with the specified name with the new name and price.
 * @param {*} originalName original name of the ski equipment
 * @param {*} newName new name of the ski equipment
 * @param {*} newPrice new price of the ski equipment
 * @returns object that represents the new ski equipment
 * @throws UserDataError if user sends invalid data or SystemError if database error
 */
async function replaceSkiEquipment(originalName, newName, newPrice) {
    if (!validate.isValidName(originalName))
        throw new UserDataError("Error invalid original name");

    if (!validate.isValid(newName, newPrice))
        throw new UserDataError("Error invalid new name or new price");

    try {
        await findByName(originalName);
    }
    catch (err) {
        throw new SystemError("Error ski equipment not found");
    }

    const sqlQuery = 'UPDATE skiEquipment SET name = ?, price = ? WHERE name = ?';
    await connection.execute(sqlQuery, [newName, newPrice, originalName])
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error updating ski equipment");
        });
    return {
        "name": newName,
        "price": newPrice
    }
}

/**
 * Deletes the ski equipment with the specified name.
 * @param {*} name name of the ski equipment
 * @throws UserDataError if user sends invalid data or SystemError if database error
 */
async function deleteSkiEquipment(name) {
    if (!validate.isValidName(name))
        throw new SystemError("Error invalid name");

    try {
        await findByName(name);
    }
    catch (err) {
        throw new SystemError("Error ski equipment not found");
    }

    const sqlQuery = 'DELETE FROM skiEquipment WHERE name = ?';
    await connection.execute(sqlQuery, [name])
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error deleting ski equipment");
        });
}

//Error if user gives invalid name or price
class UserDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserDataError";
        this.status = 400;
    }
}

//Error for SQL execution error
class SystemError extends Error {
    constructor(message) {
        super(message);
        this.name = "SystemError";
        this.status = 500;
    }
}

module.exports = {
    initialize,
    addSkiEquipment,
    getConnection,
    listSkiEquipment,
    findByName,
    replaceSkiEquipment,
    deleteSkiEquipment
}