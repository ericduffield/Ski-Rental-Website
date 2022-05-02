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

        // Get rid of foreign key constraints while creating the database
        const noForeignKeys = 'SET foreign_key_checks = 0';

        await connection.execute(noForeignKeys)
            .catch((error) => { throw new SystemError("SQL Execution Error - Foreign Key Cancel"); 
        });

        // User Types
        const userTypes = 'CREATE TABLE IF NOT EXISTS userTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';

        await connection.execute(userTypes)
            .catch((error) => { throw new SystemError("SQL Execution Error - User Types"); 
        });        

        // Item Types
        const itemTypes = 'CREATE TABLE IF NOT EXISTS itemTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';

        await connection.execute(itemTypes)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        // Inventory
        const inventory = 'CREATE TABLE IF NOT EXISTS inventory(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL, description varchar(50) NOT NULL, itemCost decimal NOT NULL, rentalState boolean NOT NULL, itemType int NOT NULL, FOREIGN KEY (itemType) REFERENCES itemTypes(id))';

        await connection.execute(inventory)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        // Users
        const users = 'CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userType int NOT NULL, username varchar(50) NOT NULL, password varchar(50), firstName varchar(50) NOT NULL, lastName varchar(50) NOT NULL, credit decimal NOT NULL, FOREIGN KEY (userType) REFERENCES userTypes(id))';

        await connection.execute(users)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        // Rentals
        const rentals = 'CREATE TABLE IF NOT EXISTS rentals(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userId int NOT NULL, productId int NOT NULL, startTime time NOT NULL, endTime time NOT NULL, FOREIGN KEY (userId) REFERENCES Users(id), FOREIGN KEY (productId) REFERENCES products(id))';

        await connection.execute(rentals)
            .catch((error) => { throw new SystemError("SQL Execution Error - Rentals"); 
        });

        // Products
        const products = 'CREATE TABLE IF NOT EXISTS products(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL, description varchar(50) NOT NULL, rentalCost decimal NOT NULL, productId int, bundleId int, FOREIGN KEY (productId) REFERENCES inventory(id), FOREIGN KEY (bundleId) REFERENCES bundles(id))';

        await connection.execute(products)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        // Bundles
        const bundles = 'CREATE TABLE IF NOT EXISTS bundles(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, productId int NOT NULL, bootId int NOT NULL, poleId int, helmetId int NOT NULL, FOREIGN KEY (productId) REFERENCES products(id), FOREIGN KEY (bootId) REFERENCES products(id), FOREIGN KEY (poleId) REFERENCES products(id), FOREIGN KEY (helmetId) REFERENCES products(id))';

        await connection.execute(bundles)
            .catch((error) => { throw new SystemError("SQL Execution Error - Products"); 
        });

        // Add both user types
        const userTypeQuery = 'INSERT INTO userTypes (name) VALUES ("Admin"), ("User")';
        await connection.execute(userTypeQuery)
            .catch((error) => { throw new SystemError("SQL Execution Error - Adding User Types");
        });

        // Add all item types
        const itemTypeQuery = 'INSERT INTO itemTypes (name) VALUES ("Boots"), ("Poles"), ("Helmets"), ("Skis"), ("Snowboards"), ("Bundles")';
        await connection.execute(itemTypeQuery)
            .catch((error) => { throw new SystemError("SQL Execution Error - Adding Item Types");
        });

        // Set back foreign key constraints
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

// ----------------------- Users -----------------------

/**
 * Validates all the new user fields then creates the user in the db
 * @param {*} userType The type of the new user
 * @param {*} username The username of the new user
 * @param {*} password The password of the new user
 * @param {*} firstName The first name of the new user
 * @param {*} lastName The last name of the new user
 * @param {*} credit The credit in the account of the new user
 * @returns an object of the added user
 * @throws UserDataError if user sends invalid data
 * @throws SystemError If there is an error in the database while adding
 */
async function createUser(userType, username, password, firstName, lastName, credit){
    if (!validate.isValidUserType(userType)) {
        throw new UserDataError("Invalid user type");
    }
    if (!validate.isValidUsername(username)) {
        throw new UserDataError("Invalid username");
    }
    if (!validate.isValidPassword(password)) {
        throw new UserDataError("Invalid password");
    }
    if (!validate.isValidFirstName(firstName)) {
        throw new UserDataError("Invalid first name");
    }
    if (!validate.isValidLastName(lastName)) {
        throw new UserDataError("Invalid last name");
    }
    if (!validate.isValidCredit(credit)) {
        throw new UserDataError("Invalid credit");
    }    

    const sqlQuery = 'INSERT INTO users (userType, username, password, firstName, lastName, credit) VALUES ('
        + userType + ',\"' + username + '\",\"' + password + '\",\"' + firstName + '\",\"' + lastName + '\",\"' + credit + '\")';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding user");
        });

        return { "userType": userType, "username": username, "password": password, "firstName": firstName, "lastName": lastName, "credit": credit };
}
/**
 * Edits all the fields for a user from its id
 * @param {*} id The id of the user to update
 * @param {*} userType The new user type of the user
 * @param {*} username The new username of the user
 * @param {*} password The new password of the user
 * @param {*} firstName The new first name of the user
 * @param {*} lastName The new last name of the user
 * @param {*} credit The new credit of the user
 * @returns An object of the user
 * @throws UserDataError if user sends invalid data
 * @throws SystemError If there is an error in the database while updating
 */
