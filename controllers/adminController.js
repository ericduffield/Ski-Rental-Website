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

//#endregion

//#region ADMIN ACTIONS

//===================ITEM FORMS=====================

router.post('/addItem', addItem);

async function addItem(req, res) {
    try {
        //Tries to add ski equipment to the database and if successful, renders the form with success message
        if (!validate.isValidInteger(req.body.quantity))
            throw new Error("Quantity must be an integer");

        for (let i = 0; i < req.body.quantity; i++) {
            await model.addItem(req.body.name, req.body.description, req.body.cost, req.body.itemType);
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

async function listResponse(res, imageUrl, theMessage) {
    try {
        //Tries get ski equipment from the database and if successful, renders the listSkiEquipment with results
        let rows = await model.getAllItems();

        logger.info("Ski Equipment fetched successfully");
        const pageData = {
            image: imageUrl,
            admin: true,
            list: true,
            message: theMessage,
            item: rows
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
                    combobox: true,
                    options: itemTypes,
                    fieldId: 'itemType',
                    fieldName: 'Item Type',
                },
                {
                    fieldId: 'cost',
                    fieldName: 'Cost',
                },
                {
                    fieldId: 'quantity',
                    fieldName: 'Quantity',
                },]
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


        console.log("Successfully added item type");
        itemTypesResponse(res, "/images/hero.jpg", "Successfully added item type", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemTypesResponse(res, "/images/warning.webp", err.message);
    }
}

/*
router.post('/editItemType', editItemType);

router.post('/deleteItemType', deleteItemType);
*/

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

router.post('/editUser', editUser);

async function editUser(req, res) {

    try {
        //Tries to add item type to the database and if successful, renders the form with success message


        console.log("Successfully edited user information");
        usersResponse(res, "/images/hero.jpg", "Successfully edited user information", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        usersResponse(res, "/images/warning.webp", err.message);
    }
}

/*
router.post('/deleteUser', deleteUser);

*/

function usersResponse(res, imageUrl, theMessage, isError) {
    const pageData = {
        image: imageUrl,
        admin: true,
        users: true,
        message: theMessage,
        error: isError,
        forms: [{
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
                fieldId: 'phoneNumber',
                fieldName: 'Phone Number',
            },
            {
                fieldId: 'password',
                fieldName: 'Password',
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







//CODE FROM OLD ASSIGNMENT TO LOOK AT


router.post('/skiEquipment', add);

async function add(req, res) {

    try {
        //Tries to add ski equipment to the database and if successful, renders the showSkiEquipment with success message
        const added = await model.addSkiEquipment(req.body.name, req.body.price);
        res.render("showSkiEquipment.hbs", {
            message: "Successfully added ski equipment", name: added.name, price: added.price, image: req.body.image,
        });
        logger.info("Ski Equipment added successfully");
    }
    catch (err) {
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("home.hbs", { message: err.message, image: "/images/warning.webp" });
    }
}







router.post('/getSkiEquipment', get);

async function get(req, res) {
    try {
        //Tries to get ski equipment from the database and if successful, renders the showSkiEquipment with success message
        const result = await model.findByName(req.body.name);
        res.render("showSkiEquipment.hbs", {
            message: "Ski Equipment found successfully", name: "Name: " + result.name, price: "Price: " + result.price
        });
        logger.info("Ski Equipment found successfully");
    }
    catch (err) {
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("getSkiEquipment.hbs", { message: err.message, image: "/images/warning.webp" });
    }
}





router.post('/editSkiEquipment', edit);

async function edit(req, res) {
    try {
        //Tries to edit ski equipment in the database and if successful, renders the showSkiEquipment with success message
        let result = await model.replaceSkiEquipment(req.body.name, req.body.newName, req.body.newPrice);
        res.render("showSkiEquipment.hbs", {
            message: "Ski Equipment edited successfully", name: "Name: " + result.name, price: "Price: " + result.price
        });
        logger.info("Ski Equipment edited successfully");
    }
    catch (err) {
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("editSkiEquipment.hbs", { message: err.message, image: "/images/warning.webp" });
    }
}



router.post('/deleteSkiEquipment', deleteSki);

async function deleteSki(req, res) {
    try {
        //Tries to delete ski equipment from the database and if successful, renders the showSkiEquipment with success message
        await model.deleteSkiEquipment(req.body.name);
        res.render("showSkiEquipment.hbs", {
            message: "Ski Equipment deleted successfully"
        });
        logger.info("Ski Equipment deleted successfully");
    }
    catch (err) {
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("deleteSkiEquipment.hbs", { message: err.message, image: "/images/warning.webp" });
    }
}

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