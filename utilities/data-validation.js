const express = require("express")
const utilities = require(".")
const { body, validationResult } = require("express-validator")

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

/*  **********************************
*  Iventory Data Validation Rules
* ********************************* */
validate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Make is required.")
            .isAlpha("en-US", { ignore: " " })
            .withMessage("Make must contain only letters."),

        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Model is required.")
            .isAlphanumeric("en-US", { ignore: " -" })
            .withMessage("Model must be letters or numbers."),

        body("inv_year")
            .notEmpty()
            .withMessage("Year is required.")
            .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
            .withMessage("Enter a valid 4 digits year."),

        body("inv_description")
            .trim()
            .notEmpty()
            .withMessage("Description is required."),

        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Image path is required."),

        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Thumbnail path is required."),

        body("inv_price")
            .notEmpty()
            .withMessage("Price is required.")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number."),

        body("inv_miles")
            .notEmpty()
            .withMessage("Miles is required.")
            .isInt({ min: 0 })
            .withMessage("Miles must be a positive integer."),

        body("inv_color")
            .trim()
            .notEmpty()
            .withMessage("Color is required."),

        body("classification_id")
            .notEmpty()
            .withMessage("Classification must be selected.")
    ]
}
/* ******************************
 * Check vehicle data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    let errors = validationResult(req)
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            message: null,
            errors,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}

/* ******************************
 * Check vehicle data and errors will be directed back to the edit view.
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    let errors = validationResult(req)
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_id
    } = req.body

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const itemName = `${inv_make} ${inv_model}`
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationList,
            message: null,
            errors,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        })
        return
    }
    next()
}

module.exports = validate