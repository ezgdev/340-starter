const express = require("express")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const inventoryModel = require("../models/inventory-model")


const validate = {}

/*  **********************************
*  Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .notEmpty()
            .withMessage("Classification name is required.")
            .isAlpha('en-US', { ignore: ' ' })
            .withMessage("Classification name must contain alphabetic characters only."),
    ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            message: null,
            classification_name,
        })
        return
    }
    next()
}

module.exports = validate