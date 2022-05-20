const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
//require admin model

const logger = require('../logger');
const validate = require('../models/validateUtils');

/**
 * Method to validate if someone had access to an admin page
 * @param {*} request The request object
 * @returns true if they have access and false otherwise
 */
async function AdminAuth(request) {
    // Gets the current authed session
    const authenticatedSession = await model.authenticateUser(request);
    if (!authenticatedSession) {
        return false;
    }
    // Gets if the user is admin
    const isAdmin = await model.authenticatedAdmin(authenticatedSession);
    if (!isAdmin) {
        return false;
    }
    return true;
}

//#region ADMIN PAGES
/**
 * These function load the views for the 4 main admin pages: list, items, itemTypes, and users
 */

router.get('/admin', async function (request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        admin: true,
        rent: true
    };
    if (!await AdminAuth(request)) {
        response.render("error.hbs", { alertMessage: "Unauthorized Access - Please log in to an Admin account to use this feature" }); // Unauthorized access
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });
        listResponse(response, "/images/hero.jpg", false);
    }
}
);

router.get('/items', items);

async function items(request, response) {
    if (!await AdminAuth(request)) {
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        itemResponse(response, "/images/hero.jpg", false, false);
    }
}

router.get('/itemtypes', itemTypes);

async function itemTypes(request, response) {
    if (!await AdminAuth(request)) {
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        itemTypesResponse(response, "/images/hero.jpg", false, false);
    }
}

router.get('/users', users);

async function users(request, response) {
    if (!await AdminAuth(request)) {
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        usersResponse(response, "/images/hero.jpg", false, false);
    }
}

/**
 * This function renders the list view.
 * It displays all important information in the database so admins can see what they are working with.
 * It takes in an image url which will either be the default hero image or the alert image.
 * It takes in a message which will either be a success message or an error message.listResponseitems
 * @param {*} response response object
 * @param {*} imageUrl image url
 * @param {*} theMessage message to be displayed to screen
 */
async function listResponse(response, imageUrl, theMessage) {
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
        response.render("list.hbs", pageData);
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
        response.render("list.hbs", pageData);
    }
}


//#endregion

//#region ADMIN ACTIONS

//===================ITEM FORMS=====================

router.post('/addItem', addItem);

/**
 * This function adds an item to the database.
 * If it is successfully added it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function addItem(request, response) {
    try {
        //Tries to add ski equipment to the database and if successful, renders the form with success message
        if (!validate.isValidInteger(request.body.quantity))
            throw new UserDataError("Quantity must be an integer");

        console.log(request.body.itemType)
        for (let i = 0; i < request.body.quantity; i++) {
            await model.addItem(request.body.name, request.body.description, request.body.cost, request.body.itemType);
        }
        console.log("Successfully added " + request.body.name);
        itemResponse(response, "/images/hero.jpg", "Successfully added ski equipment", false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemResponse(response, "/images/warning.webp", err.message, true);
    }
}


router.post('/editItem', editItem);

/**
 * This function edits an item in the database.
 * If it is successfully edited it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function editItem(request, response) {
    try {
        //Tries to edit ski equipment in the database and if successful, renders the form with success message
        await model.editItem(request.body.id, request.body.name, request.body.description, request.body.cost, request.body.itemType);

        console.log("Successfully edited " + request.body.name);
        itemResponse(response, "/images/hero.jpg", "Successfully edited " + request.body.name, false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemResponse(response, "/images/warning.webp", err.message, true);
    }
}


router.post('/deleteItem', deleteItem);

/**
 * This function deleted an item from the database.
 * If it is successfully deleted it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function deleteItem(request, response) {
    try {
        //Tries to delete ski equipment to the database and if successful, renders the form with success message
        await model.deleteItem(request.body.id);

        console.log("Successfully deleted item");
        itemResponse(response, "/images/hero.jpg", "Successfully deleted item", false, false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemResponse(response, "/images/warning.webp", err.message, true);
    }
}

/**
 * This function renders the item view.
 * It has 3 forms: add, edit, delete
 * It takes in an image url which will either be the default hero image or the alert image.
 * It takes in a message which will either be a success message or an error message.
 * @param {*} response response object
 * @param {*} imageUrl image url
 * @param {*} theMessage message to be displayed to screen
 * @param {*} isError boolean to determine if an error has occurred
 */
