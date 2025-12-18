import mongoose from "mongoose";

const dbconnect = async () => {
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("connection succesful")
    }catch(err){
        console.log("error happens in db",err);
    }
}

export default dbconnect;