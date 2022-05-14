const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');
const validate = require('../models/validateUtils');


//#region ADMIN PAGES

router.get('/admin', list);

function list(req, res) {
    listResponse(res, "/images/hero.jpg", false, false);
}

router.get('/items', items);

function items(req, res,) {
    itemResponse(res, "/images/hero.jpg", false, false);
}

router.get('/itemtypes', itemTypes);

function itemTypes(req, res) {
    itemTypesResponse(res, "/images/hero.jpg", false, false);
}

router.get('/users', users);

function users(req, res) {
    usersResponse(res, "/images/hero.jpg", false, false);
}

async function listResponse(res, imageUrl, theMessage) {
    try {
        //Tries get ski equipment from the database and if successful, renders the listSkiEquipment with results
        let items = await model.getAllItems();
        let itemTypes = await model.getAllItemTypes();
        let users = await model.getAllUsers();

        logger.info("Ski Equipment fetched successfully");
        const pageData = {
            image: imageUrl,
            admin: true,
            list: true,
            message: theMessage,
            allItems: items,
            allItemTypes: itemTypes,
            allUsers: users,
            userTypes: ["Regular", "Admin"]
        }
        res.render("list.hbs", pageData);
    }
    catch (err) {
        logger.error(err.message);

        const pageData = {
            image: "/images/warning.webp",
            admin: true,
            list: true,
            error: true,
            message: err.message,
        }
        res.render("list.hbs", pageData);
    }
}


//#endregion

//#region ADMIN ACTIONS

//===================ITEM FORMS=====================

router.post('/addItem', addItem);

async function addItem(req, res) {
    try {
        //Tries to add ski equipment to the database and if successful, renders the form with success message
        if (!validate.isValidInteger(req.body.quantity))
            throw new Error("Quantity must be an integer");

        console.log(req.body.itemType)
        for (let i = 0; i < req.body.quantity; i++) {
            await model.addItem(req.body.name, req.body.description, req.body.cost, req.body.itemType, req.body.rentalState);
        }
        console.log("Successfully added " + req.body.name);
        itemResponse(res, "/images/hero.jpg", "Successfully added ski equipment", false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemResponse(res, "/images/warning.webp", err.message, true);
    }
}


router.post('/editItem', editItem);

async function editItem(req, res) {
    try {
        //Tries to edit ski equipment in the database and if successful, renders the form with success message
        let state = req.body.rentalState == 0 ? true : false;
        await model.editItem(req.body.id, req.body.name, req.body.description, req.body.cost, state, req.body.itemType);

        console.log("Successfully edited " + req.body.name);
        itemResponse(res, "/images/hero.jpg", "Successfully edited " + req.body.name, false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemResponse(res, "/images/warning.webp", err.message, true);
    }
}


router.post('/editItemRentalState', editItemRentalState);

async function editItemRentalState(req, res) {
    try {
        //Tries to edit item rental state in the database and if successful, renders the form with success message
        let state = req.body.rentalState == 0 ? false : true;
        await model.editItemRentalState(req.body.id, state);

        console.log("Successfully edited item rental state");
        itemResponse(res, "/images/hero.jpg", "Successfully edited item rental state", false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        itemResponse(res, "/images/warning.webp", err.message, true);
    }
}


router.post('/deleteItem', deleteItem);

async function deleteItem(req, res) {
    try {
        //Tries to delete ski equipment to the database and if successful, renders the form with success message
        await model.deleteItem(req.body.id);

        console.log("Successfully deleted item");
        itemResponse(res, "/images/hero.jpg", "Successfully deleted item", false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        itemResponse(res, "/images/warning.webp", err.message, true);
    }
}

async function itemResponse(res, imageUrl, theMessage, isError) {
    let itemTypes;
    try {
        itemTypes = await model.getAllItemTypes();
    }
    catch (err) {
        logger.error(err.message);
    }
    const pageData = {
        image: imageUrl,
        admin: true,
        items: true,
        message: theMessage,
        error: isError,
        forms: [{
            formName: 'Add Item',
            formInput: "/addItem",
            fields: [
                {
                    fieldId: 'name',
                    fieldName: 'Name',
                },
                {
                    fieldId: 'description',
                    fieldName: 'Description',
                },
                {
                    fieldId: 'cost',
                    fieldName: 'Cost',
                },
                {
                    combobox: true,
                    fieldId: 'rentalState',
                    fieldName: 'Rental State',
                    options: [{
                        id: 0,
                        name: 'Available'
                    },
                    {
                        id: 1,
                        name: 'Rented'
                    }]
                },
                {
                    combobox: true,
                    options: itemTypes,
                    fieldId: 'itemType',
                    fieldName: 'Item Type',
                },
                {
                    fieldId: 'quantity',
                    fieldName: 'Quantity',
                }]
        },
        {
            formName: 'Edit Item',
            formInput: "/editItem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',
            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            },
            {
                fieldId: 'description',
                fieldName: 'Description',
            },
            {
                fieldId: 'cost',
                fieldName: 'Cost',
            },
            {
                combobox: true,
                fieldId: 'rentalState',
                fieldName: 'Rental State',
                options: [{
                    id: 0,
                    name: 'Available'
                },
                {
                    id: 1,
                    name: 'Rented'
                }]
            },
            {
                combobox: true,
                options: itemTypes,
                fieldId: 'itemType',
                fieldName: 'Item Type',
            }]
        },
        {
            formName: 'Edit Item Rental State',
            formInput: "/editItemRentalState",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',
            },
            {
                combobox: true,
                fieldId: 'rentalState',
                fieldName: 'Rental State',
                options: [{
                    id: 0,
                    name: 'Available'
                },
                {
                    id: 1,
                    name: 'Rented'
                }]
            }]
        },
        {
            formName: 'Delete Item',
            formInput: "/deleteItem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',
            }]
        }]
    };

    res.render("form.hbs", pageData);
}


