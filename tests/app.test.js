//#region SETUP
const app = require("../app");
const supertest = require("supertest");
testRequest = supertest.agent(app);

const dbName = "skiEquipment_db_test";
const model = require('../models/skiEquipmentModelMysql');
const res = require("express/lib/response");

//There will always be an admin with id 1 so the first user added user will have id 2
const DEFAULT_ID = '1';
const DEFAULT_USER_ID = '2';

beforeEach(async () => {
    await model.initialize(dbName, true);
});

afterEach(async () => {
    connection = model.getConnection();
    if (connection) {
        await connection.close();
    }
});

/* Data to be used to generate random skiEquipment for testing */
const users = [
    { userType: '1', username: 'Liam', password: "Abcd123!", firstName: 'Liam', lastName: 'Liam', credit: '80.99', index: 0 },
    { userType: '1', username: 'Pleasure', password: "Abed123!", firstName: 'Pleasure', lastName: 'Pleasure', credit: '0.00', index: 1 },
    { userType: '1', username: 'Brandon', password: "Abdd123!", firstName: 'Brandon', lastName: 'Brandon', credit: '40.99', index: 2 },
    { userType: '1', username: 'Gorav', password: "Abcd123!", firstName: 'Gorav', lastName: 'Gorav', credit: '30.99', index: 3 },
    { userType: '1', username: 'Sam', password: "Abdf123!", firstName: 'Sam', lastName: 'Sam', credit: '0.00', index: 4 },
    { userType: '1', username: 'Eric', password: "Aded123!", firstName: 'Eric', lastName: 'Eric', credit: '15.99', index: 5 },
    { userType: '1', username: 'Emma', password: "Abed123!", firstName: 'Emma', lastName: 'Emma', credit: '20.99', index: 6 },
]

const generateUser = (usedIndex) => {
    let index = Math.floor((Math.random() * users.length));
    while (index == usedIndex) {
        index = Math.floor((Math.random() * users.length));
    }

    return users.slice(index, index + 1)[0];
}

const items = [
    { name: 'S FORCE BOLD', description: "Description: Developed for on-piste chargers always eager to challenge the boundaries of their comfort zone, this ski’s couple extra centimeters underfoot make it perfect for laying down fast turns in all snow conditions.", itemCost: '80.99', itemType: '4', index: 0 },
    { name: 'Tree Leader Board Camber Snowboard', description: "Description: Freeride champions and big mountain billy goats, take note. The Burton Leader Board puts control and response right beneath your feet.", itemCost: '100.99', itemType: '5', index: 1 },
    { name: 'Oakley MOD5 MIPS Helmet', description: "Description: The Mod 5 MIPS provides optimal protection, comfort and great ventilation and boasts a typical Oakley design!", itemCost: '40.99', itemType: '3', index: 2 },
    { name: 'Head Kore 2 120', description: "Description: The Head Kore 2 120 are high performance freeride and touring ski boots for advanced riders and ski experts.", itemCost: '20.99', itemType: '1', index: 6 },
]

const generateItem = (usedIndex) => {
    let index = Math.floor((Math.random() * items.length));
    while (index == usedIndex) {
        index = Math.floor((Math.random() * items.length));
    }

    return items.slice(index, index + 1)[0];
}

const itemTypes = [
    { name: 'Bindings', index: 0 },
    { name: 'Skins', index: 1 },
    { name: 'Hats', index: 2 },
    { name: 'Gloves', index: 3 },
    { name: 'Accessories', index: 4 }
]

const generateItemTypes = (usedIndex) => {
    let index = Math.floor((Math.random() * itemTypes.length));
    while (index == usedIndex) {
        index = Math.floor((Math.random() * itemTypes.length));
    }

    return itemTypes.slice(index, index + 1)[0];
}

//#endregion

//#region =============== MODEL SUCCESS TESTS ===============

//#region USERS

