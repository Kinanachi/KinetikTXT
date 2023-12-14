// Notes
// https://www.npmjs.com/package/express-socket.io-session 

// Dependencies
const express = require("express")
const expressSanitizer = require("express-sanitizer")
const validator = require("validator") // To sanitise data outside of a route
const expressSession = require ("express-session")
const expressSocketIoSession = require("express-socket.io-session")
const http = require("http")
const socketIo = require("socket.io")
const ejs = require("ejs")
const mysql = require("mysql")
const bodyParser= require ("body-parser")
const request = require("request")

// Password Hashing Variables
// Needed to create the test users
const bcrypt = require("bcrypt")
const { Console } = require("console")
const saltRounds = 10

// Database Setup
// Create a connection pool so other files can access it
const databaseSettings =
{
    host: "localhost",
    user: "arobi008",
    password: "github",
    database: "KinetikTXT",
}
const databasePool = mysql.createPool(databaseSettings)

// Server Variables
const app = express()
const httpServer = http.createServer(app)
const io = socketIo(httpServer, { path: "" })
const port = 8000

// API Variables
let randomWord = ""
let clientsOnline = 0 // Doesn't take into account if someone is logged in or not
let usersOnline = 0

// Message Variables
let globalMessageCapacity = 24
let globalMessageStorage = Array(globalMessageCapacity).fill({user_id: "1", username:"KinetikTXT", content: "Example Global Message" , time: ""})

// Create express-session middleware
const session = expressSession
({
    secret: "makesuretokeepsomelethalcompany",
    resave: false,
    saveUninitialized: false,
    cookie: 
    {
        expires: 600000
    }
})

// Socket.io Events
// Minimal functionality, allows clients to send global message to each other
function fireClientConnected(socket)
{
    //console.log(`Client(${socket.id}) Connected...\nSession ID is: ${socket.handshake.sessionID}`)
    clientsOnline += 1

    // Get session data
    const sessionData = socket.handshake.session
    if (sessionData.user_id)
    {
        usersOnline += 1
        console.log(`Client(${socket.id}) has been identified as User ${sessionData.username}(${sessionData.user_id})`)
    }

    // Event handling
    socket.on("sendGlobalMessage", (message) => fireSendGlobalMessage(socket, sessionData, message))
    socket.on("disconnect", () => fireClientDisconnected(socket, sessionData))
    socket.on("clientReady", () => fireClientReady(socket, sessionData))
}

function fireClientReady(socket, sessionData)
{
    if (sessionData.user_id)
    {
        console.log(`Syncing User ${sessionData.username}(${sessionData.user_id})`)
    }
    else
    {
       //console.log(`Syncing Client(${socket.id})`)
    }
    socket.emit("updateGlobalMessages", globalMessageStorage)
    socket.emit("updateRandomWord", randomWord)
}

function fireClientDisconnected(socket, sessionData)
{
    //console.log(`Client(${socket.id}) Disconnected`)
    clientsOnline -= 1
    if (sessionData.user_id)
    {
        usersOnline -= 1
    }
}

async function fireSendGlobalMessage(socket, sessionData, message)
{
    if (sessionData.user_id)
    {
        // Make sure the message actually exists
        if (message !== null && message.trim() !== "")
        {
            // Clean the message
            message = validator.escape(message)
            console.log(`Global Message received from User ${sessionData.username}(${sessionData.user_id})`)

            // Add the new message to storage
            globalMessageStorage.push({user_id: sessionData.user_id, username: sessionData.username, content: message, time: new Date().toISOString() })
    
            // Increase their message score
            let query = 
            `
                UPDATE Users
                SET message_score = message_score + 1
                WHERE user_id = ?
            `
            await databaseQuery(query, sessionData.user_id)

            // Check if new message matches the random word
            if (message === randomWord)
            {
                // Increase their score
                let query = 
                `
                    UPDATE Users
                    SET score = score + 1
                    WHERE user_id = ?
                `
                await databaseQuery(query, sessionData.user_id)

                // Then get their current score
                query = "SELECT score FROM Users WHERE user_id = ?"
                const userScore = (await databaseQuery(query, sessionData.user_id))[0]
                let score = "x"
                if (userScore)
                {
                    score = userScore.score
                }

                globalMessageStorage.push({user_id: "", username: "KinetikTXT", content: `${sessionData.username} SCORED A POINT! THEY NOW HAVE ${score} POINTS!`, time: new Date().toISOString() })

                randomWord = await callRandomWordAPI()
                io.emit("updateRandomWord", randomWord)
            }
        
            if (globalMessageStorage.length > globalMessageCapacity)
            {
                globalMessageStorage.shift()
            }
        
            console.log("Syncing all Clients")
            io.emit("updateGlobalMessages", globalMessageStorage)
        }
    }
    else
    {
        // Someone may or may not be acting cheeky
        console.log("Global Message received from an unauthenticated source!")
    }
}

