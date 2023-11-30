const express = require("express")
const router = express.Router()

router.get("/login", (req, res) => 
{
    const showHeader = true
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>L O G  <span class="kinetik-blue">I N</span></h1>
            <p class="italic">and get typing...</p>
        </div>

        <div class = "generic-container">
            <div class = "generic-content50">
                <p>Type in your login details</p>
                <p>Email</p>
                <p>Password</p>
                <p>(Pretend I'm a button)</p>
            </div>

            <div class = "generic-content50">
                <p>Register an account</p>
                <p>Username</p>
                <p>First Name</p>
                <p>Last Name</p>
                <p>Email</p>
                <p>Password</p>
                <p>(Pretend I'm a button)</p>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, showHeader})
})

module.exports = router