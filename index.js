// Dependencies
const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const ejs = require('ejs')
const mysql = require("mysql") // For later
const bodyParser= require ("body-parser") // For later

// Server Variables
const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const port = 8000

// Socket.io Events
// No useful functionality yet, just logging when a user connects
function fireClientConnected(socket)
{
    console.log("Client Connected")
    socket.on("disconnect", fireClientDisconnected)
}

function fireClientDisconnected()
{
    console.log("Client Disconnected")
}

// Server Start
function startServer()
{
    // Setup Socket.io Connection Event
    io.on("connection", fireClientConnected)

    // Express.js Setup
    const indexRoute = require("./routes/indexRoute")
    const testRoute = require("./routes/testRoute")

    app
    .set("view engine", "ejs")
    .engine('html', ejs.renderFile)
    .use(express.static(__dirname + '/public'))
    .use(indexRoute)
    .use(testRoute)

    // Start KinetikTXT
    server.listen(port, () => 
    {
        console.log("KinetikTXT is running!")
    })
}

startServer()