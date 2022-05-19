const mysql = require('mysql2/promise');
const validate = require('./validateUtils');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const uuid = require('uuid');


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



        // Get rid of foreign keys
        const noForeignKeys = 'SET foreign_key_checks = 0';
        await connection.execute(noForeignKeys)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - Foreign Key Cancel");
            });

        if (reset) {

            const dropUsers = 'DROP TABLE IF EXISTS users';
            await connection.execute(dropUsers)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - Drop users");
                }
                );

            const dropRentals = 'DROP TABLE IF EXISTS rentals';
            await connection.execute(dropRentals)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - DROP TABLE rentals");
                }
                );

            const dropInventory = 'DROP TABLE IF EXISTS inventory';
            await connection.execute(dropInventory)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - DROP TABLE inventory");
                }
                );

            const dropItemTypes = 'DROP TABLE IF EXISTS itemTypes';
            await connection.execute(dropItemTypes)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - DROP TABLE itemTypes");
                }
                );

            const dropUserTypes = 'DROP TABLE IF EXISTS userTypes';
            await connection.execute(dropUserTypes)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - DROP TABLE userTypes");
                }
                );

            const dropSessions = 'DROP TABLE IF EXISTS sessions';
            await connection.execute(dropSessions)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - DROP TABLE sessions");
                }
                );
        }

        // User Types
        const userTypes = 'CREATE TABLE IF NOT EXISTS userTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';
        await connection.execute(userTypes)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - User Types");
            }
            );

        // Item Types
        const itemTypes = 'CREATE TABLE IF NOT EXISTS itemTypes(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL)';
        await connection.execute(itemTypes)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - item Types");
            }
            );

        // Inventory
        const inventory = 'CREATE TABLE IF NOT EXISTS inventory(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, name varchar(50) NOT NULL, description varchar(500) NOT NULL, itemCost DECIMAL(18,2) NOT NULL, itemType int NOT NULL, FOREIGN KEY (itemType) REFERENCES itemTypes(id))';
        await connection.execute(inventory)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - inventory");
            }
            );

        // Users
        const users = 'CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userType int NOT NULL DEFAULT 0, username varchar(50) NOT NULL, password varchar(250), firstName varchar(50) NOT NULL, lastName varchar(50) NOT NULL, credit DECIMAL(18,2) NOT NULL, FOREIGN KEY (userType) REFERENCES userTypes(id))';
        await connection.execute(users)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - Users");
            }
            );

        // Rentals
        const rentals = 'CREATE TABLE IF NOT EXISTS rentals(id int AUTO_INCREMENT NOT NULL PRIMARY KEY, userId int NOT NULL, itemId int NOT NULL, startTime varchar(100) NOT NULL, endTime varchar(100) NOT NULL, rentalPrice decimal NOT NULL, duration int NOT NULL, FOREIGN KEY (userId) REFERENCES Users(id), FOREIGN KEY (itemId) REFERENCES inventory(id))';
        await connection.execute(rentals)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - Rentals");
            }
            );

        // Sessions.
        const sessions = 'CREATE TABLE IF NOT EXISTS sessions(id varchar(50) NOT NULL PRIMARY KEY, userId int NOT NULL, userType varchar(10) NOT NULL, expiresAt varchar(100) NOT NULL, FOREIGN KEY (userId) REFERENCES users(id))';
        await connection.execute(sessions)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - Sessions");
            }
            );

        // Set back foreign key constraints
        const ForeignKeys = 'SET foreign_key_checks = 1';

        await connection.execute(ForeignKeys)
            .catch((error) => {
                throw new SystemError("SQL Execution Error - Foreign Key Back On");
            }
            );

        if (reset) {

            // Add both user types
            const userTypeQuery = 'INSERT INTO userTypes (name) VALUES ("User"), ("Admin")';
            await connection.execute(userTypeQuery)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - Adding User Types");
                }
                );

            // Add all item types
            const itemTypeQuery = 'INSERT INTO itemTypes (name) VALUES ("Boots"), ("Poles"), ("Helmets"), ("Skis"), ("Snowboards"), ("Bundles")';
            await connection.execute(itemTypeQuery)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - Adding Item Types");
                }
                );

            // Add the base admin user
            const p = await bcrypt.hash("P@ssw0rd", saltRounds);
            const addAdmin = `INSERT INTO users (userType, username, password, firstName, lastName, credit) values ((Select id from userTypes where name = "Admin"), "Admin", "${p}", "Admin", "Admin", 0.00)`;
            await connection.execute(addAdmin)
                .catch((error) => {
                    throw new SystemError("SQL Execution Error - Adding Admin");
                }
                );
        }

    }
    catch (error) {
        throw new SystemError(error.message);
    }
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
async function createUser(userType, username, password, firstName, lastName, credit) {
    if (!validate.isValidUserType(userType)) {
        throw new UserDataError("Invalid user type");
    }
    if (!validate.isValidAlphanumeric(username)) {
        throw new UserDataError("Invalid username");
    }
    if (await checkIfUsernameIsTaken(username)) {
        throw new UserDataError("Username is already taken");
    }
    if (!validate.isValidPassword(password)) {
        throw new UserDataError("Invalid password, password must contain an Uppercase letter, a lowercase letter, a number and a special character");
    }
    if (!validate.isValidName(firstName)) {
        throw new UserDataError("Invalid first name");
    }
    if (!validate.isValidAlphanumeric(lastName)) {
        throw new UserDataError("Invalid last name");
    }
    if (!validate.isValidName(lastName)) {
        throw new UserDataError("Invalid last name");
    }
    credit = credit.toString();
    if (!validate.isValidDecimal(credit)) {
        throw new UserDataError("Invalid credit");
    }

    const sqlQuery = 'INSERT INTO users (username, password, firstName, lastName, credit, userType) VALUES (\"' + username + '\",\"' + await bcrypt.hash(password, saltRounds) + '\",\"' + firstName + '\",\"' + lastName + '\",\"' + credit + '\",\"' + userType + '\")';
    try {
        await connection.execute(sqlQuery)
    }
    catch (error) {
        logger.error(error)
        throw new SystemError("Error adding user");
    };
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
async function editUser(id, userType, username, password, firstName, lastName, credit) {
    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    let result = await getUserById(id);
    if (result.length == 0) {
        throw new UserDataError("Invalid id");
    }
    if (!validate.isValidUserType(userType)) {
        throw new UserDataError("Invalid user type");
    }
    if (!validate.isValidAlphanumeric(username)) {
        throw new UserDataError("Invalid username");
    }
    if (!validate.isValidPassword(password)) {
        throw new UserDataError("Invalid password, password must contain one Uppercase, one lowercase, one number and one special character");
    }
    if (!validate.isValidName(firstName)) {
        throw new UserDataError("Invalid first name");
    }
    if (!validate.isValidName(lastName)) {
        throw new UserDataError("Invalid last name");
    }
    if (!validate.isValidDecimal(credit)) {
        throw new UserDataError("Invalid credit");
    }

    const sqlQuery = 'UPDATE users SET userType = ' + userType + ', username = \'' + username + '\', password = \'' + await bcrypt.hash(password, saltRounds) + '\', firstName = \'' + firstName + '\', lastName = \'' + lastName + '\', credit = \'' + credit + '\' WHERE id = ' + id;
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
async function deleteUser(id) {
    let result = await getUserById(id);
    if (result == null) {
        return result;
    }

    if (!validate.isValidInteger(id)) {
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
async function getUserById(id) {
    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'SELECT * FROM users WHERE id = ' + id;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    return result[0][0] ? result[0][0] : null;
}

/**
 * Returns an object with all the user fields for every user
 * @throws SystemError if there is an error in the database while deleting
 * @returns An array of objects with all the user
 */
async function getAllUsers() {
    const sqlQuery = 'SELECT * FROM users';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    return result[0];
}

/**
 * Gets all user fields from the unique username
 * @param {*} username The username of the user
 * @returns All the fields for the given user
 */
async function getUserByUsername(username) {
    if (!validate.isValidAlphanumeric(username)) {
        throw new UserDataError("Invalid username");
    }
    const sqlQuery = 'SELECT * FROM users WHERE username = \'' + username + '\'';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    return result[0][0];
}
/**
 * Checks if a username is taken
 * @param {*} username The username to check
 * @returns False if the username is unique, true if it is taken
 */
async function checkIfUsernameIsTaken(username) {
    if (!validate.isValidAlphanumeric(username)) {
        throw new UserDataError("Invalid username");
    }
    const sqlQuery = 'SELECT * FROM users WHERE username = \'' + username + '\'';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    return result[0].length > 0;
}
/**
 * Verifies login information
 * @param {*} username The username to verify
 * @param {*} password The password to verify
 * @returns true if login information corresponds to a valid user, false otherwise
 */
async function verifyLogin(username, password) {
    if (username && password) {
        const sqlQuery = 'SELECT * FROM users WHERE username = \'' + username + '\'';
        const result = await connection.execute(sqlQuery)
            .catch((error) => {
                logger.error(error)
                throw new SystemError("Error getting user");
            });
        if (result[0].length > 0) {
            if (await bcrypt.compare(password, result[0][0].password)) {
                return true;
            }
        }
        else {
            return false;;
        }
    }
    return false;
}
/**
 * Gets the user type string from its id counterpart
 * @param {*} userType The id of the user type
 * @returns The string version of the id counterpart
 */
async function getUserTypeFromTypeId(userType) {
    if (!validate.isValidInteger(userType)) {
        throw new UserDataError("Invalid user type");
    }
    const sqlQuery = 'SELECT name FROM userTypes WHERE id = ' + userType;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        }
        );
    return result[0][0].name;
}

// ----------------------- Inventory -----------------------
/**
 * Adds an item to the inventory
 * @param {*} name The name of the item to add
 * @param {*} description The description of the item to add
 * @param {*} cost The cost of the item to add
 * @param {*} itemType The type of the item to add
 * @throws UserDataError if user sends invalid data
 * @throws SystemError if there is an error in the database while deleting
 */
async function addItem(name, description, itemCost, itemType) {
    if (!validate.isValidAlphanumeric(name)) {
        throw new UserDataError("Invalid name");
    }
    if (!validate.isValidDescription(description)) {
        throw new UserDataError("Invalid name");
    }
    if (!validate.isValidDecimal(itemCost)) {
        throw new UserDataError("Invalid cost");
    }
    if (!validate.isValidItemType(itemType)) {
        throw new UserDataError("Invalid item type");
    }

    const sqlQuery = 'INSERT INTO inventory (name, description, itemCost, itemType) VALUES (\"' + name + '\",\"' + description + '\",\"' + itemCost + '\",\"' + itemType + '\");';
    await connection.execute(sqlQuery)
        .catch((error) => {
            console.error(error)
            throw new SystemError("Error adding item");
        });
}
/**
 * Edits an item from the given id
 * @param {*} id The id of the item to edit
 * @param {*} name The updated name of the item
 * @param {*} description The updated description of the item
 * @param {*} itemCost The updated cost of the item
 * @param {*} itemType The updated type of the item
 */
async function editItem(id, name, description, itemCost, itemType) {
    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    if (!validate.isValidAlphanumeric(name)) {
        throw new UserDataError("Invalid name");
    }
    if (!validate.isValidDecimal(itemCost)) {
        throw new UserDataError("Invalid cost");
    }
    if (!validate.isValidItemType(itemType)) {
        throw new UserDataError("Invalid item type");
    }

    const sqlQuery = 'UPDATE inventory SET name = \'' + name + '\', description = \'' + description + '\', itemCost = \'' + itemCost + '\', itemType = \'' + itemType + '\';';
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
async function deleteItem(id) {
    let result = await getItemById(id);
    if (result == null) {
        return result;
    }

    if (!validate.isValidInteger(id)) {
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
async function getItemById(id) {
    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    const sqlQuery = 'SELECT * FROM inventory WHERE id = ' + id;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item");
        });
    return result[0][0] ? result[0][0] : null;
}

/**
 * Returns an array of all the items in the inventory
 * @returns an array of all the items in the inventory
 */
async function getAllItems() {
    const sqlQuery = 'SELECT * FROM inventory';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item");
        });
    return result[0];
}

// ---------------------- Item Types ---------------------

/**
 * Adds an item type to the database
 * @param {*} name The name of the item type to add
 */

async function addItemType(name) {
    if (!validate.isValidAlphanumeric(name)) {
        throw new UserDataError("Invalid name");
    }
    if (await getItemTypeByName(name) != null) {
        throw new UserDataError("Name already taken");
    }

    const sqlQuery = 'INSERT INTO itemTypes (name) VALUES (\"' + name + '\")';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding item type");
        });
}

