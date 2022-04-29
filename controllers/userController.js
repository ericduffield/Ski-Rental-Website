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



module.exports = {
    router,
    routeRoot
}