const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
//require user model
//const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

//#region USER PAGES

router.get('/', home);
router.get('/home', home);

function home(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        ericImage: "/images/eric.jpg",
        liamImage: "/images/liam.jpg",
        pleasureImage: "/images/pleasure.jpg",
        snowboardImage: "/images/snowboardMain.jpg",
        skiImage: "/images/skiMain.png",
        home: true
    };

    response.render("home.hbs", pageData);
}

router.get('/rent', async function (request, response) {
        const pageData = {
            image: "/images/hero.jpg",
            rent: true,
            items: [
                {
                    name: "Snowboard",
                    formInput: "/rentSubmit",
                }
            ]
        };
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
);

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
                endTime = new Date(startTime).setHours(startTime.getHours() + duration);
                itemType = parseInt(itemTypeId);
            }
            catch(error){
                console.error(error.message);
            }

            // Try to create the rental
            try {
                // Create the rental
                await model.createRental(session.userId, startTime, endTime, duration, itemType);
                console.log("Successfully rented ski equipment");
                rentResponse(response, "/images/hero.jpg", "Successfully rented ski equipment", false);
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

function about(request, response) {
    const pageData = {
        image: "/images/hero.jpg",
        about: true
    };

    response.render("about.hbs", pageData);
}

//#endregion

module.exports = {
    router,
    routeRoot
}