test("createUser success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Assert
    let result = await model.getUserById(DEFAULT_USER_ID);
    expect(result.userType.toString()).toBe(userType);
    expect(result.username).toBe(username);
    expect(result.firstName).toBe(firstName);
    expect(result.lastName).toBe(lastName);
    expect(result.credit).toBe(credit);
});

test("editUser success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    await model.editUser(DEFAULT_USER_ID, userType2, username2, password2, firstName2, lastName2, credit2);

    //Assert
    let result = await model.getUserById(DEFAULT_USER_ID);
    expect(result.userType.toString()).toBe(userType2);
    expect(result.username).toBe(username2);
    expect(result.firstName).toBe(firstName2);
    expect(result.lastName).toBe(lastName2);
    expect(result.credit).toBe(credit2);
});

test("deleteUser success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    await model.deleteUser(DEFAULT_USER_ID);

    //Assert
    let result = await model.getUserById(DEFAULT_USER_ID);
    expect(result).toBe(null);
});

test("getUserById success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    let result = await model.getUserById(DEFAULT_USER_ID);

    //Assert
    expect(result.userType.toString()).toBe(userType);
    expect(result.username).toBe(username);
    expect(result.firstName).toBe(firstName);
    expect(result.lastName).toBe(lastName);
    expect(result.credit).toBe(credit);
});

test("getAllUsers success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    await model.createUser(userType2, username2, password2, firstName2, lastName2, credit2);

    //Act
    let result = await model.getAllUsers();

    //Assert
    expect(result[DEFAULT_ID].userType.toString()).toBe(userType);
    expect(result[DEFAULT_ID].username).toBe(username);
    expect(result[DEFAULT_ID].firstName).toBe(firstName);
    expect(result[DEFAULT_ID].lastName).toBe(lastName);
    expect(result[DEFAULT_ID].credit).toBe(credit);

    expect(result[DEFAULT_USER_ID].userType.toString()).toBe(userType2);
    expect(result[DEFAULT_USER_ID].username).toBe(username2);
    expect(result[DEFAULT_USER_ID].firstName).toBe(firstName2);
    expect(result[DEFAULT_USER_ID].lastName).toBe(lastName2);
    expect(result[DEFAULT_USER_ID].credit).toBe(credit2);
});

test("checkIfUsernameIsTaken available", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();

    //Act
    let result = await model.checkIfUsernameIsTaken(username);

    //Assert
    expect(result).toBe(false);
});

test("checkIfUsernameIsTaken taken", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    let result = await model.checkIfUsernameIsTaken(username);

    //Assert
    expect(result).toBe(true);
});

//#endregion

//#region ITEMS

test("addItem success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();

    //Act
    await model.addItem(name, description, itemCost, itemType);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.itemCost).toBe(itemCost);
    expect(result.itemType).toBe(parseInt(itemType));
});

test("editItem success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem();
    await model.addItem(name, description, itemCost, itemType);

    //Act
    await model.editItem(DEFAULT_ID, name2, description2, itemCost2, itemType2);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result.name).toBe(name2);
    expect(result.description).toBe(description2);
    expect(result.itemCost).toBe(itemCost2);
    expect(result.itemType.toString()).toBe(itemType2);
});

test("deleteItem success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    await model.addItem(name, description, itemCost, itemType);

    //Act
    await model.deleteItem(DEFAULT_ID);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result).toBe(null);
});

test("getItemById success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    await model.addItem(name, description, itemCost, itemType);

    //Act
    let result = await model.getItemById(DEFAULT_ID);

    //Assert
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.itemCost).toBe(itemCost);
    expect(result.itemType.toString()).toBe(itemType);
});

test("getAllItems success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem();
    await model.addItem(name2, description2, itemCost2, itemType2);

    //Act
    let result = await model.getAllItems();

    //Assert
    expect(result[0].name).toBe(name);
    expect(result[0].description).toBe(description);
    expect(result[0].itemCost).toBe(itemCost);
    expect(result[0].itemType.toString()).toBe(itemType);

    expect(result[1].name).toBe(name2);
    expect(result[1].description).toBe(description2);
    expect(result[1].itemCost).toBe(itemCost2);
    expect(result[1].itemType.toString()).toBe(itemType2);
});

