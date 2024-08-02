const express = require("express");
const dotenv = require("dotenv").config();


//configuring server
const server = express();
const port = process.env.PORT

//Basic route 
server.get('/', (req, res) => {
    res.send("Hello World");
})

//running Server
server.listen(port, () =>  {
    console.log(`Server running on Port ${port}`);
});