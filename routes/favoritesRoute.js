const express = require("express");
const router = new express.Router();
const favoritesController = require("../controllers/favoritesController");
const utilities = require("../utilities");

// Route to build the favorites view
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.buildFavorites)
);

// Route to add an item to favorites
router.post(
    "/add/:inv_id",
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.addToFavorites)
);

// Route to remove an item from favorites
router.post(
    "/remove/:inv_id",
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.removeFromFavorites)
);

module.exports = router;