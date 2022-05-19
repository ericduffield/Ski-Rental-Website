const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
const adminController = require('./adminController');
const logger = require('../logger');

router.get('/login', login);
router.get('/signup', signup);

/**
 * renders the login page
 * @param {*} req The request of the method
 * @param {*} res The response of the method
 */
async function login(req, res) {
    res.render("login.hbs", { admin: await adminController.AdminAuth(req) });
}
/**
 * Renders the signup page
 * @param {*} req The request of the method
 * @param {*} res The response of the method
 */
function signup(req, res) {
    res.render("signup.hbs");
}
/**
 * Renders the account page
 * @param {*} req The request of the method
 * @param {*} res The response of the method
 */
router.get('/account', async function (request, response) {
    if (!await model.authenticateUser(request)) {
        response.render("login.hbs", { message: "Unauthorized Access - Please log in to an account to use this feature" });
    }
    else {
        const session = await model.refreshSession(request, response);
        const expiresAt = new Date(session.expiresAt);
        response.cookie("sessionId", session.id, { expires: expiresAt });
        response.cookie("userId", session.userId, { expires: expiresAt });
        response.cookie("userType", session.userType, { expires: expiresAt });
        response.render("account.hbs", { loggedIn: true });
    }
}
);
/**
 * Logout clears the existing cookies and redirects to the login page
 * It will ensure us that the old cookies are going to be deleted
 * 
 * @param {*} request 
 * @param {*} response 
 */

router.post('/logout', async function(request, response) {
    if (await model.authenticateUser(request)) {
        await model.deleteSessionById(request.cookies.sessionId);
        response.clearCookie("sessionId");
        response.clearCookie("userId");
        response.clearCookie("userType");
        response.clearCookie("user_track")
        response.redirect("/login");
    }
    else {
        response.redirect("/");
    }
});


//=================FORM SUBMISSION ENDPOINTS====================


router.post('/loginSubmit', loginSubmit);
router.post('/signupSubmit', signupSubmit);

/**
 * Function that runs on login submission, calls the model method and handles any errors
 * @param {*} req The request of the method
 * @param {*} res The response of the method
 */
async function loginSubmit(req, res) {
    const pageData = {
        image: "/images/hero.jpg",
        ericImage: "/images/eric.jpg",
        liamImage: "/images/liam.jpg",
        pleasureImage: "/images/pleasure.jpg",
        snowboardImage: "/images/snowboardMain.jpg",
        skiImage: "/images/skiMain.png",
        home: true
    };

    const username = req.body.username;
    const password = req.body.password;
    const user = await model.getUserByUsername(username);

    //Check if user exists
    if (await model.verifyLogin(username, password)) {
        // Create a session object that will expire in 2 minutes
        const userType = await model.getUserTypeFromTypeId(user.userType);
        const sessionId = await model.createSession(user.id, userType, 5);

        const currentSession = await model.getCurrentSession(sessionId);
        const expiresAt = new Date(currentSession.expiresAt);

        // Save cookie that will expire.
        res.cookie("sessionId", sessionId, { expires: expiresAt });
        res.cookie("userId", user.id, { expires: expiresAt });
        res.cookie("userType", userType, { expires: expiresAt });
        pageData.admin = userType === 'Admin';
        if (pageData.admin) {
            adminController.listResponse(res, "/images/hero.jpg", false, false);
        }
        else {
            res.redirect('/rent')
        }
    }
    else {
        res.render("login.hbs", { message: "Invalid username or password", username: username, password: password });
    }
}

/**
 * Function that runs on signup submission, calls the model method and handles any errors
 * @param {*} req The request of the method
 * @param {*} res The response of the method
 */
async function signupSubmit(req, res) {
    try {
        if (req.body.password === req.body.confirmPassword) {
            //Create new user
            await model.createUser(1, req.body.username, req.body.password, req.body.firstName, req.body.lastName, 0);
            //Renders login page with success message
            res.render("login.hbs", { message: "Account created successfully!", username: req.body.username });
        }
        else {
            throw new Error("Password do not match");
        }
    }
    catch (err) {
        console.error(err.message);
        //Renders signup page again with error message
        res.render("signup.hbs", { message: err.message, username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, password: req.body.password, conformPassword: req.body.confirmPassword });
    }
}


module.exports = {
    router,
    routeRoot
}