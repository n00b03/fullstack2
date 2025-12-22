import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadImage } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenRefreshToken = async function(userId){
    try{
        const user = await User.findById(userId);

        const accessToken = await user.AccessTokenGenerator();
        const refreshToken = await user.RefreshTokenGenerator();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave : false });
        return { accessToken, refreshToken };

    }catch(err){
        throw new ApiError(500,"Token generation failed")
    }

}

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
    let coverimg;

    if(req.files?.coverimage){
        coverimg = req.files?.coverimage[0].path;
    }

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

const loginUser = asyncHandler ( async (req , res) => {
    const { username , email , password } = req.body;

    if((!username && !email) || !password){
        throw new ApiError(400,"All fields required")
    }

    const user = await User.findOne({$or : [{username},{email}]});

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials")
    }

    const { accessToken , refreshToken } = await generateAccessTokenRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -__v -createdAt -updatedAt -watchHistory -refreshToken");

    const options = {
        httpOnly: true,
        secure:true
    };

    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    )

});

const logoutUser = asyncHandler ( async (req,res) => {
    await User.findByIdAndUpdate(req.user.id,
        {
            $set: { refreshToken: undefined }
        },{
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure:true
    };

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200,{},"User logged out successfully")
    )
})

const getAccessToken = asyncHandler ( async (req,res) => {
    const token = req.cookies?.refreshToken;
    if(!token){
        throw new ApiError(401,"Refresh token missing")
    }

    const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET
    );

    const isUserExists = await User.findById(decoded?.userId);

    if(!isUserExists){
        throw new ApiError(404,"User not found")
    }

    if(isUserExists.refreshToken !== token){
        throw new ApiError(401,"Invalid refresh token")
    }

    const { accessToken , refreshToken } = await generateAccessTokenRefreshToken(isUserExists._id);
    const options = {
        httpOnly: true,
        secure:true
    };

    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(200,
            {
                accessToken,
                refreshToken
            },
            "Access token generated successfully"
        )
    )
});

const passwordChange = asyncHandler ( async (req,res) => {

    const { oldPassword , newPassword } = req.body;
    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Password missing")
    }

    const user = await User.findById(req.user?.id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401,"unthorized access invalid old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password change successfully"))

})

const getUserProfile = asyncHandler  ( async (req,res) => {

    const user = await User.findById(req.user?.id).select("-password -__v -createdAt -updatedAt -watchHistory -refreshToken")
    if(!user){
        throw new ApiError(404,"unable to get user")
    }

    return res
    .status(200)
    .json( new ApiResponse(200,user,"user fetched successfully"))
})

const updateProfile = asyncHandler(async (req, res) => {

    if (!req.body && !req.files) {
        throw new ApiError(400, "Nothing to update");
    }

    const { newUsername, newFullname } = req.body || {};

    if (!newUsername && !newFullname && !req.files) {
        throw new ApiError(400, "Enter something to update");
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Update text fields
    if (newUsername) user.username = newUsername;
    if (newFullname) user.fullname = newFullname;

    // Handle files
    if (req.files) {
        if (req.files.avatar) {
            const uploadedAvatar = await uploadImage(req.files.avatar[0].path);
            user.avatar = uploadedAvatar.url;
        }

        if (req.files.coverimage) {
            const uploadedCover = await uploadImage(req.files.coverimage[0].path);
            user.coverimage = uploadedCover.url;
        }
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id)
        .select("-password -__v -createdAt -updatedAt -watchHistory -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});


export { registerUser , loginUser , logoutUser , getAccessToken , getUserProfile , passwordChange , updateProfile };