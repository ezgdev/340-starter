const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

// route for the path that will be sent when the "Login" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// route for the path that will be sent when the "Register" link is clicked
router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
);

// route for the path to logged
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildLogged)
);

// route for the path to update account
router.get(
    "/update/:id",
    utilities.checkLogin,
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.buildUpdate)
);

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);
// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the logout
router.get(
    "/logout",
    utilities.checkLogin,
    utilities.handleErrors(accountController.accountLogout)
);

// Process to update-info account
router.post(
    "/update-info/:id",
    utilities.checkLogin,
    regValidate.updateDataRules(),
    regValidate.checkUpdateDataRules,
    utilities.handleErrors(accountController.updateAccountInfo)
)

// Process to update-password account
router.post(
    "/update-password/:id",
    utilities.checkLogin,
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePasswordRules,
    utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;
