const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    // Uncomment line if you want to show a notice when the login page is accessed
    // req.flash("notice", "Please log in to continue.") 
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav()
    // Uncomment line if you want to show a notice when the register page is accessed
    // req.flash("notice", "Please complete all fields.") 
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver logged view
* *************************************** */
accountController.buildLogged = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/", {
        title: "Account Management",
        nav,
        errors: null,
    })
}

/* ****************************************
 *  Deliver update account view
 * *************************************** */
accountController.buildUpdate = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const accountId = req.params.id
        // Fetch account data by id
        const accountData = await accountModel.getAccountById(accountId)
        if (!accountData) {
            const error = new Error("Account not found")
            error.status = 404
            throw error
        }
        const { account_firstname, account_lastname, account_email, account_id } = accountData

        res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(
                {
                    account_id: accountData.account_id,
                    account_firstname: accountData.account_firstname,
                    account_type: accountData.account_type,
                },
                process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 3600 * 1000,
                    path: "/",
                    sameSite: "strict"
                })
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3600 * 1000,
                    path: "/",
                    sameSite: "strict"
                })
            }

            req.session.loggedin = true
            req.session.account = {
                account_id: accountData.account_id,
                account_firstname: accountData.account_firstname,
                account_lastname: accountData.account_lastname,
                account_email: accountData.account_email,
                account_type: accountData.account_type
            }
            
            req.flash("notice", "✅ You're logged in.")
            return res.redirect("/account/")
        }
        else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
accountController.accountLogout = async function (req, res) {
    // Delete the JWT cookie
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        path: "/",
        sameSite: "strict"
    });

    // Set a flash message to inform the user
    req.flash("notice", "✅ You have been logged out.");

    // Redirect to the login page
    res.redirect("/account/login");
};

/* ****************************************
 *  Process Update account request
 * ************************************ */
accountController.updateAccount = async function (req, res) {
    let nav = await utilities.getNav()
    let { account_firstname, account_lastname, account_email, account_password } = req.body
    const account_id = req.params.id

    try {
        // Fetch current account data to fill missing fields
        const currentAccountData = await accountModel.getAccountById(account_id)
        if (!currentAccountData) {
            req.flash("notice", "Account not found.")
            return res.redirect("/account/update/" + account_id)
        }

        // Use current data if fields are missing in the request
        account_firstname = account_firstname || currentAccountData.account_firstname
        account_lastname = account_lastname || currentAccountData.account_lastname
        account_email = account_email || currentAccountData.account_email

        let hashedPassword
        if (account_password) {
            // Hash new password if provided
            hashedPassword = await bcrypt.hash(account_password, 10)
        } else {
            // Use current password if no new password provided
            hashedPassword = currentAccountData.account_password
        }

        // Update the account information
        const updateResult = await accountModel.updateAccount(
            account_id,
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (updateResult) {
            req.flash("notice", "✅ Your account has been updated successfully.")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Sorry, the update failed. Please try again.")
            res.status(500).render("account/", {
                title: "Account Management",
                nav,
                errors: null,
            })
        }
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing your request.")
        return res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    }
};

module.exports = accountController;