/**
 * Edits an item type from the given id
 * @param {*} id The id of the item type to edit
 * @param {*} name The updated name of the item type
 */
async function editItemType(id, name) {
    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    if (!validate.isValidAlphanumeric(name)) {
        throw new UserDataError("Invalid name");
    }
    if (await getItemTypeByName(name) != null) {
        throw new UserDataError("Name already taken");
    }

    let result = await getItemTypeById(id);

    if (result == null) {
        throw new UserDataError("Error ItemType not in database");
    }

    const sqlQuery = 'UPDATE itemTypes SET name = \'' + name + '\' WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error editing item type");
        }
        );
}

/**
 * Deletes an item type from the database
 * @param {*} id The id of the item type to be deleted
 */
async function deleteItemType(id) {
    let result = await getItemTypeById(id);

    if (result == null) {
        throw new UserDataError("Error ItemType not in database");
    }

    if (!validate.isValidInteger(id)) {
        throw new UserDataError("Invalid id");
    }
    sqlQuery = 'DELETE FROM itemTypes WHERE id = ' + id;
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error);
            throw new SystemError("Error deleting item type");
        });
}

/**
 * Returns an item from database
 * Used to check if an id is in the database
 * @param {*} id The id of the item to be returned
 */
async function getItemTypeById(id) {
    const sqlQuery = 'SELECT * FROM itemTypes WHERE id = \'' + id + '\'';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item type");
        });
    return result[0][0] ? result[0][0] : null;
}

