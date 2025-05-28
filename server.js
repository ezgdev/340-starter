/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const session = require('express-session')
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)

// index route
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({
    status: 404,
    title: 'Route Not Found',
    subtitle: '🚗 Oops... You’ve veered off the road!',
    message: 'Looks like this route doesn’t exist or your digital GPS got confused, but don’t worry — you’re still in the driver’s seat.',
    suggestion: 'Head back to the homepage and hit the gas again.'
  });
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  const status = err.status || 500;

  // Defaults for 500 if not provided
  const title = err.title || 'Engine Trouble';
  const subtitle = err.subtitle || '⚠️ Check engine light is on!';
  const message = err.message || ' 🛠️ Something broke under the hood — and it’s not your fault.';
  const suggestion = err.suggestion || 'Cruise back to the homepage or take a quick pit stop.';

  console.error(`Error at: "${req.originalUrl}": ${message}`);

  res.status(status).render("errors/error", {
    title,
    subtitle,
    message,
    suggestion,
    status,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
