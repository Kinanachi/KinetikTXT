// Dependencies
const express = require("express")
const expressSanitizer = require("express-sanitizer")
const expressSession = require ("express-session")
const http = require("http")
const socketIo = require("socket.io")
const ejs = require("ejs")
const mysql = require("mysql") // For later
const bodyParser= require ("body-parser")

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
const io = socketIo(httpServer)
const port = 8000

// Message Variables
let globalMessageCapacity = 24
let globalMessageStorage = Array(globalMessageCapacity).fill({user_id: "KinetikTXT", content: "Example Global Message" , time: ""})

// Socket.io Events
// Minimal functionality, allows clients to send global message to each other
function fireClientConnected(socket)
{
    //console.log(`Client(${socket.id}) Connected`)
    socket.on("sendGlobalMessage", (message) => fireSendGlobalMessage(socket, message))
    socket.on("disconnect", () => fireClientDisconnected(socket))
    socket.on("clientReady", () => fireClientReady(socket))
}

function fireClientReady(socket)
{
    //console.log(`Client(${socket.id}) is Ready`)
    console.log(`Syncing Client(${socket.id})`)
    socket.emit("updateGlobalMessages", globalMessageStorage)
}

function fireClientDisconnected(socket)
{
    //console.log(`Client(${socket.id}) Disconnected`)
}

function fireSendGlobalMessage(socket, message)
{
    console.log(`Global Message received from Client(${socket.id})`)
    globalMessageStorage.push({user_id: `Client(${socket.id})`, content: message, time: new Date().toISOString() })

    if (globalMessageStorage.length > globalMessageCapacity)
    {
        globalMessageStorage.shift()
    }

    console.log("Syncing all Clients")
    io.emit("updateGlobalMessages", globalMessageStorage)
}

// Server Start
function startServer()
{
    // Setup Socket.io Connection Event
    io.on("connection", fireClientConnected)

    // Express.js Setup
    const indexRoute = require("./routes/indexRoute")
    const loginRoute = require("./routes/loginRoute")
    const databaseRoute = require("./routes/databaseRoute")
    const aboutRoute = require("./routes/aboutRoute")
    const profileRoute = require("./routes/profileRoute")
    const logoutRoute = require("./routes/logoutRoute")

    app
        .set("view engine", "ejs")
        .engine("html", ejs.renderFile)
        .use(express.static(__dirname + "/public"))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(expressSanitizer())
        .use(expressSession(
        {
            secret: "makesuretokeepsomelethalcompany",
            resave: false,
            saveUninitialized: false,
            cookie: 
            {
                expires: 600000
            }
        }
        ))
        .use(indexRoute)
        .use(loginRoute)
        .use(databaseRoute)
        .use(aboutRoute)
        .use(profileRoute)
        .use(logoutRoute)

    // Start KinetikTXT
    httpServer.listen(port, () => 
    {
        console.log("KinetikTXT is running!")
    })
}

// Attempt to get a connection from the database pool
databasePool.getConnection((err, connection) => 
{
    if (err) 
    {
      console.log("Couldn't connect to the database pool!", err.message)
      console.error("Failed to start KinetikTXT!")
      process.exit(1)
    }
  
    console.log("Connected to the database pool")
    startServer()
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

module.exports = 
{
    databasePool: databasePool,
    isAuthenticated: isAuthenticated
}