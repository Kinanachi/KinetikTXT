const express = require('express')
const router = express.Router()

router.get("/", (req, res) => 
{
    const dynamicText = "We do a little txting";
    const dynamicContent = 
    `
        <div class="content-title">
            <h1>K I N E T I K   <span class="kinetik-blue">T X T</span></h1>
            <p class="italic">${dynamicText}</p>
        </div>
        <div>
            <p>This is the 1st paragraph inside a div</p>
            <p>This is the 2nd paragraph inside a div</p>
        </div>
        <p>This is a paragraph below a div</p>
        <a href="/test"><button>Go to Test Page</button></a>
    `

    res.render('base', { body: dynamicContent, dynamicText });
})

module.exports = router