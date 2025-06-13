const utilities = require("../utilities")
const favoritesModel = require("../models/favorites-model")
const inventoryModel = require("../models/inventory-model")

const favoritesController = {}

/* ****************************************
*  Deliver favorite view
* *************************************** */
favoritesController.buildFavorites = async (req, res) => {
    try {
        const nav = await utilities.getNav()

        if (!req.session.account) {
            return res.redirect("/account/login")
        }

        const account_id = req.session.account.account_id
        let favorites = await favoritesModel.getFavorites(account_id)
        if (!Array.isArray(favorites)) {
            favorites = []
        }

        res.render("account/favorites", {
            title: "My Favorites",
            nav,
            favorites,
            account_id,
            errors: null 
        })

    } catch (error) {
        console.error("Error fetching favorites:", error)
        res.status(500).send("Internal Server Error")
    }
}

/* ****************************************
*  Add to favorites
* *************************************** */
favoritesController.addToFavorites = async (req, res) => {
    try {
        const account_id = req.session.account.account_id

        const inv_id = parseInt(req.params.inv_id)
        if (isNaN(inv_id)) {
            return res.status(400).send("❌ Invalid inventory ID")
        }

        const vehicle = await inventoryModel.getInventoryById(inv_id)
        if (!vehicle) {
            req.flash("notice", "❌ Vehicle not found.")
            return res.redirect("/inventory")
        }

        const favorite = await favoritesModel.addFavorite(account_id, inv_id)

        if (!favorite) {
            req.flash("notice", "❌ Failed to add to favorites.")
            return res.redirect("/favorites")
        }

        if (favorite.alreadyExists) {
            req.flash("notice", "⚠️ This vehicle is already in your favorites.")
            return res.redirect(req.get("referer"))
        }

        req.flash("notice", "✅ Item added to favorites successfully")
        res.redirect("/favorites")

    } catch (error) {
        console.error("Error adding to favorites:", error)
        res.status(500).send("Internal Server Error")
    }
}

/* ****************************************
*  Get my favorites
* *************************************** */
favoritesController.getMyFavorites = async (req, res) => {
    try {
        const account_id = req.session.account.account_id
        const favorites = await favoritesModel.getFavorites(account_id)

        if (!favorites) {
            return res.status(404).send("No favorites found")
        }

        res.json(favorites)
    } catch (error) {
        console.error("Error fetching favorites:", error)
        res.status(500).send("Internal Server Error")
    }
}

/* ****************************************
*  Remove from favorites
* *************************************** */
favoritesController.removeFromFavorites = async (req, res) => {
    try {
        const account_id = req.session.account.account_id
        
        const inv_id = parseInt(req.params.inv_id)
        if (isNaN(inv_id)) {
            return res.status(400).send("Invalid inventory ID")
        }

        const removedFavorite = await favoritesModel.removeFavorite(account_id, inv_id)

        if (!removedFavorite) {
            return res.status(404).send("Favorite not found")
        }

        req.flash("notice", "✅ Item removed from favorites successfully")
        res.redirect("/favorites")
    } catch (error) {
        console.error("Error removing from favorites:", error)
        res.status(500).send("Internal Server Error")
    }
}

module.exports = favoritesController;

