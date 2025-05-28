const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// route for the path that will be sent when the "My Account" link is clicked
router.get("/account", utilities.handleErrors(accountController.buildMyAccount))

// route for the path that will be sent when the "Login" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

module.exports = router;

