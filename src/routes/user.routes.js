import { Router } from 'express';
import { 
    registerUser , 
    loginUser , 
    logoutUser , 
    getAccessToken ,  
    getUserProfile, 
    passwordChange , 
    updateProfile, 
    getChannelProfile 
} from '../controllers/user.controller.js';
import  isLogin  from '../middlewares/isLogin.middleware.js';
import { upload } from "../middlewares/multer.middleware.js" 


const route = Router()

route.post("/register", upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverimage",
        maxCount:1
    }
]) , registerUser);

route.post("/login", loginUser);
route.post("/logout", isLogin, logoutUser);
route.get("/get-access-token", getAccessToken);
route.get("/getProfile",isLogin,getUserProfile);
route.post("/change-password",isLogin,passwordChange);
route.post("/update-profile", isLogin, upload.fields([
    {
        name:"avatar",maxCount:1
    },
    {
        name:"coverimage",maxCount:1
    }
]), updateProfile);
route.get("/me/:username" , isLogin , getChannelProfile);

export default route;