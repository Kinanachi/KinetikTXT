// Express Variables
const express = require("express")
const {databasePool, isAuthenticated} = require("../index.js")
const router = express.Router()

router.get("/profile", isAuthenticated, (req, res) => 
{
    const showHeader = true
    const showProfile = true
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>Y O U R  <span class="kinetik-blue">P R O F I L E</span></h1>
            <p class="italic">Welcome back [${req.session.user_id}] ${req.session.username}</p>
        </div>
        
        <div class = "generic-container">
            <div class = "generic-content50">
                <p>Account number: ${req.session.user_id}</p>
                <p>Account username: ${req.session.username}</p>
                <p>Account email: ${req.session.email}</p>
            </div>

            <div class = "generic-content50">
                <a href="/logout" class="account-input-button">
                    <button class="account-input-button">Log out</button>
                </a>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, showHeader, showProfile})
})

module.exports = router