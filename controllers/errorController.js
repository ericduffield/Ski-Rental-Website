const express = require('express');
const router = express.Router();
const routeRoot = '/';

router.all('*', error);

/**
 * Error endpoint. Most error handling is done in the form pages themselves but this endpoint is used for any errors that occur.
 * @param {*} req 
 * @param {*} res 
 */
function error(req, res) {
    res.status(404).send('Error 404: Page not found');
}

module.exports = {
    router,
    routeRoot
}