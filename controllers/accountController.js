const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require("../models/skiEquipmentModelMysql");
const logger = require('../logger');

router.get('/login', login);
router.post('/logout', logout);
router.get('/signup', signup);
router.get('/account', account);


function login(req, res) {
    res.render("login.hbs");
}
function logout(req, res){
    const authenticatedSession = authenticateUser(req);
    if (!authenticatedSession) {
        res.sendStatus(401); // Unauthorized access
        return;
    }
    delete sessions[authenticatedSession.sessionId]
    console.log("Logged out user " + authenticatedSession.userSession.username);
    
    res.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
    res.redirect('/');

}
function signup(req, res) {
    res.render("signup.hbs");
}
function account(req, res) {
    res.render("account.hbs");
}

//=================FORM SUBMISSION ENDPOINTS====================


router.post('/loginSubmit', loginSubmit);
router.post('/signupSubmit', signupSubmit);

async function loginSubmit(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const user = await model.getUserByUsername(username);

    //Check if user exists
    if(await model.verifyLogin(username, password)){
        const s = require('../server');
        // Create a session object that will expire in 2 minutes
        const userType = await model.getUserTypeFromTypeId(user.userType);
        const sessionId = await s.createSession(user.id, userType, 5);
        
        const currentSession = await model.getCurrentSession(sessionId);
        const expiresAt = new Date(currentSession.expiresAt);

        // Save cookie that will expire.
        res.cookie("sessionId", sessionId, { expires: expiresAt }); 
        res.cookie("userId", user.userId, { expires: expiresAt });
        res.cookie("userType", userType, { expires: expiresAt });
        res.render("home.hbs");
    }
    else{
        res.render("login.hbs", {message: "Invalid username or password"});
    }
}

async function signupSubmit(req, res) {    
    try{
    if(req.body.password === req.body.confirmPassword){
        //Create new user
        await model.createUser('User', req.body.username, req.body.password, req.body.firstName, req.body.lastName, 0);
        //Renders login page with success message
        res.render("login.hbs", { message: "Account created successfully!" });   
        }
        else{
            throw new Error("Password do not match");            
        }
    }
    catch(err){
        console.error(err.message);
        //Renders signup page again with error message
        res.render("signup.hbs", { message: err.message });
    }
}


module.exports = {
    router,
    routeRoot
}