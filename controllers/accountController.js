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
    const sessionAccount = req.session.account || {}
    res.render("account/", {
        title: "Account Management",
        nav,
        errors: null,
        firstname: sessionAccount.account_firstname || '',
        accountId: sessionAccount.account_id || '',
        accountType: sessionAccount.account_type || ''
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
    res.redirect("/");
};

/* ****************************************
 *  Process Update account info request
 * ************************************ */
accountController.updateAccountInfo = async function (req, res) {
    let nav = await utilities.getNav()
    let { account_firstname, account_lastname, account_email} = req.body
    const account_id = req.params.id

    try {
        // Update the account information
        const updateResult = await accountModel.updateAccountInfo(
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        )

        if (updateResult) {
            // Update session account info with new values
            if (req.session && req.session.account) {
                req.session.account.account_firstname = account_firstname;
                req.session.account.account_lastname = account_lastname;
                req.session.account.account_email = account_email;

                // Regenerate JWT token with updated info
                const accessToken = jwt.sign(
                    {
                        account_id: req.session.account.account_id,
                        account_firstname: account_firstname,
                        account_type: req.session.account.account_type,
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: 3600 * 1000 }
                );

                // Set the new JWT cookie
                if (process.env.NODE_ENV === 'development') {
                    res.cookie("jwt", accessToken, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 3600 * 1000,
                        path: "/",
                        sameSite: "strict"
                    });
                } else {
                    res.cookie("jwt", accessToken, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 3600 * 1000,
                        path: "/",
                        sameSite: "strict"
                    });
                }
            }
            req.flash("notice", "✅ Your account has been updated successfully.")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Sorry, the update failed. Please try again.")
            res.status(500).render("account/update", {
                title: "Account Management",
                nav,
                errors: null,
                account_firstname,
                account_lastname,
                account_email,
                account_id
            })
        }
    } catch (error) {
        req.flash("notice", "Sorry, something went wrong. Please try again.")
        return res.status(500).render("account/update", {
            title: "Account Management",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    }
};

/* ****************************************
 *  Process Update password request
 * ************************************ */
accountController.updatePassword = async function (req, res) {
    let nav = await utilities.getNav()
    const { account_password, account_id } = req.body

    try {
        // Hash the new password before updating
        const hashedPassword = await bcrypt.hashSync(account_password, 10)

        // Update the account password
        const updateResult = await accountModel.updateAccountPassword(
            account_id,
            hashedPassword
        )

        if (updateResult) {
            req.flash("notice", "✅ Your password has been updated.")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Sorry, password update failed. Please try again.")
            res.status(500).render("account/update", {
                title: "Account Management",
                nav,
                errors: null,
                account_id
            })
        }
    }catch (error) {
        req.flash("notice", "Sorry, something went wrong. Please try again.")
        return res.status(500).render("account/update", {
            title: "Account Management",
            nav,
            errors: null,
            account_id
        })
    }
}

module.exports = accountController;
