const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// route for the path that will be sent when the "Login" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// route for the path that will be sent when the "Register" link is clicked
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// route for the path to logged
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildLogged))

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Process the registration data 
router.post(
    '/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))


module.exports = router;
