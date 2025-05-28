const utilities = require("../utilities")
const accountModel = require("../models/account-model")

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

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function(req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    if (regResult) {
        req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
        title: "Login",
        nav,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
        title: "Registration",
        nav,
        })
    }
}


module.exports = accountController;