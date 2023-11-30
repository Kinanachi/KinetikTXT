// Dependencies
const express = require("express")
const expressSanitizer = require("express-sanitizer")
const http = require("http")
const socketIo = require("socket.io")
const ejs = require("ejs")
const mysql = require("mysql") // For later
const bodyParser= require ("body-parser")

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
    console.log(`Client(${socket.id}) Connected`)
    socket.on("sendGlobalMessage", (message) => fireSendGlobalMessage(socket, message))
    socket.on("disconnect", () => fireClientDisconnected(socket))
    socket.on("clientReady", () => fireClientReady(socket))
}

function fireClientReady(socket)
{
    console.log(`Client(${socket.id}) is Ready`)
    console.log(`Syncing Client(${socket.id})`)
    socket.emit("updateGlobalMessages", globalMessageStorage)
}

function fireClientDisconnected(socket)
{
    console.log(`Client(${socket.id}) Disconnected`)
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
    const testRoute = require("./routes/testRoute")

    app
        .set("view engine", "ejs")
        .engine('html', ejs.renderFile)
        .use(express.static(__dirname + "/public"))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(expressSanitizer())
        .use(indexRoute)
        .use(loginRoute)
        .use(databaseRoute)
        .use(aboutRoute)
        .use(testRoute)

    // Start KinetikTXT
    httpServer.listen(port, () => 
    {
        console.log("KinetikTXT is running!")
    })
}

startServer()