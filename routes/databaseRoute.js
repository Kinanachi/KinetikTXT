// Express Variables
const express = require("express")
const {databaseQuery} = require("../index.js")
const router = express.Router()

// Functions
async function searchUsers(searchTerm)
{
    const query = "SELECT user_id, username, score, message_score FROM Users WHERE username LIKE ?"
    const values = [`%${searchTerm}%`] // This will search for users that contain the searchTerm anywhere in their username

    return await databaseQuery(query, values)
}

async function usersByScore()
{
    const query = // In order of score
    `
        SELECT user_id, username, score, message_score FROM Users
        ORDER BY score DESC
    `
    const values = []

    return await databaseQuery(query, values)
}

async function usersByLowScore()
{
    const query = // In order of score
    `
        SELECT user_id, username, score, message_score FROM Users
        ORDER BY score ASC
    `
    const values = []

    return await databaseQuery(query, values)
}

async function usersByUsername()
{
    const query = // In order of username
    `
        SELECT user_id, username, score, message_score FROM Users
        ORDER BY username
    `
    const values = []

    return await databaseQuery(query, values)
}

router.get("/database", async (req, res) => 
{
    const showHeader = true
    const showProfile = req.session.user_id != null

    // Get the search term
    const searchTerm = req.sanitize(req.query.searchInput) || ""

    try 
    {
        // It takes time to access the database, so wait for the result
        // Also adding 1 specific command to list all users
        let searchResults
        if (searchTerm == "!all")
        {
            searchResults = await searchUsers("")
        }
        else if (searchTerm == "!leaderboard")
        {
            searchResults = await usersByScore()
        }
        else if (searchTerm == "!loserboard")
        {
            searchResults = await usersByLowScore()
        }
        else if (searchTerm == "!name")
        {
            searchResults = await usersByUsername()
        }
        else
        {
            searchResults = await searchUsers(searchTerm)
        }

        const searchContent =
        `
            <div class = "generic-container">
                <div class="content-title">
                    <h2>S E A R C H   <span class="kinetik-blue">R E S U L T</span></h2>
                    <p class="italic">you searched for "${searchTerm}"</p>
                </div>
                <div class="generic-container">
                    ${searchResults.length > 0 ? searchResults.map(result =>
                        `
                            <div class="generic-content50">
                                <p>Username: <a class = "generic-link" href="https://www.doc.gold.ac.uk/usr/435/profile?user=${result.user_id}">${result.username}</a></p>
                                <p>Score: ${result.score}</p>
                            </div>
                        `).join("")
                        : 
                        `
                            <br><p>No results found.</p>
                        `
                    }
                </div>
            </div>
        `

        const dynamicContent = 
        `
            <div class="content-title">
                <h1>D A T A B A S E   <span class="kinetik-blue">S E A R C H</span></h1>
                <p class="italic">search the database for users...</p>
                <p class="italic">type <span class="kinetik-blue">!all</span> to list all users in the database</p>
            </div>
    
            <div class = "generic-container">
                <div class="generic-input-container">
                    <form action="/database" method="get" id="searchForm">
                        <input type="text" class="generic-input" id="searchInput" name="searchInput" placeholder="Search here...">
                        <button class="generic-input-button" type="submit">Search</button>
                    </form>
                </div>
            </div>
            <br>
            ${searchTerm.trim() !== "" ? searchContent : ""}
        `
        res.render("base", {body: dynamicContent, showHeader, showProfile})
    }
    catch (error)
    {
        // Something went wrong somewhere, redirect the user to the default search page
        console.error("Something went wrong...\n", error.message)
        return res.redirect("/database")
    }
})

module.exports = router