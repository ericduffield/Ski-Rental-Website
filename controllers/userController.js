const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

//#region USER PAGES

router.get('/home', home);
router.get('/', home);

function home(req, res) {
    const homePageData = {
        image: "/images/hero.jpg",
        home: true
    };

    res.render("home.hbs", homePageData);
}

router.get('/rent', rent);

function rent(req, res) {
    const homePageData = {
        image: "/images/hero.jpg",
        rent: true,
        items: [
            {
                name: "Snowboard",
                formInput: "/rentSumbit",
            }
        ]
    };

    res.render("rent.hbs", homePageData);
}

router.get('/about', about);

function about(req, res) {
    const homePageData = {
        image: "/images/hero.jpg",
        about: true
    };

    res.render("about.hbs", homePageData);
}

router.get('/get', getForm);

function getForm(req, res) {
    const homePageData = {
        formInput: "/getSkiEquipment",
        image: "/images/hero.jpg"
    };

    res.render("getSkiEquipment.hbs", homePageData);
}

//#endregion

//#region USER ACTIONS

router.post('/rentSumbit', rentSumbit);

async function rentSumbit(req, res) {
    try {

        console.log("Successfully rented ski equipment");
        rentResponse(res, "/images/hero.jpg", "Successfully rented ski equipment", false);
    }
    catch (err) {
        console.error(err.message);
        //Renders rent page again with error message
        rentResponse(res, "/images/warning.webp", err.message, true);
    }
}

function rentResponse(res, imageUrl, theMessage, errorStatus) {
    const pageData = {
        image: imageUrl,
        error: errorStatus,
        message: theMessage,
        rent: true,
        items: [
            {
                name: "Snowboard",
                formInput: "/rentSumbit",
            }
        ]
    }

    res.render("rent.hbs", pageData);
}

//#endregion

module.exports = {
    router,
    routeRoot
}