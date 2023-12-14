// Express Variables
const express = require("express")
const {databaseQuery, serverStats} = require("../index.js")
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

async function usersByMessageScore()
{
    const query = // In order of score
    `
        SELECT user_id, username, score, message_score FROM Users
        ORDER BY message_score DESC
    `
    const values = []

    return await databaseQuery(query, values)
}

router.get("/api/users", async (req, res) => 
{
    // Get the search term
    const term = req.sanitize(req.query.term) || ""

    try 
    {
        // It takes time to access the database, so wait for the result
        const searchResults = await searchUsers(term)
        res.json(searchResults)
    }
    catch (error)
    {
        // Something went wrong somewhere
        res.redirect("/")
    }
})

router.get("/api/leaderboard", async (req, res) => 
{
    try 
    {
        // It takes time to access the database, so wait for the result
        const searchResults = await usersByScore()
        res.json(searchResults)
    }
    catch (error)
    {
        // Something went wrong somewhere
        res.redirect("/")
    }
})

router.get("/api/stats", serverStats, async (req, res) => 
{
    try 
    {
        // It takes time to access the database, so wait for the result
        let stats = {}
        stats.randomWord = req.randomWord
        stats.clientsOnline = req.clientsOnline
        stats.usersOnline = req.usersOnline
        res.json(stats)
    }
    catch (error)
    {
        // Something went wrong somewhere
        res.redirect("/")
    }
})

router.get("/api/chatterbox", serverStats, async (req, res) => 
{
    try 
    {
        // It takes time to access the database, so wait for the result
        const searchResults = await usersByMessageScore()
        res.json(searchResults)
    }
    catch (error)
    {
        // Something went wrong somewhere
        res.redirect("/")
    }
})

module.exports = router