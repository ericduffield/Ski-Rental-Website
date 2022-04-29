const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');


router.get('/home', home);
router.get('/', home);

function home(req, res) {
    const homePageData = {
        formInput: "/skiEquipment",
        image: "/images/hero.jpg",
        home: true
    };

    res.render("home.hbs", homePageData);
}

router.get('/rent', rent);

function rent(req, res) {
    const homePageData = {
        formInput: "/skiEquipment",
        image: "/images/hero.jpg",
        rent: true
    };

    res.render("rent.hbs", homePageData);
}

router.get('/about', about);

function about(req, res) {
    const homePageData = {
        formInput: "/skiEquipment",
        image: "/images/hero.jpg",
        about: true
    };

    res.render("about.hbs", homePageData);
}

function getForm(req, res) {
    const homePageData = {
        formInput: "/getSkiEquipment",
        image: "/images/hero.jpg"
    };

    res.render("getSkiEquipment.hbs", homePageData);
}

router.get('/get', getForm);



/**
 * Edit Ski Equipment Endpoint.
 * Has a form that takes in an original name, new name and new price and edits information in the database.
 */
function editForm(req, res) {
    const homePageData = {
        formInput: "/editSkiEquipment",
        image: "/images/hero.jpg",
    };

    res.render("editSkiEquipment.hbs", homePageData);
}

router.get('/edit', editForm);


/**
 * Delete Ski Equipment Endpoint.
 * Has a form that takes in a name and deletes it from the database.
 */
function deleteForm(req, res) {
    const homePageData = {
        formInput: "/deleteSkiEquipment",
        image: "/images/hero.jpg",
    };

    res.render("deleteSkiEquipment.hbs", homePageData);
}

router.get('/delete', deleteForm);

//#endregion

//#region MODEL INTERACTION ENDPOINTS

/**
 * Adds ski equipment to the database using model.addSkiEquipment function.
 * Takes in specified name and price.
 * If successful, renders the showSkiEquipment view, else renders the form with an error message and an alert image.
 */
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
        //Checks if error status is 400, if yes alert class if alert-primary, else alert-secondary
        let className = err.status = 400 ? "alert-primary" : "alert-secondary";
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("home.hbs", { alertMessage: err.message, image: "/images/warning.webp", alertClass: className });
    }
}

//Add
router.post('/skiEquipment', add);


/**
 * Gets all ski equipment to the database using model.listSkiEquipment function.
 * If successful, renders the listSkiEquipment view with a list of all equipment, else renders the form with an error message and an alert image.
 */
async function list(req, res) {
    try {
        //Tries get ski equipment from the database and if successful, renders the listSkiEquipment with results
        let rows = await model.listSkiEquipment();
        res.render("listSkiEquipment.hbs", { rows: rows, image: "/images/hero.jpg", });
        logger.info("Ski Equipment found successfully");
    }
    catch (err) {
        //Checks if error status is 400, if yes alert class if alert-primary, else alert-secondary
        let className = err.status = 400 ? "alert-primary" : "alert-secondary";
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("error.hbs", { alertMessage: err.message, alertClass: className });
    }
}

//List
router.get('/listSkiEquipment', list);


/**
 * Gets ski equipment to the database using model.addSkiEquipment function.
 * Takes in specified name.
 * If successful, renders the showSkiEquipment view, else renders the form with an error message and an alert image.
 */
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
        //Checks if error status is 400, if yes alert class if alert-primary, else alert-secondary
        let className = err.status = 400 ? "alert-primary" : "alert-secondary";
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("getSkiEquipment.hbs", { alertMessage: err.message, image: "/images/warning.webp", alertClass: className });
    }
}

//Get
router.post('/getSkiEquipment', get);


/**
 * Edits ski equipment in the database using model.replaceSkiEquipment function.
 * Takes in original name a new name and a new price.
 * If successful, renders the showSkiEquipment view with new information, else renders the form with an error message and an alert image.
 */
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
        //Checks if error status is 400, if yes alert class if alert-primary, else alert-secondary
        let className = err.status = 400 ? "alert-primary" : "alert-secondary";
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("editSkiEquipment.hbs", { alertMessage: err.message, image: "/images/warning.webp", alertClass: className });
    }
}

//Edit
router.post('/editSkiEquipment', edit);


/**
 * Deletes ski equipment from the database using model.deleteSkiEquipment function.
 * Takes in a specified name.
 * If successful, renders the showSkiEquipment view with deleted information, else renders the form with an error message and an alert image.
 */
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
        //Checks if error status is 400, if yes alert class if alert-primary, else alert-secondary
        let className = err.status = 400 ? "alert-primary" : "alert-secondary";
        logger.error(err.message);
        //Renders the form again with error message and alert image
        res.render("deleteSkiEquipment.hbs", { alertMessage: err.message, image: "/images/warning.webp", alertClass: className });
    }
}

//Delete
router.post('/deleteSkiEquipment', deleteSki);

module.exports = {
    router,
    routeRoot
}