async function itemResponse(response, imageUrl, theMessage, isError) {
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
                options: itemTypes,
                fieldId: 'itemType',
                fieldName: 'Item Type',
            },]
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

    response.render("form.hbs", pageData);
}


//===================ITEM TYPES FORMS=====================

router.post('/addItemType', addItemType);

/**
 * This function adds an item type to the database.
 * If it is successfully added it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function addItemType(request, response) {
    try {
        //Tries to add item type to the database and if successful, renders the form with success message
        await model.addItemType(request.body.name);

        console.log("Successfully added item type");
        itemTypesResponse(response, "/images/hero.jpg", "Successfully added item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemTypesResponse(response, "/images/warning.webp", err.message);
    }
}


router.post('/editItemType', editItemType);

/**
 * This function edits an item type in the database.
 * If it is successfully edited it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function editItemType(request, response) {
    try {
        //Tries to edit item type in the database and if successful, renders the form with success message
        await model.editItemType(request.body.id, request.body.name);

        console.log("Successfully edited item type");
        itemTypesResponse(response, "/images/hero.jpg", "Successfully edited item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemTypesResponse(response, "/images/warning.webp", err.message);
    }
}

router.post('/deleteItemType', deleteItemType);

/**
 * This function deleted an item type from the database.
 * If it is successfully deleted it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function deleteItemType(request, response) {
    try {
        //Tries to delete item type from the database and if successful, renders the form with success message
        await model.deleteItemType(request.body.id);

        console.log("Successfully deleted item type");
        itemTypesResponse(response, "/images/hero.jpg", "Successfully deleted item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        itemTypesResponse(response, "/images/warning.webp", err.message);
    }
}

/**
 * This function renders the item type view.
 * It has 4 forms: add, edit, and delete.
 * It takes in an image url which will either be the default hero image or the alert image.
 * It takes in a message which will either be a success message or an error message.
 * @param {*} response response object
 * @param {*} imageUrl image url
 * @param {*} theMessage message to be displayed to screen
 * @param {*} isError boolean to determine if an error has occurred
 */
function itemTypesResponse(response, imageUrl, theMessage, isError) {
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

    response.render("form.hbs", pageData);
}


//===================USERS FORMS=====================
router.post('/createUser', createUser);

/**
 * This function creates a user in the database.
 * If it is successfully created it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function createUser(request, response) {
    try {
        //Tries to created a user in the database and if successful, renders the form with success message
        await model.createUser(parseInt(request.body.userType) + 1, request.body.username, request.body.password, request.body.firstName, request.body.lastName, request.body.credit);

        console.log("Successfully created user");
        usersResponse(response, "/images/hero.jpg", "Successfully created user", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        usersResponse(response, "/images/warning.webp", err.message);
    }
}


router.post('/editUser', editUser);

/**
 * This function edits a user in the database.
 * If it is successfully edited it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function editUser(request, response) {
    try {
        //Tries to edit user in the database and if successful, renders the form with success message
        await model.editUser(request.body.id, request.body.userType, request.body.username, request.body.password, request.body.firstName, request.body.lastName, request.body.credit);

        console.log("Successfully edited user information");
        usersResponse(response, "/images/hero.jpg", "Successfully edited user information", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        usersResponse(response, "/images/warning.webp", err.message);
    }
}


router.post('/deleteUser', deleteUser);

/**
 * This function deleted a user from the database.
 * If it is successfully deleted it renders the form again with a success message.
 * If it is not successful it renders the form with a specific error message that explains what went wrong.
 * @param {*} request request object
 * @param {*} response response object
 */
async function deleteUser(request, response) {
    try {
        //Tries to delete user in the database and if successful, renders the form with success message
        await model.deleteUser(request.body.id);

        console.log("Successfully deleted user");
        usersResponse(response, "/images/hero.jpg", "Successfully deleted user", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image
        response.status(err.status == 400 ? 400 : 500);
        usersResponse(response, "/images/warning.webp", err.message);
    }
}


/**
 * This function renders the users view.
 * It has 3 forms: create, edit and delete.
 * It takes in an image url which will either be the default hero image or the alert image.
 * It takes in a message which will either be a success message or an error message.
 * @param {*} response response object
 * @param {*} imageUrl image url
 * @param {*} theMessage message to be displayed to screen
 * @param {*} isError boolean to determine if an error has occurred
 */
function usersResponse(response, imageUrl, theMessage, isError) {
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

    response.render("form.hbs", pageData);
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
    routeRoot,
    listResponse,
    AdminAuth
}