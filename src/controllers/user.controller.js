import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadImage } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler ( async (req , res) => {

    const { username , email , fullname , password } = req.body

    if(!username || !email || !fullname || !password){
        throw new ApiError(400,"All fields required")
    }

    const existedUser = await User.findOne( { 
        $or : [ { username } , { email } ]
     } );

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const img = req.files?.avatar[0].path;
    const coverimg = req.files?.coverimage[0].path;

    if(!img){
        throw new ApiError(400,"Avatar image is required")
    }

    const uploadedImgId = await uploadImage(img);
    const uploadedCoverImgId = coverimg ? await uploadImage(coverimg) : null;

    const newUser = await User.create({
        username : username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: uploadedImgId.url,
        coverimage: uploadedCoverImgId?.url || ""
    });

    const createdUser = await User.findById(newUser._id).select("-password -__v -createdAt -updatedAt -watchHistory -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Unable to create user our fault")
    }

    return res.status(200).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export { registerUser }