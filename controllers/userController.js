const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
const addTime = require("add-time");
//require user model
//const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

//#region USER PAGES

router.get('/', home);
router.get('/home', home);

async function home(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        ericImage: "/images/eric.jpg",
        liamImage: "/images/liam.jpg",
        pleasureImage: "/images/pleasure.jpg",
        snowboardImage: "/images/snowboardMain.jpg",
        skiImage: "/images/skiMain.png",
        home: true
    };

    if(!await model.authenticateUser(request)){
        response.render("home.hbs", pageData);
    }
    else{
        pageData.loggedIn = true;
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        response.render("home.hbs", pageData);
    }    
}

router.get('/rent', async function (request, response) {
    const pageData = {
        rent: true,
        itemsSnow: 
        [
            {               
                name: "Snowboard",
                formInput: "/rentSubmit",
                image: "/images/snowboardMain.jpg",
                itemType: "Snowboards",
            },
            {
                name: "Snowboard Boots",
                formInput: "/rentSubmit",
                image: "/images/snowbardBoots.png",
                itemType: "Boots"
            }
        ],
        items: [
            
            {
                name: "Ski",
                formInput: "/rentSubmit",
                image: "/images/skiRent.png",
                itemType: "Skis"
            },
            {
                name: "Helmet",
                formInput: "/rentSubmit",
                image: "/images/helmet.png",
                itemType: "Helmets"
            },
            {
                name: "Ski Boots",
                formInput: "/rentSubmit",
                image: "/images/skiBoots.png",
                itemType: "Boots"
            },
            {
                name: "Poles",
                formInput: "/rentSubmit",
                image: "/images/poles.png",
                itemType: "Poles"
            },
        
        ]
    };

    if(!await model.authenticateUser(request)){
        response.render("login.hbs", {message: "Unauthorized Access - Please log in to an account to use this feature"}); 
    }
    else{
        pageData.loggedIn = true;
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        response.render("rent.hbs", pageData);
    }
});

router.post('/rentSubmit', async function (request, response) {
        let startTime = request.body.startTime;
        let duration = request.body.duration;
        let itemType = request.body.itemType;  
        let endTime = "";

        if(!await model.authenticateUser(request)){
            response.render("login.hbs", {message: "Unauthorized Access - Please log in to an account to use this feature"}); 
        }
        else
        {
            const session = await model.refreshSession(request, response);
            const expiresAt = new Date(session.expiresAt);
            response.cookie("sessionId", session.id, { expires: expiresAt });
            response.cookie("userId", session.userId, { expires: expiresAt });
            response.cookie("userType", session.userType, { expires: expiresAt });       
            
            
            // Make sure variables are correct time
            try{
                startTime = new Date(startTime);
                duration = parseInt(duration);
                endTime = new Date(addTime(startTime, {hours: duration}));
            }
            catch(error){
                console.error(error.message);
            }

            // Try to create the rental
            try {
                // Create the rental
                await model.createRental(session.userId, startTime, endTime, duration, itemType);
                console.log("Successfully rented ski equipment");
                
                // TODO, change this to account so that you can see ur rental
                response.render("home.hbs", {message: "Successfully rented ski equipment"});
            }
            catch (err) {
                // If it didnt work, display error message and return to rental page
                console.error(err.message);            
                response.render('/rent', {message: err.message});
            }
        }
    }
);

router.get('/about', about);

/**
 * Displays the about page
 * Refreshes the authenticated cookie if someone is logged in
 * @param {*} request The request object
 * @param {*} response The response object
 */
async function about(request, response) {
    const pageData = {
        eric: "/images/eric.jpg",
        liam: "/images/liam.jpg",
        pleasure: "/images/pleasure.jpg",
        about: true
    };

    if(!await model.authenticateUser(request)){
        response.render("about.hbs", pageData);
        
        
    }
    else{
        pageData.loggedIn = true;
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });        
        response.render("about.hbs", pageData);
    }    
}

//#endregion

module.exports = {
    router,
    routeRoot
}