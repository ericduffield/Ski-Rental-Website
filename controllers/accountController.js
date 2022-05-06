const express = require('express');
const router = express.Router();
const routeRoot = '/';
//require user model
//const model = require('../models/skiEquipmentModelMysql');

const logger = require('../logger');

router.get('/login', login);

function login(req, res) {
    res.render("login.hbs");
}


router.get('/signup', signup);

function signup(req, res) {
    res.render("signup.hbs");
}


router.get('/account', account);

function account(req, res) {
    res.render("account.hbs");
}

//=================FORM SUMBMISSION ENDPOINTS====================


router.post('/loginSubmit', loginSubmit);

function loginSubmit(req, res) {
    try {

    } catch (err) {
        console.error(err.message);
        //Renders login page again with error message
        res.render("login.hbs", { message: err.message });
    }
}


module.exports = {
    router,
    routeRoot
}