/**
 * Returns an item type from the database
 * Used to check if an item type name already exists
 * @param {*} name The name of the item type to be returned
 */
async function getItemTypeByName(name) {
    if (!validate.isValidAlphanumeric(name)) {
        throw new UserDataError("Invalid name");
    }

    const sqlQuery = 'SELECT * FROM itemTypes WHERE name = \'' + name + '\'';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item type");
        });
    return result[0][0] ? result[0][0] : null;
}

/**
 * Gets all the item types from the database
 * @returns an array of all the item types in the database
 */
async function getAllItemTypes() {
    const sqlQuery = 'SELECT * FROM itemTypes';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting item types");
        });
    return result[0];
}


// ----------------------- Rentals -----------------------

/**
 * Creates a rental from the given information
 * Checks that an item of the correct type is available at that times
 * If there is one, creates a rental, if not, throws an error
 * @param {*} userId The id of the user renting the item
 * @param {*} startTime The start time of the rental
 * @param {*} endTime The end time of the rental
 * @param {*} Duration The duration of the rental
 * @param {*} itemType The type of item being rented
 * @throws UserDataError if there are no available items at that time
 */
async function createRental(userId, startTime, endTime, Duration, itemType) {
    // will be used later
    var username;
    if (!validate.isValidInteger(userId)) {
        throw new UserDataError("Invalid user id");
    }
    if (!validate.isValidDateTime(startTime)) {
        throw new UserDataError("Invalid start time");
    }
    if (!validate.isValidDateTime(endTime)) {
        throw new UserDataError("Invalid end time");
    }
    if (endTime < startTime) {
        throw new UserDataError("End time must be before start time");
    }
    if (!validate.isValidInteger(Duration)) {
        throw new UserDataError("Invalid duration");
    }
    if (!validate.isValidName(itemType)) {
        throw new UserDataError("Invalid item type");
    }

    // Check that the user exists in the database
    const userQuery = 'SELECT * FROM users WHERE id = \'' + userId + '\'';
    const userResult = await connection.execute(userQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    if (userResult[0].length == 0) {
        throw new UserDataError("User does not exist");
    }
    else{
        username = userResult[0][0].username;
    }

    // Get all the items from inventory that have the right item Type
    // Check that there is one of that item available at that given time by getting all the rentals and checking that no item of that type is being rented in given time period between start and end times
    const sqlQuery = 'SELECT * FROM inventory WHERE itemType = (SELECT id FROM itemTypes WHERE name = \'' + itemType + '\')';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting items");
        }
        );
    // This is all of the items
    const items = result[0];
    let item = null;
    // Loops over each item
    for (let i = 0; i < items.length; i++) {
        // Checks if the item is available at that time frame
        const sqlQuery = 'SELECT * FROM rentals WHERE itemId = ' + items[i].id + ' AND startTime <= \'' + endTime + '\' AND endTime >= \'' + startTime + '\'';
        const result = await connection.execute(sqlQuery)
            .catch((error) => {
                logger.error(error)
                throw new SystemError("Error getting rentals");
            }
            );
        // If there are no rentals at that time, set the itemId to the item id
        // Break the loop because that item can be rented
        if (result[0].length == 0) {
            item = items[i];
            break;
        }
    }
    // If there is no possible rental, throw an error
    if (item == null || item.id == null) {
        throw new UserDataError("No items available");
    }

    // Disable foreign keys because sqlite is picky, my query is good
    await connection.execute('SET FOREIGN_KEY_CHECKS=0;')
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error disabling foreign keys");
        }
    );

    // Otherwise insert it into the rentals Table
    const addRental = 'INSERT INTO rentals (userId, itemId, startTime, endTime, duration, rentalPrice) VALUES ((Select id from users where username = \'' + username + '\'),\'' + item.id + '\', \'' + startTime + '\', \'' + endTime + '\', \'' + Duration + '\', \'' + item.itemCost*0.2 +'\');'
    
    await connection.execute(addRental)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding rental");
        }
    );

    // Re-enable foreign keys
    // Disable foreign keys because sqlite is picky, my query is good
    await connection.execute('SET FOREIGN_KEY_CHECKS=1;')
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error disabling foreign keys");
        }
    );
}