async function editUser(id, userType, username, password, firstName, lastName, credit){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }    
    if (!validate.isValidUserType(userType)) {
        throw new UserDataError("Invalid user type");
    }
    if (!validate.isValidUsername(username)) {
        throw new UserDataError("Invalid username");
    }
    if (!validate.isValidPassword(password)) {
        throw new UserDataError("Invalid password");
    }
    if (!validate.isValidFirstName(firstName)) {
        throw new UserDataError("Invalid first name");
    }
    if (!validate.isValidLastName(lastName)) {
        throw new UserDataError("Invalid last name");
    }
    if (!validate.isValidCredit(credit)) {
        throw new UserDataError("Invalid credit");
    } 

    const sqlQuery = 'UPDATE users SET userType = ' + userType + ', username = \'' + username + '\', password = \'' + password + '\', firstName = \'' + firstName + '\', lastName = \'' + lastName + '\', credit = \'' + credit + '\' WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error editing user");
        }
    );
    return { "userType": userType, "username": username, "password": password, "firstName": firstName, "lastName": lastName, "credit": credit };
}
/**
 * Deletes a user that has the specified id
 * @param {*} id The id of the user to delete 
 * @throws UserDataError if user sends invalid data
 * @throws SystemError if there is an error in the database while deleting
 */
async function deleteUser(id){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'DELETE FROM users WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error deleting user");
        });
}
/**
 * Returns an object with all the user fields from the user with the specified id
 * @param {*} id The id of the user to get
 * @throws UserDataError if user sends invalid data
 * @throws SystemError if there is an error in the database while deleting
 */
async function getUserById(id){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'SELECT * FROM users WHERE id = ' + id;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    return result[0][0];
}

// ----------------------- Inventory -----------------------
/**
 * Adds an item to the inventory
 * @param {*} name The name of the item to add
 * @param {*} description The description of the item to add
 * @param {*} cost The cost of the item to add
 * @param {*} isRented Whether or not the item is being rented
 * @param {*} itemType The type of the item to add
 * @throws UserDataError if user sends invalid data
 * @throws SystemError if there is an error in the database while deleting
 */
async function addItem(name, description, itemCost, itemType){
    if (!validate.isValidName(name)) {
        throw new UserDataError("Invalid name");
    }
    if (!validate.isValidDescription(description)) {
        throw new UserDataError("Invalid description");
    }
    if (!validate.isValidCost(itemCost)) {
        throw new UserDataError("Invalid cost");
    }
    if (!validate.isValidItemType(itemType)) {
        throw new UserDataError("Invalid item type");
    }

    const sqlQuery = 'INSERT INTO inventory (name, description, itemCost, isRented, itemType) VALUES (\"' + name + '\",\"' + description + '\",\"' + itemCost + '\", false,(SELECT id FROM itemType where name = \"' + itemType + '\"))';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding item");
    });
}
/**
 * Edits an item from the given id
 * @param {*} id The id of the item to edit
 * @param {*} name The updated name of the item
 * @param {*} description The updated description of the item
 * @param {*} itemCost The updated cost of the item
 * @param {*} rentalState The updated rental state of the item
 * @param {*} itemType The updated type of the item
 */
async function editItem(id, name, description, itemCost, rentalState, itemType){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }    
    if (!validate.isValidName(name)) {
        throw new UserDataError("Invalid name");
    }
    if (!validate.isValidDescription(description)) {
        throw new UserDataError("Invalid description");
    }
    if (!validate.isValidCost(itemCost)) {
        throw new UserDataError("Invalid cost");
    }
    if (!validate.isValidItemType(itemType)) {
        throw new UserDataError("Invalid item type");
    }
    if (!validate.isValidRentalState(rentalState)) {
        throw new UserDataError("Invalid rental state");
    }

    const sqlQuery = 'UPDATE inventory SET name = \'' + name + '\', description = \'' + description + '\', itemCost = \'' + itemCost + '\', isRented = ' + rentalState + ', itemType = (SELECT id FROM itemType where name = \'' + itemType + '\') WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error editing item");
        }
    );
}

/**
 * Updated the rental status of an item
 * @param {*} id The id of the item to update
 * @param {*} rentalState The updated rental state
 */
async function editItemRentalState(id, rentalState){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }    
    if (!validate.isValidRentalState(rentalState)) {
        throw new UserDataError("Invalid rental state");
    }

    const sqlQuery = 'UPDATE inventory SET isRented = ' + rentalState + ' WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error editing item");
        }
    );
}

/**
 * Deletes an item from the inventory.
 * @param {*} id The id of the item to be deleted
 */
async function deleteItem(id){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'DELETE FROM inventory WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error deleting item");
        });
}

/**
 * Returns an item from the inventory
 * @param {*} id The id of the item to be returned
 * @returns the item being returned
 */
async function getItemById(id){
    if(!isValid.isValidId(id)){
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'SELECT * FROM inventory WHERE id = ' + id;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item");
        });
    return result[0][0];
}

/**
 * Returns an array of all the items in the inventory
 * @returns an array of all the items in the inventory
 */
async function getAllItems(){
    const sqlQuery = 'SELECT * FROM inventory';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item");
        });
    return result[0];
}

// ----------------------- Rentals -----------------------

// ----------------------- Error Classes -----------------------
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