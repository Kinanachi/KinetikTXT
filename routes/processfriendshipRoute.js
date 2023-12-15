// Express Variables
const express = require("express")
const {databaseQuery, isAuthenticated} = require("../index.js")
const router = express.Router()

// Functions
async function processFriendship(senderId, receiverId) 
{
    const query = "CALL ProcessFriendship(?, ?)"
    const values = [senderId, receiverId]

    return await databaseQuery(query, values)
}

router.get("/processfriendship", isAuthenticated, async (req, res) => 
{
    const senderId = req.session.user_id
    const receiverId = req.sanitize(req.query.receiver)

    if ((senderId && receiverId) && (senderId != receiverId))
    {
        const result = (await processFriendship(senderId, receiverId))[0][0]
        if (result && result.success)
        {
            console.log("Processed friendship:",result.message)
            return res.redirect(`https://www.doc.gold.ac.uk/usr/435/profile?user=${receiverId}`)
        }
        else
        {
            console.error("Failed to process friendship:", result.message)
        }
    }
    else
    {

    }
    res.redirect("https://www.doc.gold.ac.uk/usr/435/profile")
})

module.exports = router