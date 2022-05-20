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

/**
 * Displays the home page
 * @param {*} request The request object
 * @param {*} response The response object
 */
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

    if (!await model.authenticateUser(request)) {
        response.render("home.hbs", pageData);
    }
    else {
        pageData.loggedIn = true;
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });
        response.render("home.hbs", pageData);
    }
}

/**
 * Displays the rentals page
 * Refreshes the authenticated cookie if someone is logged in
 * @param {*} request The request object
 * @param {*} response The response object
 */
router.get('/rent', async function (request, response) {
    const pageData = {
        rent: true,
        items:
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
                },
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

    if (!await model.authenticateUser(request)) {
        response.status(400);
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        pageData.loggedIn = true;
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });
        response.render("rent.hbs", pageData);
    }
});

/**
 * Controller logic for the rentals
 * @param {*} request The request object
 * @param {*} response The response object
 */
router.post('/rentSubmit', async function (request, response) {
    const pageData = {
        rent: true,
        items:
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
                },
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

    let startTime = request.body.startTime;
    let startDate = request.body.startDate;
    let duration = request.body.duration;
    let itemType = request.body.itemType;
    let endTime = "";

    if (!await model.authenticateUser(request)) {
        response.status(400);
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });


        // Make sure variables are correct time
        try {
            startTime = new Date(startDate + 'T' + startTime);
            duration = parseInt(duration);
            endTime = new Date(addTime(startTime, { hours: duration }));
        }
        catch (error) {
            logger.error(error.message);
        }

        // Try to create the rental
        try {
            // Create the rental
            await model.createRental(session.userId, startTime, endTime, duration, itemType);
            logger.info("Successfully rented ski equipment");

            // Get the user fields from the id in the cookies
            const user = await model.getUserById(session.userId);
            const userType = await model.getUserTypeFromTypeId(user.userType);

            const rentals = await model.getRentalFromUserId(user.id);

            const pageData = {
                loggedIn: false,
                userFields: [
                    { name: "First Name", value: user.firstName },
                    { name: "Last Name", value: user.lastName },
                    { name: "Username", value: user.username },
                    { name: "User Type", value: userType },
                    { name: "Credit", value: user.credit }
                ],
                userRentals: []
            }

            if (rentals != null) {

                for (let i = 0; i < rentals.length; i++) {
                    const item = await model.getItemById(rentals[i].itemId);
                    const itemType = await model.getItemTypeById(item.itemType);
                    pageData.userRentals.push({
                        rental: [
                            { name: "Id", value: rentals[i].id },
                            { name: "Start Time", value: rentals[i].startTime.substr(0, 21) },
                            { name: "End Time", value: rentals[i].endTime.substr(0, 21) },
                            { name: "Duration", value: rentals[i].duration + ' hours' },
                            { name: "Rental cost", value: formatter.format(item.itemCost * 0.2) },
                            { name: "Item Name", value: item.name },
                            { name: "Item Cost", value: formatter.format(item.itemCost) },
                            { name: "Item Type", value: itemType.name }
                        ]
                    });
                }
            }
            pageData.loggedIn = true;

            response.render("account.hbs", pageData);
        }
        catch (err) {
            // If it didn't work, display error message and return to rental page
            logger.error(err.message);
            response.render('rent.hbs', { message: err.message });
        }
    }
}
);

// Create our number formatter.
var formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
});

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

    if (!await model.authenticateUser(request)) {
        response.render("about.hbs", pageData);


    }
    else {
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