/**
 * Edits the rental that has the given id
 * First checks if the new rental can be added, if not throws an error
 * If it is possible, updates the rental
 * Also checks that the user is valid
 * @param {*} rentalId The id of the rental to update
 * @param {*} userId The id of the user doing the rental
 * @param {*} startTime The updated start time of the rental
 * @param {*} endTime The updated end time of the rental
 * @param {*} duration The updated duration of the rental
 * @param {*} itemType The updated itemType of the rental
 */
async function editRental(rentalId, userId, startTime, endTime, duration, itemType) {
    if (!validate.isValidInteger(rentalId)) {
        throw new UserDataError("Invalid rental id");
    }
    if (!validate.isValidInteger(userId)) {
        throw new UserDataError("Invalid user id");
    }
    if (!validate.isValidTime(startTime)) {
        throw new UserDataError("Invalid start time");
    }
    if (!validate.isValidTime(endTime)) {
        throw new UserDataError("Invalid end time");
    }
    if (endTime > startTime) {
        throw new UserDataError("End time must be before start time");
    }
    if (!validate.isValidInteger(duration)) {
        throw new UserDataError("Invalid duration");
    }
    if (!validate.isValidItemType(itemType)) {
        throw new UserDataError("Invalid item type");
    }

    // Check that the user exists in the database
    const userQuery = 'SELECT * FROM user WHERE id = ' + userId;
    const userResult = await connection.execute(userQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting user");
        });
    if (userResult[0].length == 0) {
        throw new UserDataError("User does not exist");
    }

    // Get the rental via its isValidDate

    // Check that the new rental with the updated fields can be added
    // If it can be added, update the rental
    // If it can't be added, throw an error
    const sqlQuery = 'SELECT * FROM inventory WHERE itemType = (SELECT id FROM itemTypes WHERE name = \'' + itemType + '\')';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting items");
        }
        );
    // This is all of the items
    const items = result[0];
    let itemId = null;
    // Loops over each item
    for (let i = 0; i < items.length; i++) {
        // Checks if the item is available at that time frame
        const sqlQuery = 'SELECT * FROM rental WHERE item = ' + items[i].id + ' AND startTime <= \'' + startTime + '\' AND endTime >= \'' + endTime + '\'';
        const result = await connection.execute(sqlQuery)
            .catch((error) => {
                logger.error(error)
                throw new SystemError("Error getting rentals");
            }
            );
        // If there are no rentals at that time, set the itemId to the item id
        // Break the loop because that item can be rented
        if (result[0].length == 0) {
            itemId = items[i].id;
            break;
        }
    }
    // If there is no possible rental, throw an error
    if (itemId == null) {
        throw new UserDataError("No items available");
    }
    // Now that the rental is possible, update the rental with the new fields
    const updateRental = 'UPDATE rental SET user = ' + userId + ', item = ' + itemId + ', startTime = \'' + startTime + '\', endTime = \'' + endTime + '\', duration = ' + duration + ' WHERE id = ' + rentalId;
    await connection.execute(updateRental)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error updating rental");
        }
        );
    // If this works, cry happy tears; else, cry sad tears    
}

