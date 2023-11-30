const express = require("express")
const router = express.Router()

router.get("/test", (req, res) => 
{
    const showHeader = false;
    const dynamicText = "Hello World!";
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>E X A M P L E   <span class="kinetik-blue">P A G E</span></h1>
            <p class="italic">${dynamicText}</p>
        </div>
        <p>The header should not be rendered on this page</p>
        <p>This is the 2nd paragraph</p>
        <p>This is the 3rd paragraph</p>
        <a href="/"><button>Go to Home Page</button></a>
    `

    res.render("base", { body: dynamicContent, dynamicText, showHeader })
})

module.exports = router