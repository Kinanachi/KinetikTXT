const express = require("express")
const router = express.Router()

router.get("/database", (req, res) => 
{
    const showHeader = true
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>D A T A B A S E   <span class="kinetik-blue">S E A R C H</span></h1>
            <p class="italic">search the database for users...</p>
        </div>

        <div class = "generic-container">
            <div class="generic-input-container">
                <form id="searchForm">
                    <input type="text" class="generic-input" id="searchInput" placeholder="Search here...">
                    <button class="generic-input-button" type="submit">Search</button>
                </form>
            </div>
        </div>
    `

    res.render("base", { body: dynamicContent, showHeader})
})

module.exports = router