/**
 * Deletes a rental with the given id
 * @param {*} rentalId The id of the rental to delete
 */
async function deleteRental(rentalId) {
    if (!validate.isValidInteger(rentalId)) {
        throw new UserDataError("Invalid rental id");
    }
    // Delete the rental
    const deleteRental = 'DELETE FROM rental WHERE id = ' + rentalId;
    await connection.execute(deleteRental)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error deleting rental");
        }
        );
}

/**
 * Gets all the fields from a rental with the given id
 * @param {*} rentalId The id of the rental to get the fields
 * @returns an array of all the fields of the rental 
 */
async function getRentalById(rentalId) {
    const sqlQuery = 'SELECT * FROM rental WHERE id = ' + rentalId;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting rentals");
        }
        );
    return result[0][0];
}
/**
 * Gets all the information about the rentals with the given user id
 * 
 * @param {*} userId 
 * @returns an array of all the fields of the rental
 */
async function getRentalFromUserId(userId)
{
    if (!validate.isValidInteger(userId)) {
        throw new UserDataError("Invalid user id");
    }

    const sqlQuery = 'SELECT * FROM rental WHERE user = ' + userId;
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting rentals");
        }
        );
    return result[0];    
}

/**
 * Gets all the rentals
 * @returns all of the rentals
 */
