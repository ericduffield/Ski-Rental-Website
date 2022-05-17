//#region SETUP
const app = require("../app");
const supertest = require("supertest");
const testRequest = supertest(app);

const dbName = "skiEquipment_db_test";
const model = require('../models/skiEquipmentModelMysql');
const res = require("express/lib/response");

const DEFAULT_ID = '1';

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
    { userType: '1', username: 'Liam', password: "Abcd123!", firstName: 'Liam', lastName: 'Liam', credit: '80', index: 0 },
    { userType: '1', username: 'Pleasure', password: "Abed123!", firstName: 'Pleasure', lastName: 'Pleasure', credit: '0', index: 1 },
    { userType: '1', username: 'Brandon', password: "Abdd123!", firstName: 'Brandon', lastName: 'Brandon', credit: '40', index: 2 },
    { userType: '1', username: 'Gorav', password: "Abcd123!", firstName: 'Gorav', lastName: 'Gorav', credit: '30', index: 3 },
    { userType: '1', username: 'Sam', password: "Abdf123!", firstName: 'Sam', lastName: 'Sam', credit: '0', index: 4 },
    { userType: '1', username: 'Eric', password: "Aded123!", firstName: 'Eric', lastName: 'Eric', credit: '15', index: 5 },
    { userType: '1', username: 'Emma', password: "Abed123!", firstName: 'Emma', lastName: 'Emma', credit: '20', index: 6 },
]

const generateUser = (usedIndex) => {
    let index = Math.floor((Math.random() * users.length));
    while (index == usedIndex) {
        index = Math.floor((Math.random() * users.length));
    }

    return users.slice(index, index + 1)[0];
}

const items = [
    { name: 'S FORCE BOLD', description: "Description: Developed for on-piste chargers always eager to challenge the boundaries of their comfort zone, this ski’s couple extra centimeters underfoot make it perfect for laying down fast turns in all snow conditions.", itemCost: '80', itemType: '4', rentalState: '1', index: 0 },
    { name: 'Tree Leader Board Camber Snowboard', description: "Description: Freeride champions and big mountain billy goats, take note. The Burton Leader Board puts control and response right beneath your feet.", itemCost: '100', itemType: '5', rentalState: '1', index: 1 },
    { name: 'Oakley MOD5 MIPS Helmet', description: "Description: The Mod 5 MIPS provides optimal protection, comfort and great ventilation and boasts a typical Oakley design!", itemCost: '40', itemType: '3', rentalState: '1', index: 2 },
    { name: 'Head Kore 2 120', description: "Description: The Head Kore 2 120 are high performance freeride and touring ski boots for advanced riders and ski experts.", itemCost: '20', itemType: '1', rentalState: '1', index: 6 },
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

//#region MODEL SUCCESS TESTS

//#region USERS

test("createUser success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();

    //Act
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Assert
    let result = await model.getUserById(DEFAULT_ID);
    expect(result.userType.toString()).toBe(userType);
    expect(result.username).toBe(username);
    expect(result.password).toBe(password);
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
    await model.editUser(DEFAULT_ID, userType2, username2, password2, firstName2, lastName2, credit2);

    //Assert
    let result = await model.getUserById(DEFAULT_ID);
    expect(result.userType.toString()).toBe(userType2);
    expect(result.username).toBe(username2);
    expect(result.password).toBe(password2);
    expect(result.firstName).toBe(firstName2);
    expect(result.lastName).toBe(lastName2);
    expect(result.credit).toBe(credit2);
});

test("deleteUser success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    await model.deleteUser(DEFAULT_ID);

    //Assert
    let result = await model.getUserById(DEFAULT_ID);
    expect(result).toBe(null);
});