//#endregion

//#region ITEM TYPES

test("addItemType success case", async () => {
    //Arrange
    let { name } = generateItemTypes();

    //Act
    await model.addItemType(name);

    //Assert
    let result = await model.getItemTypeByName(name);
    expect(result.name).toBe(name);
});

test("editItemType success case", async () => {
    //Arrange
    let { name, index } = generateItemTypes();
    let { name: name2 } = generateItemTypes(index);
    await model.addItemType(name);

    //Act
    let result = await model.getItemTypeByName(name);
    await model.editItemType(result.id.toString(), name2);

    //Assert
    result = await model.getItemTypeByName(name2);
    expect(result.name).toBe(name2);

    result = await model.getItemTypeByName(name);
    expect(result).toBe(null);
});

test("deleteItemType success case", async () => {
    //Arrange
    let { name, index } = generateItemTypes();
    await model.addItemType(name);

    //Act
    let result = await model.getItemTypeByName(name);
    await model.deleteItemType(result.id.toString());

    //Assert
    result = await model.getItemTypeByName(name);
    expect(result).toBe(null);
});

test("getItemTypeById success case", async () => {
    //Arrange
    let { name } = generateItemTypes();
    await model.addItemType(name);
    let idResult = await model.getItemTypeByName(name);

    //Act
    let result = await model.getItemTypeById(idResult.id);

    //Assert
    expect(result.name).toBe(name);
});

test("getItemTypeByName success case", async () => {
    //Arrange
    let { name } = generateItemTypes();
    await model.addItemType(name);

    //Act
    let result = await model.getItemTypeByName(name);

    //Assert
    expect(result.name).toBe(name);
});

test("getAllItemTypes success case", async () => {
    //Arrange
    let { name, index } = generateItemTypes();
    let { name: name2 } = generateItemTypes(index);
    await model.addItemType(name);
    await model.addItemType(name2);

    //Act
    let result = await model.getAllItemTypes();

    //Assert
    let result1 = await model.getItemTypeByName(name);
    expect(result[result1.id - 1].name).toBe(name);

    let result2 = await model.getItemTypeByName(name2);
    expect(result[result2.id - 1].name).toBe(name2);
});

//#endregion

//#region RENTALS

//#endregion

//#region LOGINS

//#endregion

//#endregion

//#region =============== MODEL FAILURE TESTS ===============

//#region USERS

