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
            set 
            const dropQuery = "SET foreign_key_checks = 0; DROP TABLE userTypes; DROP TABLE users; DROP TABLE rentals; DROP TABLE itemTypes; DROP TABLE inventory; DROP TABLE products; DROP TABLE bundles;SET foreign_key_checks = 0;";
            await connection.execute(dropQuery);
            logger.info("Dropped all tables");
        }           

        const noForeignKeys = 'SET foreign_key_checks = 0';

        await connection.execute(noForeignKeys)
            .catch((error) => { throw new SystemError("SQL Execution Error - Foreign Key Cancel"); 
        });

        const userTypes = 'CREATE TABLE IF NOT EXISTS userTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';

        await connection.execute(userTypes)
            .catch((error) => { throw new SystemError("SQL Execution Error - User Types"); 
        });        

        const itemTypes = 'CREATE TABLE IF NOT EXISTS itemTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';

        await connection.execute(itemTypes)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        const inventory = 'CREATE TABLE IF NOT EXISTS inventory(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL, description varchar(50) NOT NULL, itemCost decimal NOT NULL, itemType int NOT NULL, FOREIGN KEY (itemType) REFERENCES itemTypes(id))';

        await connection.execute(inventory)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        const users = 'CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userType int NOT NULL, username varchar(50) NOT NULL, password varchar(50), firstName varchar(50) NOT NULL, lastName varchar(50) NOT NULL, credit decimal NOT NULL, FOREIGN KEY (userType) REFERENCES userTypes(id))';

        await connection.execute(users)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        const rentals = 'CREATE TABLE IF NOT EXISTS rentals(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userId int NOT NULL, productId int NOT NULL, startTime time NOT NULL, endTime time NOT NULL, FOREIGN KEY (userId) REFERENCES Users(id), FOREIGN KEY (productId) REFERENCES products(id))';

        await connection.execute(rentals)
            .catch((error) => { throw new SystemError("SQL Execution Error - Rentals"); 
        });

        const products = 'CREATE TABLE IF NOT EXISTS products(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL, description varchar(50) NOT NULL, rentalCost decimal NOT NULL, productId int, bundleId int, FOREIGN KEY (productId) REFERENCES inventory(id), FOREIGN KEY (bundleId) REFERENCES bundles(id))';

        await connection.execute(products)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        const bundles = 'CREATE TABLE IF NOT EXISTS bundles(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, productId int NOT NULL, bootId int NOT NULL, poleId int, helmetId int NOT NULL, FOREIGN KEY (productId) REFERENCES products(id), FOREIGN KEY (bootId) REFERENCES products(id), FOREIGN KEY (poleId) REFERENCES products(id), FOREIGN KEY (helmetId) REFERENCES products(id))';

        await connection.execute(bundles)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        const ForeignKeys = 'SET foreign_key_checks = 1';

        await connection.execute(ForeignKeys)
            .catch((error) => { throw new SystemError("SQL Execution Error - Foreign Key Back On"); 
        });
        
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