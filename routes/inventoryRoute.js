const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const validate = require("../utilities/data-validation");

// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory item detail view
router.get(
    "/item/:invId",
    utilities.handleErrors(invController.buildByInventoryId)
);

// Route to trigger intentional error for testing
router.get("/error", utilities.handleErrors(invController.triggerError));

// Route to build inventory management view
router.get(
    "/management",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.buildManagementView)
);

// Route to add new classification view
router.get(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.buildAddClassificationView)
);

// POST route to add new classification with validation
router.post(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    validate.classificationRules(),
    validate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Route to add new inventory view
router.get(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.buildAddInventoryView)
);

// POST route to add new vehicle with validation
router.post(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    validate.inventoryRules(),
    validate.checkInventoryData,
    utilities.handleErrors(invController.addNewVehicle)
);

router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build edit inventory view
router.get(
    "/edit-inventory/:inventory_id",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.editInventoryView)
);

// POST route to update inventory with validation
router.post(
    "/update/",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    validate.inventoryRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

// Route to delete inventory item
router.get(
    "/delete/:inventory_id",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.deleteInventoryView)
);

// Post route to delete inventory item
router.post(
    "/delete/",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.requireRole("employee", "admin"),
    utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;
