import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const isLogin = asyncHandler((req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    req.user = { id: decoded.userId };
    next();
});

export default isLogin;