test("getUserById success case", async () => {
    //Arrange
    let { userType, username, password, firstName, lastName, credit } = generateUser();
    await model.createUser(userType, username, password, firstName, lastName, credit);

    //Act
    let result = await model.getUserById(DEFAULT_ID);

    //Assert
    expect(result.userType.toString()).toBe(userType);
    expect(result.username).toBe(username);
    expect(result.password).toBe(password);
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
    expect(result[0].userType.toString()).toBe(userType);
    expect(result[0].username).toBe(username);
    expect(result[0].password).toBe(password);
    expect(result[0].firstName).toBe(firstName);
    expect(result[0].lastName).toBe(lastName);
    expect(result[0].credit).toBe(credit);

    expect(result[1].userType.toString()).toBe(userType2);
    expect(result[1].username).toBe(username2);
    expect(result[1].password).toBe(password2);
    expect(result[1].firstName).toBe(firstName2);
    expect(result[1].lastName).toBe(lastName2);
    expect(result[1].credit).toBe(credit2);
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
    let { name, description, itemCost, itemType, rentalState } = generateItem();

    //Act
    await model.addItem(name, description, itemCost, itemType, rentalState);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.itemCost).toBe(itemCost);
    expect(result.itemType.toString()).toBe(itemType);
    expect(result.rentalState.toString()).toBe(rentalState);
});

test("editItem success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType, rentalState } = generateItem();
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2, rentalState: rentalState2 } = generateItem();
    await model.addItem(name, description, itemCost, itemType, rentalState);

    //Act
    await model.editItem(DEFAULT_ID, name2, description2, itemCost2, rentalState2, itemType2);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result.name).toBe(name2);
    expect(result.description).toBe(description2);
    expect(result.itemCost).toBe(itemCost2);
    expect(result.itemType.toString()).toBe(itemType2);
    expect(result.rentalState.toString()).toBe(rentalState2);
});

test("editItemRentalState success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType, rentalState } = generateItem();
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2, rentalState: rentalState2 } = generateItem();
    await model.addItem(name, description, itemCost, itemType, rentalState);

    //Act
    await model.editItemRentalState(DEFAULT_ID, rentalState2);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result.rentalState.toString()).toBe(rentalState2);
});

test("deleteItem success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType, rentalState } = generateItem();
    await model.addItem(name, description, itemCost, itemType, rentalState);

    //Act
    await model.deleteItem(DEFAULT_ID);

    //Assert
    let result = await model.getItemById(DEFAULT_ID);
    expect(result).toBe(null);
});

test("getItemById success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType, rentalState } = generateItem();
    await model.addItem(name, description, itemCost, itemType, rentalState);

    //Act
    let result = await model.getItemById(DEFAULT_ID);

    //Assert
    expect(result.name).toBe(name);
    expect(result.description).toBe(description);
    expect(result.itemCost).toBe(itemCost);
    expect(result.itemType.toString()).toBe(itemType);
    expect(result.rentalState.toString()).toBe(rentalState);
});

test("getAllItems success case", async () => {
    //Arrange
    let { name, description, itemCost, itemType, rentalState } = generateItem();
    await model.addItem(name, description, itemCost, itemType, rentalState);
    let { name: name2, description: description2, itemCost: itemCost2, itemType: itemType2, rentalState: rentalState2 } = generateItem();
    await model.addItem(name2, description2, itemCost2, itemType2, rentalState2);

    //Act
    let result = await model.getAllItems();

    //Assert
    expect(result[0].name).toBe(name);
    expect(result[0].description).toBe(description);
    expect(result[0].itemCost).toBe(itemCost);
    expect(result[0].itemType.toString()).toBe(itemType);
    expect(result[0].rentalState.toString()).toBe(rentalState);

    expect(result[1].name).toBe(name2);
    expect(result[1].description).toBe(description2);
    expect(result[1].itemCost).toBe(itemCost2);
    expect(result[1].itemType.toString()).toBe(itemType2);
    expect(result[1].rentalState.toString()).toBe(rentalState2);
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

//#region ENDPOINT TESTS

//Home test
test("Home test", async () => {
    let testResponse = await testRequest.get("/home");
    expect(testResponse.status).toBe(200);
});

//404 test
test("404 test", async () => {
    let testResponse = await testRequest.get("/anything");
    expect(testResponse.status).toBe(404);
});

//#endregion