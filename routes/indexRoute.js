const express = require("express")
const router = express.Router()

router.get("/", (req, res) => 
{
    // Lazy redirect
    if (req.session.user_id)
    {
        return res.redirect("https://www.doc.gold.ac.uk/usr/435/globalchat")
    }
    const showHeader = true
    const dynamicText = "we do a little TXTing..."
    const showProfile = req.session.user_id != null
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>K I N E T I K   <span class="kinetik-blue">T X T</span></h1>
            <p class="italic" id="randomWordContainer">${dynamicText}</p>
        </div>
        <div class="generic-container">
            <div class="global-chat-messages" id="globalMessages">
                
            </div>
            <div class="generic-input-container">
                <form id="chatForm">
                    <input type="text" class="generic-input" id="chatInput" placeholder="You need to be logged in to send messages..." disabled>
                    <button class="generic-input-button" type="submit" disabled>Send</button>
                </form>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, dynamicText, showHeader, showProfile})
})

module.exports = router