// Server Start
function startServer(connection)
{
    // Setup the default users
    const plainTextPassword = "123123123"
    const hashedPassword = bcrypt.hashSync(plainTextPassword, saltRounds)
    const query = "CALL CreateUser(?, ?, ?)"
    const values = ["KinetikTXT", "kt@kt.com", hashedPassword]

    connection.query(query, values, (error, results) => 
    {
        if (error) 
        {
            console.log("Something went wrong while creating the root user!")
        } 
    })

    // Setup Socket.io Connection Event
    io.use(expressSocketIoSession(session, {
        autoSave: true,
    }))
    io.on("connection", fireClientConnected)

    // Express.js Setup
    const indexRoute = require("./routes/indexRoute")
    const globalchatRoute = require("./routes/globalchatRoute")
    const loginRoute = require("./routes/loginRoute")
    const databaseRoute = require("./routes/databaseRoute")
    const aboutRoute = require("./routes/aboutRoute")
    const profileRoute = require("./routes/profileRoute")
    const logoutRoute = require("./routes/logoutRoute")
    const processfriendshipRoute = require("./routes/processfriendshipRoute")
    const apiRoute = require("./routes/apiRoute")

    app
        .set("view engine", "ejs")
        .engine("html", ejs.renderFile)
        .use(express.static(__dirname + "/public"))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(expressSanitizer())
        .use(session)
        .use(indexRoute)
        .use(globalchatRoute)
        .use(loginRoute)
        .use(databaseRoute)
        .use(aboutRoute)
        .use(profileRoute)
        .use(logoutRoute)
        .use(processfriendshipRoute)
        .use(apiRoute)

    // Start KinetikTXT
    httpServer.listen(port, async() => 
    {
        console.log("KinetikTXT is running!")

        // Set the first random word
        try
        {
            randomWord = await callRandomWordAPI()
            io.emit("updateRandomWord", randomWord)
        }
        catch (error)
        {
            console.error(error.message)
        }
    })
}

// Attempt to get a connection from the database pool
databasePool.getConnection((error, connection) => 
{
    if (error) 
    {
      console.log("Couldn't connect to the database pool!", error.message)
      console.error("Failed to start KinetikTXT!")
      
      // This should stop everything
      process.exit(1)
    }
  
    console.log("Connected to the database pool")
    startServer(connection)
    // Release the connection back to the pool when done
    connection.release()
})

// Other Functions
function isAuthenticated(req, res, next)
{
    if (req.session.user_id)
    {
        next()
    }
    else
    {
        res.redirect("/login")
    }
}

function serverStats(req, res, next)
{
    req.randomWord = randomWord
    req.clientsOnline = clientsOnline
    req.usersOnline = usersOnline
    next()
}

// Just create one function for running queries to reduce repeating code
async function databaseQuery(query, values)
{
    const promise = new Promise((resolve, reject) =>
    {
        // Connect to the pool
        databasePool.getConnection((error, connection) => 
        {
            if (error) 
            {
                reject(error)
                return
            }
        
            // Run query
            connection.query(query, values, (error, results) => 
            {
                connection.release()

                if (error) 
                {
                    reject(error)
                } 
                else 
                {
                    resolve(results)
                }
            })
        })
    })
    return promise
}

// This function is asynchronous
function callRandomWordAPI()
{
    const url = "https://random-word-api.herokuapp.com/word"

    return new Promise((resolve, reject) => 
    {
        request(url, (error, response, body) => 
        {
            if (error)
            {
                console.error("Failed to get random word!")
            }
            else
            {
                try
                {
                    var newRandomWord = JSON.parse(body)[0]
                    if (newRandomWord)
                    {
                        console.log(`Random Word selected: ${newRandomWord}`)
                        resolve(newRandomWord)
                    }
                    else
                    {
                        reject(new Error("No random word found!"))
                    }
                }
                catch (parseError)
                {
                    reject(parseError)
                }
            }
        })
    })
}

// Export for other js scripts to require
module.exports = 
{
    databasePool: databasePool,
    isAuthenticated: isAuthenticated,
    databaseQuery: databaseQuery,
    serverStats: serverStats
}