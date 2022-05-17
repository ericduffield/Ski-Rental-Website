const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
//require admin model

const logger = require('../logger');

/**
 * Method to validate if someone had access to an admin page
 * @param {*} request The request object
 * @returns true if they have access and false otherwise
 */
async function AdminAuth(request){
    const c = request.cookies;
    const authenticatedSession = await model.authenticateUser(request);
    if (!authenticatedSession) {
        return false;
    }
    const isAdmin = await model.authenticatedAdmin(authenticatedSession);
    if (!isAdmin) {
        return false;
    }
    return true;
}

//#region ADMIN PAGES
router.get('/admin', async function (request, response) {
        const pageData = {
            image: "/images/hero.jpg",
            admin: true,
            rent: true
        };
        if(!await AdminAuth(request)){
            response.render("error.hbs", {alertMessage: "Unauthorized Access - Please log in to an Admin account to use this feature"}); // Unauthorized access
        }
        else{
            response.render("adminRent.hbs", pageData);
        }   
    }
);

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
        //const added = await model.addItem(req.body.name, req.body.price);

        console.log("Successfully added ski equipment");
        itemResponse(res, "/images/hero.jpg", "Successfully added ski equipment", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders the form again with error message and alert image

        itemResponse(res, "/images/warning.webp", err.message, true);
    }
}


//router.post('/editItem', editItem);

//router.post('/deleteItem', deleteItem);

function itemResponse(res, imageUrl, theMessage) {
    const pageData = {
        image: imageUrl,
        admin: true,
        items: true,
        message: theMessage,
        forms: [{
            formName: 'Add Item',
            formInput: "/addItem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',
            },
            {
                fieldId: 'quantity',
                fieldName: 'Quantity',
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
                combobox: true,
                fieldId: 'itemType',
                fieldName: 'Item Type',
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
                fieldId: 'quantity',
                fieldName: 'Quantity',
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
                combobox: true,
                fieldId: 'itemType',
                fieldName: 'Item Type',
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

        itemTypesResponse(res, "/images/warning.webp", err.message, true);
    }
}

/*
router.post('/editItemType', editItemType);

router.post('/deleteItemType', deleteItemType);
*/

function itemTypesResponse(res, imageUrl, theMessage) {
    const pageData = {
        image: imageUrl,
        admin: true,
        itemTypes: true,
        message: theMessage,
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

        usersResponse(res, "/images/warning.webp", err.message, true);
    }
}

/*
router.post('/deleteUser', deleteUser);

*/

function usersResponse(res, imageUrl, theMessage) {
    const pageData = {
        image: imageUrl,
        admin: true,
        users: true,
        message: theMessage,
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




router.get('/listSkiEquipment', list);

async function list(req, res) {
    try {
        //Tries get ski equipment from the database and if successful, renders the listSkiEquipment with results
        let rows = await model.listSkiEquipment();
        res.render("listSkiEquipment.hbs", { rows: rows, image: "/images/hero.jpg", });
        logger.info("Ski Equipment found successfully");
    }
    catch (err) {
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("error.hbs", { message: err.message });
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


module.exports = {
    router,
    routeRoot
}