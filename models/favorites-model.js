const pool = require("../database/")

/* *****************************
*   Add favorite item
* *************************** */
async function addFavorite(account_id, inv_id) {
    try {
        const sql = `
            INSERT INTO favorites (account_id, inv_id)
            VALUES ($1, $2)
            ON CONFLICT (account_id, inv_id) DO NOTHING
            RETURNING *`
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rows[0] || { alreadyExists: true }
    } catch (error) {
        console.error("Error in addFavorite:", error)
        return null
    }
}


/* **********************
*   Get all favorite items for an account
* ********************* */
async function getFavorites(account_id) {
    try {
        const sql = "SELECT f.inv_id, i.inv_make, i.inv_model, i.inv_price FROM favorites f JOIN inventory i ON f.inv_id = i.inv_id WHERE f.account_id = $1"
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        return null
    }
}

/* *****************************
*   Remove favorite item
* *************************** */
async function removeFavorite(account_id, inv_id) {
    try {
        const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *"
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rowCount > 0 ? result.rows[0] : null
    } catch (error) {
        return null
    }
}


module.exports = {addFavorite, getFavorites, removeFavorite}
