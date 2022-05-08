const express = require('express');
const app = express();

const expressListRoutes = require('express-list-routes');

const controllers = ['userController', 'adminController', 'accountController', 'errorController']

app.use(express.json());

const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');

const logger = require('./logger');
const pinohttp = require('pino-http');
const httpLogger = pinohttp({
    logger: logger
});
app.use(httpLogger);


// Tell the app to use handlebars templating engine.  
//   Configure the engine to use a simple .hbs extension to simplify file naming
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');  // indicate folder for views
// Add support for forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'))

// Register routes from all controllers 
//  (Assumes a flat directory structure and common 'routeRoot' / 'router' export)
controllers.forEach((controllerName) => {
    try {
        const controllerRoutes = require('./controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, controllerRoutes.router);
    } catch (error) {
        //fail gracefully if no routes for this controller
        console.log(error);
    }
})



var handlebars = require('handlebars');
handlebars.registerHelper("decrement", function (varName, varValue, options) {
    options.data.root[varName] = varValue - 1;
});




// List out all created routes 
expressListRoutes(app, { prefix: '/' });

module.exports = app