const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();

//configuring server
const app = express();
const port = process.env.PORT

//Middleware Configuration
app.use(express.json());
app.use("/api/user", require("./routes/userRoutes")); 
app.use(errorHandler);


//running Server
app.listen(port, () =>  {
    console.log(`Server running on Port ${port}`);
});