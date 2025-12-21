import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    fullname:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true
    },
    coverimage:{
        type:String
    },
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    refreshToken:{
        type:String
    }
    
},{timestamps : true})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.AccessTokenGenerator = function(){
    return jwt.sign(
        {   userId:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.RefreshTokenGenerator = function(){
    return jwt.sign(
        {   
            userId:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}

export const User = mongoose.model("User", userSchema);