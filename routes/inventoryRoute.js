const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/item/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to trigger intentional error for testing
router.get("/error", utilities.handleErrors(invController.triggerError))

module.exports = router;
