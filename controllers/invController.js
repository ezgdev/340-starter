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

module.exports = invCont
