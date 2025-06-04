const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validate = require("../utilities/data-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/item/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to trigger intentional error for testing
router.get("/error", utilities.handleErrors(invController.triggerError))

// Route to build inventory management view
router.get("/management", utilities.handleErrors(invController.buildManagementView))

// Route to add new classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView))

// POST route to add new classification with validation
router.post(
    "/add-classification",
    validate.classificationRules(),
    validate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)                                     
)

// Route to add new inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView))

// POST route to add new vehicle with validation
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInventoryData,
    utilities.handleErrors(invController.addNewVehicle)                                     
)

// Route to update inventory view
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


module.exports = router;
