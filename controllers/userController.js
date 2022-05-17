const express = require('express');
const router = express.Router();
const routeRoot = '/';
//require user model
//const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

//#region USER PAGES

router.get('/home', home);
router.get('/', home);

function home(req, res) {
    const pageData = {
        image: "/images/hero.jpg",
        ericImage: "/images/eric.jpg",
        liamImage: "/images/liam.jpg",
        pleasureImage: "/images/pleasure.jpg",
        snowboardImage: "/images/snowboardMain.jpg",
        skiImage: "/images/skiMain.png",
        home: true
    };

    res.render("home.hbs", pageData);
}

router.get('/rent', rent);

function rent(req, res) {
    const pageData = {
        image: "/images/hero.jpg",
        snowboardImage: "/images/snowboardMain.jpg",
        skiImage: "/images/skiMain.png",
        helmet: "/images/helmet.png",
        skiBoots: "/images/skiBoots.png",
        goggles: "/images/goggles.png",
        poles: "/images/poles.png",
        snowboardBoots: "/images/snowbardBoots.png",
        rent: true,
        items: [
            {
                name: "Snowboard",
                formInput: "/rentSumbit",
            }
        ]
    };

    res.render("rent.hbs", pageData);
}

router.get('/about', about);

function about(req, res) {
    const pageData = {
        image: "/images/hero.jpg",
        about: true
    };

    res.render("about.hbs", pageData);
}

router.get('/get', getForm);

function getForm(req, res) {
    const pageData = {
        formInput: "/getSkiEquipment",
        image: "/images/hero.jpg"
    };

    res.render("getSkiEquipment.hbs", pageData);
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

function rentResponse(res, imageUrl, theMessage) {
    const pageData = {
        image: imageUrl,
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