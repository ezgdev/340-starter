const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// route for the path that will be sent when the "Login" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// route for the path that will be sent when the "Register" link is clicked
router.get("/register", utilities.handleErrors(accountController.buildRegister))


router.post('/register', utilities.handleErrors(accountController.registerAccount)) //


module.exports = router;