//===================ITEM TYPES FORMS=====================

router.post('/addItemType', addItemType);

async function addItemType(req, res) {
    try {
        //Tries to add item type to the database and if successful, renders the form with success message
        await model.addItemType(req.body.name);

        console.log("Successfully added item type");
        itemTypesResponse(res, "/images/hero.jpg", "Successfully added item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemTypesResponse(res, "/images/warning.webp", err.message);
    }
}


router.post('/editItemType', editItemType);

async function editItemType(req, res) {
    try {
        //Tries to edit item type in the database and if successful, renders the form with success message
        await model.editItemType(req.body.id, req.body.name);

        console.log("Successfully edited item type");
        itemTypesResponse(res, "/images/hero.jpg", "Successfully edited item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemTypesResponse(res, "/images/warning.webp", err.message);
    }
}

router.post('/deleteItemType', deleteItemType);

async function deleteItemType(req, res) {
    try {
        //Tries to delete item type from the database and if successful, renders the form with success message
        await model.deleteItemType(req.body.id);

        console.log("Successfully deleted item type");
        itemTypesResponse(res, "/images/hero.jpg", "Successfully deleted item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemTypesResponse(res, "/images/warning.webp", err.message);
    }
}

function itemTypesResponse(res, imageUrl, theMessage, isError) {
    const pageData = {
        image: imageUrl,
        admin: true,
        itemTypes: true,
        message: theMessage,
        error: isError,
        forms: [{
            formName: 'Add Item Type',
            formInput: "/addItemType",
            fields: [
                {
                    fieldId: 'name',
                    fieldName: 'Name',
                }]
        },
        {
            formName: 'Edit Item Type',
            formInput: "/editItemType",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',
            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            }]
        },
        {
            formName: 'Delete Item Type',
            formInput: "/deleteItemType",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            }]
        }]
    };

    res.render("form.hbs", pageData);
}


//===================USERS FORMS=====================
router.post('/createUser', createUser);

async function createUser(req, res) {
    try {
        //Tries to created a user in the database and if successful, renders the form with success message
        await model.createUser(req.body.userType, req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.credit);

        console.log("Successfully created user");
        usersResponse(res, "/images/hero.jpg", "Successfully created user", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        usersResponse(res, "/images/warning.webp", err.message);
    }
}



router.post('/editUser', editUser);

async function editUser(req, res) {
    try {
        //Tries to edit user in the database and if successful, renders the form with success message
        await model.editUser(req.body.id, req.body.userType, req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.credit);

        console.log("Successfully edited user information");
        usersResponse(res, "/images/hero.jpg", "Successfully edited user information", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        usersResponse(res, "/images/warning.webp", err.message);
    }
}


router.post('/deleteUser', deleteUser);

async function deleteUser(req, res) {
    try {
        //Tries to delete user in the database and if successful, renders the form with success message
        await model.deleteUser(req.body.id);

        console.log("Successfully deleted user");
        usersResponse(res, "/images/hero.jpg", "Successfully deleted user", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        usersResponse(res, "/images/warning.webp", err.message);
    }
}


function usersResponse(res, imageUrl, theMessage, isError) {
    const pageData = {
        image: imageUrl,
        admin: true,
        users: true,
        message: theMessage,
        error: isError,
        forms: [{
            formName: 'Create User',
            formInput: "/createUser",
            fields: [{
                fieldId: 'username',
                fieldName: 'Username',
            },
            {
                fieldId: 'firstName',
                fieldName: 'First Name',
            },
            {
                fieldId: 'lastName',
                fieldName: 'Last Name',
            },
            {
                fieldId: 'credit',
                fieldName: 'Credit',
            },
            {
                fieldId: 'password',
                fieldName: 'Password',
            },
            {
                combobox: true,
                fieldId: 'userType',
                fieldName: 'User Type',
                options: [{
                    id: 0,
                    name: 'Regular'
                },
                {
                    id: 1,
                    name: 'Admin'
                }]
            }]
        },
        {
            formName: 'Edit User',
            formInput: "/editUser",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'username',
                fieldName: 'Username',
            },
            {
                fieldId: 'firstName',
                fieldName: 'First Name',
            },
            {
                fieldId: 'lastName',
                fieldName: 'Last Name',
            },
            {
                fieldId: 'password',
                fieldName: 'Password',
            },
            {
                fieldId: 'credit',
                fieldName: 'Credit',
            },
            {
                combobox: true,
                fieldId: 'userType',
                fieldName: 'User Type',
                options: [{
                    id: 0,
                    name: 'Regular'
                },
                {
                    id: 1,
                    name: 'Admin'
                }]
            }]
        },
        {
            formName: 'Delete User',
            formInput: "/deleteUser",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            }]
        }]
    };

    res.render("form.hbs", pageData);
}

//#endregion

//Error if user gives invalid input
class UserDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserDataError";
        this.status = 400;
    }
}

module.exports = {
    router,
    routeRoot
}