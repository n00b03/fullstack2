import dotenv from "dotenv";
import dbconnect from "./db/dbConnect.js";
import { app } from "./app.js";

dotenv.config();

dbconnect()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log("server work")
    })
})
.catch((err) => {
    console.log("error after db connect during server listing")
})

