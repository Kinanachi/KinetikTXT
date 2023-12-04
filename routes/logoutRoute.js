// Express Variables
const express = require("express")
const {databasePool, isAuthenticated} = require("../index.js")
const router = express.Router()

router.get("/logout", isAuthenticated, (req, res) => 
{
    req.session.destroy(error => 
    {
        if (error)
        {
            return res.redirect("/")
        }
        return res.redirect("/login")
    })
})

module.exports = router