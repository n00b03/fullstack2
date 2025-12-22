import { Router } from 'express';
import { registerUser , loginUser , logoutUser } from '../controllers/user.controller.js';
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

export default route;