test("createUser empty type ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser('', username, password, firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser invalid type ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser('-1', username, password, firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser empty username ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, '', password, firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser invalid username ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, '!', password, firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser empty password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, '', firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser short password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, 'Abc!', firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser only lowercase password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, 'abcdefg!', firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser no symbol password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, 'Abcdefgh', firstName, lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser empty first name", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, password, '', lastName, credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser empty last name", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, password, firstName, '', credit);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("createUser empty credit", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.createUser(userType, username, password, firstName, lastName, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty type ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, '', username2, password2, firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser invalid type ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, '!', username2, password2, firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty username ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, '', password2, firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser invalid username ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, '!', password2, firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, '', firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser short password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, 'Abc!', firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser only lowercase password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, 'abcdefg!', firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser no symbol password ", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, 'Abcdefgh', firstName2, lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty first name", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, password2, '', lastName2, credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty last name", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, password2, firstName2, '', credit2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editUser empty credit", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await model.createUser(userType, username, password, firstName, lastName, credit);
    fail = false;

    //Act
    try {
        await model.editUser(DEFAULT_USER_ID, userType2, username2, password2, firstName2, lastName2, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("deleteUser not in database", async () => {
    //Arrange
    fail = false;

    try {
        //Act
        await model.deleteUser(DEFAULT_USER_ID);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("getUserById not in database", async () => {
    //Arrange
    fail = false;

    //Act
    let result = await model.getUserById(DEFAULT_USER_ID);

    //Assert
    expect(result).toBe(null);
});

test("checkIfUsernameIsTaken invalid username", async () => {
    //Arrange
    fail = false;

    //Act
    try {
        await model.getUserById('!');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});


//#endregion

//#region ITEMS

test("addItem empty name", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem('', description, itemCost, itemType);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem invalid name", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem('!', description, itemCost, itemType);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem empty description", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem(name, '', itemCost, itemType);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem empty itemCost", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem(name, description, '', itemType);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem invalid itemCost", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem(name, description, 'a', itemType);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem empty item type", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem(name, description, itemCost, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItem invalid item type", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    fail = false;

    //Act
    try {
        await model.addItem(name, description, itemCost, '-1');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem empty name", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem('', description2, itemCost2, itemType22);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem invalid name", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem('!', description2, itemCost2, itemType22);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem empty description", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, '', itemCost2, itemType22);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem empty itemCost", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, '', itemType2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem invalid itemCost", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, 'a', itemType2);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem empty item type", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, itemCost2, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem invalid item type", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, itemCost2, '-1');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem empty rental state", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, itemCost2, itemType2, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItem invalid rental state", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    fail = false;

    //Act
    try {
        await model.editItem(name2, description2, itemCost2, itemType2, '-1');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItemRentalState empty rental state", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    fail = false;

    //Act
    try {
        await model.editItemRentalState(DEFAULT_ID, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItemRentalState invalid rental state", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    await model.addItem(name, description, itemCost, itemType);
    fail = false;

    //Act
    try {
        await model.editItemRentalState(DEFAULT_ID, '-1');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("deleteItem not in database", async () => {
    //Arrange
    fail = false;

    try {
        //Act
        await model.deleteItem(DEFAULT_ID);
    }
    catch (err) {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("getItemById not in database", async () => {
    //Arrange
    fail = false;

    //Act
    let result = await model.getItemById(DEFAULT_ID);

    //Assert
    expect(result).toBe(null);
});

//#endregion

//#region ITEM TYPES

test("addItemType empty name", async () => {
    //Arrange
    fail = false;

    //Act
    try {
        await model.addItemType('');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("addItemType invalid name", async () => {
    //Arrange
    fail = false;

    //Act
    try {
        await model.addItemType('!');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItemType not in database", async () => {
    //Arrange
    let { name } = generateItemTypes();
    fail = false;

    //Act
    try {
        await model.editItemType("-1", name);
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItemType empty name", async () => {
    //Arrange
    let { name } = generateItemTypes();
    await model.addItemType(name);
    fail = false;

    //Act
    try {
        await model.editItemType(DEFAULT_ID, '');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("editItemType invalid name", async () => {
    //Arrange
    let { name } = generateItemTypes();
    await model.addItemType(name);
    fail = false;

    //Act
    try {
        await model.editItemType(DEFAULT_ID, '!');
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("deleteItemType not in database", async () => {
    //Arrange
    fail = false;

    //Act
    try {
        await model.deleteItemType("-1");
    }
    catch {
        fail = true;
    }

    //Assert
    expect(fail).toBe(true);
});

test("getItemTypeById not in database", async () => {
    //Act
    let result = await model.getItemTypeById("-1");

    //Assert
    expect(result).toBe(null);
});

test("getItemTypeByName not in database", async () => {
    //Act
    let result = await model.getItemTypeByName('Test');

    //Assert
    expect(result).toBe(null);
});

//#endregion

//#endregion

//#region =============== ENDPOINT SUCCESS TESTS ===============

//#region USER PAGE TESTS

test("Home test", async () => {
    let testResponse = await testRequest.get("/home");
    expect(testResponse.status).toBe(200);
});

test("404 test", async () => {
    let testResponse = await testRequest.get("/anything");
    expect(testResponse.status).toBe(404);
});

test("About test", async () => {
    let testResponse = await testRequest.get("/about");
    expect(testResponse.status).toBe(200);
});

test("Login test", async () => {
    let testResponse = await testRequest.get("/login");
    expect(testResponse.status).toBe(200);
});

test("Signup test", async () => {
    let testResponse = await testRequest.get("/signup");
    expect(testResponse.status).toBe(200);
});

test("Account test", async () => {
    let testResponse = await testRequest.get("/account");
    expect(testResponse.status).toBe(200);
});



//#endregion

//#region ADMIN TESTS

test("List page test", async () => {
    let testResponse = await testRequest.get("/admin");
    expect(testResponse.status).toBe(200);
});

test("Items page test", async () => {
    let testResponse = await testRequest.get("/items");
    expect(testResponse.status).toBe(200);
});

test("Item types page test", async () => {
    let testResponse = await testRequest.get("/itemtypes");
    expect(testResponse.status).toBe(200);
});

test("Users page test", async () => {
    let testResponse = await testRequest.get("/users");
    expect(testResponse.status).toBe(200);
});

//#endregion

//#region USERS TESTS

test("createUser endpoint test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("editUser endpoint test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Act
    let testResponse = await testRequest.post("/editUser").send({
        id: DEFAULT_USER_ID,
        userType: userType2,
        username: username2,
        password: password2,
        firstName: firstName2,
        lastName: lastName2,
        credit: credit2
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("deleteUser endpoint test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Act
    let testResponse = await testRequest.post("/deleteUser").send({
        id: DEFAULT_USER_ID,
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

//#endregion

//#region ITEM TESTS

test("addItem endpoint test", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();

    //Act
    let testResponse = await testRequest.post("/addItem").send({
        name: name,
        description: description,
        cost: itemCost,
        itemType: itemType,
        quantity: '1'
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("editItem endpoint test", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    await testRequest.post("/addItem").send({
        name: name,
        description: description,
        cost: itemCost,
        itemType: itemType,
        quantity: '1'
    });

    //Act
    let testResponse = await testRequest.post("/editItem").send({
        id: DEFAULT_ID,
        name: name2,
        description: description2,
        cost: itemCost2,
        itemType: itemType2
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("deleteItem endpoint test", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();
    await testRequest.post("/addItem").send({
        name: name,
        description: description,
        cost: itemCost,
        itemType: itemType,
        quantity: '1'
    });

    //Act
    let testResponse = await testRequest.post("/deleteItem").send({
        id: DEFAULT_ID,
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

//#endregion

//#region ITEM TYPES TESTS

test("addItemType endpoint test", async () => {
    //Arrange
    let { name } = generateItemTypes();

    //Act
    let testResponse = await testRequest.post("/addItemType").send({
        name: name
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("editItemType endpoint test", async () => {
    //Arrange
    let { name, index } = generateItemTypes();
    let { name: name2 } = generateItemTypes(index);
    await testRequest.post("/addItemType").send({
        name: name
    });

    //Act
    let testResponse = await testRequest.post("/editItemType").send({
        id: DEFAULT_ID,
        name: name2
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

test("deleteItemType endpoint test", async () => {
    //Arrange
    let { name, index } = generateItemTypes();
    await testRequest.post("/addItemType").send({
        name: name,
    });

    //Act
    let testResponse = await testRequest.post("/deleteItemType").send({
        id: DEFAULT_ID,
    });

    //Assert
    expect(testResponse.status).toBe(200);
});

//#endregion

//#region OTHER FORM TESTS

test("Default user login", async () => {
    let testResponse = await testRequest.post("/loginSubmit").send({
        username: 'Admin',
        password: 'P@ssw0rd'
    });

    expect(testResponse.status).toBe(200);
});

test("Logout test", async () => {
    let testResponse = await testRequest.post("/logout");
    expect(testResponse.status).toBe(302);
});

test("Signup", async () => {
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    let testResponse = await testRequest.post("/signupSubmit").send({
        username: username,
        firstName: firstName,
        lastName: lastName,
        password: password,
        confirmPassword: password
    });

    expect(testResponse.status).toBe(200);
});

//#endregion

//#endregion

//#region =============== ENDPOINT FAILURE TESTS ===============

//#region USER TESTS

test("createUser empty userType test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    testResponse = await testRequest.post("/createUser").send({
        userType: "",
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser invalid userType test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: "!",
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser empty username test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: "",
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser invalid username test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: "!",
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser empty password test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: "",
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser short password test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: "Abcd!",
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser no symbol password test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: "Abcdadfaf",
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser no capital password test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: "abcdadfaf!",
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser empty firstName test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: "",
        lastName: lastName,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser empty lastName test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: "",
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("createUser empty credit test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    let testResponse = await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: credit,
        credit: credit
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("editUser empty username test", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit, index } = generateUser();
    let { userType: userType2, username: username2, password: password2, firstName: firstName2, lastName: lastName2, credit: credit2 } = generateUser(index);
    await testRequest.post("/createUser").send({
        userType: userType,
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName,
        credit: credit
    });

    //Act
    let testResponse = await testRequest.post("/editUser").send({
        id: DEFAULT_USER_ID,
        userType: userType2,
        username: "",
        password: password2,
        firstName: firstName2,
        lastName: lastName2,
        credit: credit2
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("deleteUser not in database test", async () => {
    //Arrange

    //Act
    let testResponse = await testRequest.post("/deleteUser").send({
        id: DEFAULT_USER_ID,
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

//#endregion

//#region ITEM TESTS

test("addItem empty name test", async () => {
    //Arrange
    let { name, description, itemCost, itemType } = generateItem();

    //Act
    let testResponse = await testRequest.post("/addItem").send({
        name: "",
        description: description,
        cost: itemCost,
        itemType: itemType,
        quantity: '1'
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("editItem empty name test", async () => {
    //Arrange
    let { name, description, itemCost, itemType, index } = generateItem();
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2 } = generateItem(index);
    await testRequest.post("/addItem").send({
        name: name,
        description: description,
        cost: itemCost,
        itemType: itemType,
        quantity: '1'
    });

    //Act
    let testResponse = await testRequest.post("/editItem").send({
        id: DEFAULT_ID,
        name: "",
        description: description2,
        cost: itemCost2,
        itemType: itemType2
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("deleteItem not in database test", async () => {
    //Arrange

    //Act
    let testResponse = await testRequest.post("/deleteItem").send({
        id: DEFAULT_ID,
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

//#endregion

//#region ITEM TYPES TESTS

test("addItemType empty name test", async () => {
    //Arrange

    //Act
    let testResponse = await testRequest.post("/addItemType").send({
        name: ""
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("editItemType empty name test", async () => {
    //Arrange
    let { name } = generateItemTypes();
    await testRequest.post("/addItemType").send({
        name: name
    });

    //Act
    let testResponse = await testRequest.post("/editItemType").send({
        id: DEFAULT_ID,
        name: ""
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

test("deleteItemType not in database test", async () => {
    //Arrange

    //Act
    let testResponse = await testRequest.post("/deleteItemType").send({
        id: "-1",
    });

    //Assert
    expect(testResponse.status).toBe(400);
});

//#endregion

//#region OTHER FORMS TESTS

test("Login not a user", async () => {
    let testResponse = await testRequest.post("/loginSubmit").send({
        username: 'Eric',
        password: 'P@ssw0rd'
    });

    expect(testResponse.status).toBe(400);
});

test("Signup empty username", async () => {
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    let testResponse = await testRequest.post("/signupSubmit").send({
        username: "",
        firstName: firstName,
        lastName: lastName,
        password: password,
        confirmPassword: password
    });

    expect(testResponse.status).toBe(400);
});

test("Rent not logged in", async () => {
    let testResponse = await testRequest.post("/rentSubmit").send({
        startTime: '15:47',
        duration: '4',
        itemType: 'Skis',
    });

    expect(testResponse.status).toBe(400);
});

//#endregion

//#endregion