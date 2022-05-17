const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
//require user model
//const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

//#region USER PAGES

router.get('/home', home);
router.get('/', home);

function home(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        home: true
    };

    response.render("home.hbs", pageData);
}

router.get('/rent', rent);

function rent(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        rent: true,
        items: [
            {
                name: "Snowboard",
                formInput: "/rentSumbit",
            }
        ]
    };

    if(!await model.authenticateUser(request)){
        response.render("login.hbs", {message: "Unauthorized Access - Please log in to an account to use this feature"}); 
    }
    else{
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        response.render("rent.hbs", pageData);
    }
}

router.get('/about', about);

function about(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        about: true
    };

    response.render("about.hbs", pageData);
}

router.get('/get', getForm);

function getForm(request, response) {
    const pageData = {
        formInput: "/getSkiEquipment",
        image: "/images/hero.jpg"
    };

    response.render("getSkiEquipment.hbs", pageData);
}

//#endregion

//#region USER ACTIONS

router.post('/rentSumbit', rentSumbit);

async function rentSumbit(request, response) {
    if(!await model.authenticateUser(request)){
        response.render("login.hbs", {message: "Unauthorized Access - Please log in to an account to use this feature"}); 
    }
    else{
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });       
        
        try {
            console.log("Successfully rented ski equipment");
            rentResponse(response, "/images/hero.jpg", "Successfully rented ski equipment", false);
        }
        catch (err) {
            console.error(err.message);
            //Renders rent page again with error message
            rentResponse(response, "/images/warning.webp", err.message, true);
        }
    }
}

function rentResponse(response, imageUrl, theMessage) {
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

    response.render("rent.hbs", pageData);
}

//#endregion

module.exports = {
    router,
    routeRoot
}