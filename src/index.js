import express from "express";
import dotenv from "dotenv";
import dbconnect from "./db/dbConnect.js";

dotenv.config();

const app = express();

dbconnect();

app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});


app.listen(process.env.PORT,() => {
    console.log("server work")
})

