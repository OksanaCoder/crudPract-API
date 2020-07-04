const express = require("express");
const {join} = require("path")

const listendspoint = require("express-list-endpoints"); 
const studentRouter = require("./services/studentPro")

const port = 3003

const server = express()
const staticFolderPath = join(__dirname, "../public")

server.use(express.static(staticFolderPath))
server.use(express.json())
server.use("/students", studentRouter)


console.log(listendspoint(server))

server.listen(port, ()=>{
    console.log("Server is running on port", port)
})