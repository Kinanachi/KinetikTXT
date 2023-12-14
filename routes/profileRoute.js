// Express Variables
const express = require("express")
const {databaseQuery} = require("../index.js")
const router = express.Router()

// Functions
async function getUserData(userId)
{
    const query = "SELECT user_id, username, score, message_score FROM Users WHERE user_id = ?"
    const values = [userId]

    return await databaseQuery(query, values)
}

async function getUserScore(userId)
{
    const query = "SELECT score FROM Users WHERE user_id = ?"
    const values = [userId]

    return await databaseQuery(query, values)
}

async function getFriendshipStatus(senderId, receiverId)
{
    const query = "CALL GetFriendshipStatus(?, ?)"
    const values = [senderId, receiverId]

    return await databaseQuery(query, values)
}

router.get("/profile", async (req, res) => 
{
    const showHeader = true
    const showProfile = req.session.user_id != null
    let dynamicOptions = ""
    let dynamicContent = ""

    let displayId = req.sanitize(req.query.user)
    if (!showProfile && !displayId)
    {
        // This means a client needs to log into a user first
        return res.redirect("/login")
    }
    else if(!displayId || displayId == req.session.user_id)
    {
        // This means a user wants to view their own profile
        dynamicOptions = 
        `
            <div class = "generic-content50">
                <a href="/logout" class="account-input-button">
                    <button class="account-input-button">Log out</button>
                </a>
            </div>
        `
        
        // Get the user's score
        var score = -1
        const userScore = (await getUserScore(req.session.user_id))[0]
        if (userScore)
        {
            score = userScore.score
        }

        dynamicContent = 
        `
            <div class="content-title">
                <h1>Y O U R  <span class="kinetik-blue">P R O F I L E</span></h1>
                <p class="italic">Welcome back ${req.session.username}</p>
            </div>
            
            <div class = "generic-container">
                <div class = "generic-content50">
                    <p>Account number: ${req.session.user_id}</p>
                    <p>Account username: ${req.session.username}</p>
                    <p>Account email: ${req.session.email}</p>
                    <p>Account score: ${score}</p>
                </div>
    
                ${dynamicOptions}
            </div>
        `
    }
    else
    {
        // This means a client or user wants to see another user's profile
        // Check if this user actually exists
        const displayUser = (await getUserData(displayId))[0]

        if (displayUser)
        {
            // Check if the user is logged in
            if (showProfile)
            {
                const friendshipStatus = (await getFriendshipStatus(req.session.user_id, displayUser.user_id))[0][0]
                if (friendshipStatus && friendshipStatus.success)
                {
                    //console.log("Friendship status:",friendshipStatus.status)
                    var status = "Process Friendship"
                    switch(friendshipStatus.status)
                    {
                        case "none":
                            status = "Send Friend Request"
                            break
                        case "friends":
                            status = "Remove Friend"
                            break
                        case "receiving":
                            status = "Accept Friend Request"
                            break
                        case "sending":
                            status = "Cancel Friend Request"
                            break
                    }
                
                    dynamicOptions = 
                    `
                        <div class = "generic-content50">
                            <a href="/processfriendship?receiver=${displayId}" class="account-input-button">
                                <button class="account-input-button">${status}</button>
                            </a>
                        </div>
                    `
                }
                else
                {
                    console.error("Failed to get friendship status:", friendshipStatus.message)
                }
            }

            dynamicContent = 
            `
                <div class="content-title">
                    <h1>T H E  <span class="kinetik-blue">P R O F I L E</span>   O F</h1>
                    <p class="italic">${displayUser.username}</p>
                </div>
                
                <div class = "generic-container">
                    <div class = "generic-content50">
                        <p>Account number: ${displayUser.user_id}</p>
                        <p>Account username: ${displayUser.username}</p>
                        <p>Account score: ${displayUser.score}</p>
                    </div>
        
                    ${dynamicOptions}
                </div>
            `
        }
        else
        {
            // This user doesn't exist
            dynamicContent = 
            `
                <div class="content-title">
                    <h1>T H E  <span class="kinetik-blue">P R O F I L E</span>   O F</h1>
                    <p class="italic">a user that doesn't exist...</p>
                </div>
            `
        }
    }

    res.render("base", { body: dynamicContent, showHeader, showProfile})
})

module.exports = router