async function getAllRentals() {
    const sqlQuery = 'SELECT * FROM rental';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting rentals");
        }
        );
    return result[0];
}



// ----------------------- Session -----------------------
/**
 * Gets a session from its id
 * @param {*} sessionId The id of the session to retrieve
 * @returns The session
 */
async function getCurrentSession(sessionId) {
    const sqlQuery = 'SELECT * FROM sessions WHERE id = \'' + sessionId + '\'';
    const result = await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error getting session");
        });
    return result[0][0];
}

/**
 * Adds a session to the database from a session object
 * @param {*} session The session object to add to the database
 */
async function addSession(session) {
    const sqlQuery = 'INSERT INTO sessions (id, userId, userType, expiresAt) VALUES (\'' + session.sessionId + '\',\'' + session.userId + '\',\'' + session.userType + '\',\'' + session.expiresAt + '\')';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error adding session");
        });
}

/**
 * deletes a session from the database
 * @param {*} sessionId The id of the session to be deleted
 */
async function deleteSessionById(sessionId) {
    const sqlQuery = 'DELETE FROM sessions WHERE id = \'' + sessionId + '\'';
    await connection.execute(sqlQuery)
        .catch((error) => {
            logger.error(error)
            throw new SystemError("Error deleting session");
        });
}

/**
 * The session class to transfer session items more easily
 */
