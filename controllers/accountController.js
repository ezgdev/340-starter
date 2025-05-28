const utilities = require("../utilities")

const accountController = {}    

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function(req, res, next) {
    let nav = await utilities.getNav()
    // Uncomment line if you want to show a notice when the login page is accessed
    // req.flash("notice", "Please log in to continue.") 
    res.render("account/login", {
        title: "Login",
        nav,
    })
}

accountController.buildRegister = async function(req, res, next) {
    let nav = await utilities.getNav()
    // Uncomment line if you want to show a notice when the register page is accessed
    // req.flash("notice", "Please complete all fields.") 
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

module.exports = accountController;