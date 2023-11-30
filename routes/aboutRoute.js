const express = require("express")
const router = express.Router()

router.get("/about", (req, res) => 
{
    const showHeader = true
    const githubURL = "https://github.com/KingNanachi/KinetikTXT"
    const githubProfileURL = "https://github.com/KingNanachi"
    const dynamicContent = 
    `
        <div class = "content-title">
            <h1>W H A T   I S   <span class="kinetik-blue">T H I S</span></h1>
            <p class = "italic">a simple website built on Node.js, EJS, Express.js, Socket.io and mySQL...</p>
        </div>
        <div class = "generic-container">
            <div class = "generic-content50">
                <p>Kinetik TXT is a demonstration of real-time chat within a web application.</p>
            </div>

            <div class = "generic-content50">
                <p>
                    Kinetik TXT allows users to interact through a global chat and private messaging. 
                    Users will be required to register an account and login in order to send messages, direct messages and add other users 
                    (however the global chat can still be spectated regardless of login status). 
                    Users gain score by being the first to type the word sent by the server. The score gained scales depending on how many users are online.
                </p>
            </div>

            <div class = "generic-content50">
                <p>
                    This project can be found on <a class = "generic-link" href="${githubURL}"> GitHub</a>
                </p>
                <p>
                    Developed by <a class = "generic-link" href="${githubProfileURL}"> Alan (King Nanachi) Robinson</a>
                </p>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, githubURL, showHeader})
})

module.exports = router