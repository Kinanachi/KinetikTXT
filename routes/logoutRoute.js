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
            return res.redirect("https://www.doc.gold.ac.uk/usr/435/")
        }
        return res.redirect("https://www.doc.gold.ac.uk/usr/435/login")
    })
})

module.exports = router