class Session {
    constructor(sessionId, userId, userType, expiresAt) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.userType = userType;
        this.expiresAt = expiresAt;
    }
    isExpired() {
        this.expiresAt < (new Date());
    }
}

/**
 * Creates a session from the given fields
 * @param {*} userId The id of the user
 * @param {*} userType The type of the user
 * @param {*} numMinutes The number of minutes the session will last
 * @returns the session id
 */
async function createSession(userId, userType, numMinutes) {
    // Generate a random UUID as the sessionId
    const sessionId = uuid.v4()
    // Set the expiry time as numMinutes (in milliseconds) after the current time
    const expiresAt = new Date(Date.now() + numMinutes * 60000);

    // Create a session object containing information about the user and expiry time
    const thisSession = new Session(sessionId, userId, userType, expiresAt);

    // Add the session information to the sessions map, using sessionId as the key
    await addSession(thisSession);

    return sessionId;
}

/**
 * Authenticates if a user has an active session
 * @param {*} request The request object
 * @returns null if there is no active session, the session object if there is an active session
 */
async function authenticateUser(request) {
    // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
    if (!request.cookies) {
        return null;
    }
    // We can obtain the session token from the requests cookies, which come with every request
    const sessionId = request.cookies['sessionId']
    if (!sessionId) {
        // If the cookie is not set, return null
        return null;
    }
    // We then get the session of the user from our session map
    userSession = await getCurrentSession(sessionId);
    if (!userSession) {
        return null;
    }    // If the session has expired, delete the session from our map and return null
    if (userSession.isExpired < (new Date())) {
        await deleteSessionById(sessionId);
        return null;
    }
    return { sessionId, userSession }; // Successfully validated.
}

/**
 * Checks if a session is an admin session
 * @param {*} session The session to check
 * @returns true if the session is an admin session, false if it is not
 */
function authenticatedAdmin(session) {
    if (session.userSession.userType.toLowerCase() == 'admin') {
        return true;
    }
    return false;
}

/**
 * Refreshes a session
 * @param {*} request The request object
 * @param {*} response The response object
 * @returns the new session id
 */
async function refreshSession(request, response) {
    const authenticatedSession = await authenticateUser(request);
    if (!authenticatedSession) {
        res.render("error.hbs", { alertMessage: "Unauthorized access" });
        return;
    }
    // Create and store a new Session object that will expire in 5 minutes.
    const newSessionId = await createSession(authenticatedSession.userSession.userId, authenticatedSession.userSession.userType, 5);
    // Delete the old entry in the session map 
    await deleteSessionById(authenticatedSession.sessionId);

    // Get the new session
    const newSession = await getCurrentSession(newSessionId);
    // Set the session cookie to the new id we generated, with a
    // renewed expiration time

    return newSession;
}


// ----------------------- Error Classes -----------------------
/**
 * User if the user inputed a wrong input
 */
class UserDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserDataError";
        this.status = 400;
    }
}

/**
 * Error is the error is server sided
 */
class SystemError extends Error {
    constructor(message) {
        super(message);
        this.name = "SystemError";
        this.status = 500;
    }
}

/**
 * Gets the connection
 * @returns the connection
 */
function getConnection() {
    return connection;
}

module.exports = {
    initialize,

    // Users
    createUser,
    editUser,
    deleteUser,
    getUserById,
    checkIfUsernameIsTaken,
    getUserByUsername,

    // Items
    addItem,
    editItem,
    deleteItem,
    getItemById,
    getAllItems,

    // Item Types
    addItemType,
    editItemType,
    deleteItemType,
    getItemTypeByName,
    getAllItemTypes,
    getConnection,
    getItemTypeById,
    getAllUsers,

    // Login / Sessions
    verifyLogin,
    getUserTypeFromTypeId,
    getCurrentSession,
    addSession,
    deleteSessionById,
    createSession,
    authenticateUser,
    authenticatedAdmin,
    refreshSession,

    // Rentals
    createRental,
    editRental,
    deleteRental,
    getRentalById,
    getAllRentals,
    getRentalFromUserId
}