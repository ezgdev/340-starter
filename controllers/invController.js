const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.invId
    const item = await invModel.getInventoryById(inv_id)
    if (!item) {
        return res.status(404).render("errors/error", {
            title: "Item Not Found",
            message: "The requested inventory item was not found.",
        })
    }
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
        title: item.inv_make + " " + item.inv_model,
        nav,
        item,
    })
}

invCont.triggerError = async function (req, res, next) {
    throw new Error()
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const message = req.flash('message')
    const classificationList = await utilities.buildClassificationList()

    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        message,
        classificationList,
    })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const message = req.flash('message')
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message,
        errors: null,
    })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    const message = req.flash('message')
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        message: null,
        errors: null,
    })
}

/* ***************************
 *  Add new classification post handler
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    try {
        const { classification_name } = req.body
        const existingClassifications = await invModel.getClassifications()
        const exists = existingClassifications.some(
            (c) => c.classification_name.toLowerCase() === classification_name.toLowerCase()
        )
        if (exists) {
            let nav = await utilities.getNav()
            const message = "Classification name already exists, please enter a new one."
            res.render("inventory/add-classification", {
                title: "Add New Classification",
                nav,
                message,
                errors: null,
                classification_name,
            })
            return
        }
        try {
            const result = await invModel.addClassification(classification_name)
            if (result) {
                req.flash("message", `✅ Classification "${classification_name}" added successfully.`)
                res.redirect("/inv/management")
            } else {
                let nav = await utilities.getNav()
                const message = "Failed to add classification."
                res.render("inv/add-classification", {
                    title: "Add New Classification",
                    nav,
                    message,
                    errors: null,
                    classification_name,
                })
            }
        } catch (dbError) {
            let nav = await utilities.getNav()
            const message = "Database error: " + dbError.message
            res.render("inv/add-classification", {
                title: "Add New Classification",
                nav,
                message,
                errors: null,
                classification_name,
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Add new vehicle post handler
 * ************************** */
invCont.addNewVehicle = async function (req, res, next) {
    try {
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

        const result = await invModel.addNewVehicle(
            inv_make,
            inv_model,
            parseInt(inv_year),
            inv_description,
            inv_image,
            inv_thumbnail,
            parseFloat(inv_price),
            parseInt(inv_miles),
            inv_color,
            parseInt(classification_id)
        )

        if (result) {
            req.flash("message", `✅ Vehicle "${inv_make} ${inv_model}" added successfully.`)
            res.redirect("/inv/management")
        } else {
            let nav = await utilities.getNav()
            const classificationList = await utilities.buildClassificationList(classification_id)
            const message = "Failed to add vehicle, try again."
            res.render("inventory/add-inventory", {
                title: "Add New Vehicle",
                nav,
                classificationList,
                message,
                errors: null,
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
        }
    } catch (error) {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList()
        const message = "Database error: " + error.message
        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationList,
            message,
            errors: null,
        })
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inventory_id)
        const itemData = await invModel.getInventoryById(inv_id)

        if (!itemData) {
            return res.status(404).render("errors/error", {
                title: "Item Not Found",
                message: "The requested inventory item was not found.",
            })
        }

        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(itemData.classification_id)
        const itemName = `${itemData.inv_make} ${itemData.inv_model}`

        res.render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationList,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
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
    } = req.body
    const updateResult = await invModel.updateInventory(
        inv_id,
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
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("message", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/management")
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
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
    }
}


module.exports = invCont
